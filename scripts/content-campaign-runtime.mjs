import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { spawn } from 'node:child_process';

const LOCK_TAKEOVER_ATTEMPTS = 8;
const PROCESS_GROUP_POLL_MS = 200;
const PROCESS_GROUP_EXIT_GRACE_MS = 1500;
const PROCESS_GROUP_TERM_GRACE_MS = 10000;
const PROCESS_GROUP_KILL_GRACE_MS = 5000;
export const MAX_TIMER_MS = 2_147_483_647;
export const NESTED_COMMAND_SHUTDOWN_GRACE_MS = PROCESS_GROUP_TERM_GRACE_MS
  + PROCESS_GROUP_KILL_GRACE_MS
  + PROCESS_GROUP_EXIT_GRACE_MS
  + 2000;

function readLockRecord(lockPath) {
  try {
    return JSON.parse(fs.readFileSync(lockPath, 'utf8'));
  } catch {
    return null;
  }
}

function processIsActive(pid) {
  if (!Number.isInteger(pid) || pid <= 0) return false;
  try {
    process.kill(pid, 0);
    return true;
  } catch (error) {
    return error.code === 'EPERM';
  }
}

function sameFile(left, right) {
  return left && right && left.dev === right.dev && left.ino === right.ino;
}

export function isSafePipelineIdentifier(value) {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/i.test(value || '');
}

export function resolvePathWithin(root, ...segments) {
  const resolvedRoot = path.resolve(root);
  const resolvedPath = path.resolve(resolvedRoot, ...segments);
  if (resolvedPath !== resolvedRoot && !resolvedPath.startsWith(`${resolvedRoot}${path.sep}`)) {
    throw new Error(`Path escapes its allowed root: ${resolvedPath}`);
  }
  return resolvedPath;
}

export function isValidTimerDuration(value) {
  return Number.isInteger(value) && value > 0 && value <= MAX_TIMER_MS;
}

