import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const EXPECTED_PROJECT_NAME = "cooldrivepro";
const EXPECTED_OUTPUT_DIR = "./dist/client";
const REQUEST_TIMEOUT_MS = 15000;

const HOST_CHECKS = [
  {
    url: "https://cooldrivepro.com/",
    label: "apex",
    allowRedirect: false,
  },
  {
    url: "https://www.cooldrivepro.com/",
    label: "www",
    allowRedirect: true,
    redirectPrefix: "https://cooldrivepro.com/",
  },
];

function parseTomlValue(source, key) {
  const pattern = new RegExp(`^${key}\\s*=\\s*\"([^\"]+)\"`, "m");
  return source.match(pattern)?.[1];
}

async function verifyWranglerConfig() {
  const wranglerPath = path.join(process.cwd(), "wrangler.toml");
  const content = await fs.readFile(wranglerPath, "utf8");
  const name = parseTomlValue(content, "name");
  const outputDir = parseTomlValue(content, "pages_build_output_dir");

  const issues = [];

  if (name !== EXPECTED_PROJECT_NAME) {
    issues.push(`wrangler.toml name is ${name || "missing"}, expected ${EXPECTED_PROJECT_NAME}`);
  }

  if (outputDir !== EXPECTED_OUTPUT_DIR) {
    issues.push(`wrangler.toml pages_build_output_dir is ${outputDir || "missing"}, expected ${EXPECTED_OUTPUT_DIR}`);
  }

  return {
    ok: issues.length === 0,
    issues,
  };
}

function formatStatusLine(result) {
  if (result.ok) {
    return `PASS ${result.label}: ${result.summary}`;
  }

  return `FAIL ${result.label}: ${result.summary}`;
}

async function verifyHost(check) {
  try {
    const response = await fetch(check.url, {
      method: "GET",
      redirect: "manual",
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      headers: {
        "user-agent": "CoolDrivePro Production Host Verifier",
      },
    });

    const locationHeader = response.headers.get("location");
    const resolvedLocation = locationHeader ? new URL(locationHeader, check.url).href : null;

    if (response.status >= 200 && response.status < 300) {
      return {
        ok: true,
        label: check.label,
        summary: `${check.url} returned ${response.status}`,
      };
    }

    if (
      check.allowRedirect
      && response.status >= 300
      && response.status < 400
      && resolvedLocation
      && resolvedLocation.startsWith(check.redirectPrefix)
    ) {
      return {
        ok: true,
        label: check.label,
        summary: `${check.url} redirected to ${resolvedLocation}`,
      };
    }

    return {
      ok: false,
      label: check.label,
      summary: `${check.url} returned ${response.status}${resolvedLocation ? ` -> ${resolvedLocation}` : ""}`,
    };
  } catch (error) {
    return {
      ok: false,
      label: check.label,
      summary: `${check.url} failed with ${error.message}`,
    };
  }
}

async function main() {
  const configCheck = await verifyWranglerConfig();

  if (!configCheck.ok) {
    console.error("Production deploy verification failed before host checks:");
    for (const issue of configCheck.issues) {
      console.error(`- ${issue}`);
    }
    process.exit(1);
  }

  const results = await Promise.all(HOST_CHECKS.map((check) => verifyHost(check)));
  for (const result of results) {
    console.log(formatStatusLine(result));
  }

  if (results.some((result) => !result.ok)) {
    console.error("Production host verification failed.");
    process.exit(1);
  }

  console.log("Production host verification passed.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});