function pause(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

function processGroupIsActive(pid, detached) {
  if (!pid) return false;
  try {
    if (detached) process.kill(-pid, 0);
    else process.kill(pid, 0);
    return true;
  } catch (error) {
    return error.code === 'EPERM';
  }
}

async function waitForProcessGroupExit(pid, detached, timeoutMs) {
  const deadline = Date.now() + timeoutMs;
  while (processGroupIsActive(pid, detached)) {
    if (Date.now() >= deadline) return false;
    await pause(PROCESS_GROUP_POLL_MS);
  }
  return true;
}

function signalProcessGroup(child, detached, signal, label) {
  if (!child.pid) return;
  try {
    if (detached) process.kill(-child.pid, signal);
    else child.kill(signal);
  } catch (error) {
    if (error.code !== 'ESRCH') console.error(`Unable to send ${signal} to ${label}: ${error.message}`);
  }
}

async function stopProcessGroup(child, detached, label, termGraceMs = PROCESS_GROUP_TERM_GRACE_MS) {
  if (!child.pid || !processGroupIsActive(child.pid, detached)) return true;
  signalProcessGroup(child, detached, 'SIGTERM', label);
  if (await waitForProcessGroupExit(child.pid, detached, termGraceMs)) return true;
  signalProcessGroup(child, detached, 'SIGKILL', label);
  return waitForProcessGroupExit(child.pid, detached, PROCESS_GROUP_KILL_GRACE_MS);
}

function restoreQuarantinedLock(lockPath, quarantinePath) {
  try {
    fs.linkSync(quarantinePath, lockPath);
    fs.rmSync(quarantinePath, { force: true });
    return true;
  } catch {
    return false;
  }
}

function restoreReleasedLock(lockPath, claimPath) {
  try {
    fs.linkSync(claimPath, lockPath);
    fs.rmSync(claimPath, { force: true });
    return true;
  } catch {
    return false;
  }
}

export function acquireOwnedLock(lockPath, { label, staleMs }) {
  const token = crypto.randomUUID();
  const owner = { token, pid: process.pid, startedAt: new Date().toISOString() };
  fs.mkdirSync(path.dirname(lockPath), { recursive: true });

  for (let attempt = 0; attempt < LOCK_TAKEOVER_ATTEMPTS; attempt += 1) {
    try {
      const descriptor = fs.openSync(lockPath, 'wx');
      fs.writeFileSync(descriptor, `${JSON.stringify(owner)}\n`);
      fs.closeSync(descriptor);
      return () => releaseOwnedLock(lockPath, owner, label);
    } catch (error) {
      if (error.code !== 'EEXIST') throw error;
    }

    let previousStat;
    try {
      previousStat = fs.statSync(lockPath);
    } catch (error) {
      if (error.code === 'ENOENT') continue;
      throw error;
    }
    const previousOwner = readLockRecord(lockPath);
    if (processIsActive(previousOwner?.pid)) {
      throw new Error(`${label} is already active: ${lockPath}`);
    }
    if (Date.now() - previousStat.mtimeMs < staleMs) {
      throw new Error(`A recent ${label} lock needs manual review: ${lockPath}`);
    }

    const quarantinePath = `${lockPath}.stale-${process.pid}-${token}-${attempt}`;
    try {
      fs.renameSync(lockPath, quarantinePath);
    } catch (error) {
      if (error.code === 'ENOENT') continue;
      throw error;
    }

    const quarantinedStat = (() => {
      try {
        return fs.statSync(quarantinePath);
      } catch {
        return null;
      }
    })();
    if (!sameFile(previousStat, quarantinedStat)) {
      const restored = restoreQuarantinedLock(lockPath, quarantinePath);
      throw new Error(`${label} lock changed during stale-lock takeover${restored ? '' : '; manual recovery is required'}`);
    }
    fs.rmSync(quarantinePath, { force: true });
  }

  throw new Error(`Unable to acquire ${label} after repeated concurrent lock changes: ${lockPath}`);
}

function releaseOwnedLock(lockPath, owner, label) {
  const claimPath = `${lockPath}.release-${process.pid}-${owner.token}`;
  const expectedStat = fs.statSync(lockPath);
  const currentOwner = readLockRecord(lockPath);
  if (currentOwner?.token !== owner.token) {
    throw new Error(`${label} lock ownership changed before release; preserving the lock for manual recovery`);
  }

  fs.renameSync(lockPath, claimPath);
  const claimStat = fs.statSync(claimPath);
  const claimedOwner = readLockRecord(claimPath);
  if (!sameFile(expectedStat, claimStat) || claimedOwner?.token !== owner.token) {
    const restored = restoreReleasedLock(lockPath, claimPath);
    throw new Error(`${label} ownership changed during release${restored ? '; replacement lock was restored' : '; manual recovery is required'}`);
  }
  fs.rmSync(claimPath);
}

export function createShutdownSignal(label) {
  const controller = new AbortController();
  const abort = (signal) => {
    if (controller.signal.aborted) return;
    console.error(`${label} received ${signal}; stopping the active command group before cleanup.`);
    controller.abort(new Error(`${label} interrupted by ${signal}`));
  };
  const onInterrupt = () => abort('SIGINT');
  const onTerminate = () => abort('SIGTERM');
  process.once('SIGINT', onInterrupt);
  process.once('SIGTERM', onTerminate);
  return {
    signal: controller.signal,
    dispose() {
      process.removeListener('SIGINT', onInterrupt);
      process.removeListener('SIGTERM', onTerminate);
    },
  };
}

export function runBoundedCommand(command, commandArgs, {
  label,
  cwd,
  env = process.env,
  timeoutMs,
  signal,
  captureOutput = false,
  shutdownGraceMs = PROCESS_GROUP_TERM_GRACE_MS,
}) {
  if (!isValidTimerDuration(timeoutMs)) {
    return Promise.reject(new Error(`${label} needs a positive integer timeout no greater than ${MAX_TIMER_MS} ms`));
  }
  if (!isValidTimerDuration(shutdownGraceMs)) {
    return Promise.reject(new Error(`${label} needs a positive integer shutdown grace period no greater than ${MAX_TIMER_MS} ms`));
  }
  if (signal?.aborted) {
    return Promise.reject(new Error(`${label} ${signal.reason?.message || 'was interrupted before it started'}`));
  }
  return new Promise((resolve, reject) => {
    const detached = process.platform !== 'win32';
    const child = spawn(command, commandArgs, {
      cwd,
      env,
      detached,
      stdio: captureOutput ? ['ignore', 'pipe', 'pipe'] : 'inherit',
    });
    let output = '';
    let settled = false;
    let stopping = false;
    let deadlineTimer = null;

    const cleanup = () => {
      if (deadlineTimer) clearTimeout(deadlineTimer);
      if (signal) signal.removeEventListener('abort', abortHandler);
    };
    const settle = (callback, value) => {
      if (settled) return;
      settled = true;
      cleanup();
      callback(value);
    };
    const stopAndReject = async (reason) => {
      if (settled || stopping) return;
      stopping = true;
      const stopped = await stopProcessGroup(child, detached, label, shutdownGraceMs);
      const suffix = stopped ? '' : '; process group could not be confirmed stopped, so do not retry until it is inspected';
      settle(reject, new Error(`${label} ${reason}${suffix}`));
    };
    const abortHandler = () => {
      const reason = signal?.reason?.message || 'was interrupted';
      void stopAndReject(reason);
    };

    if (captureOutput) {
      child.stdout.on('data', (chunk) => {
        output += chunk;
        process.stdout.write(chunk);
      });
      child.stderr.on('data', (chunk) => {
        output += chunk;
        process.stderr.write(chunk);
      });
    }
    child.once('error', (error) => settle(reject, new Error(`${label} could not start: ${error.message}`)));
    child.once('exit', (code, exitSignal) => {
      if (settled || stopping) return;
      if (deadlineTimer) clearTimeout(deadlineTimer);
      void (async () => {
        const groupExited = await waitForProcessGroupExit(child.pid, detached, PROCESS_GROUP_EXIT_GRACE_MS);
        if (!groupExited) {
          await stopAndReject('completed but left child processes running');
          return;
        }
        if (code === 0) settle(resolve, output);
        else settle(reject, new Error(`${label} failed${exitSignal ? ` (${exitSignal})` : ` (exit ${code})`}`));
      })();
    });

    deadlineTimer = setTimeout(() => {
      void stopAndReject(`exceeded its ${Math.round(timeoutMs / 60000)} minute timeout`);
    }, timeoutMs);
    if (signal) {
      if (signal.aborted) abortHandler();
      else signal.addEventListener('abort', abortHandler, { once: true });
    }
  });
}