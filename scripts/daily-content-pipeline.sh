#!/usr/bin/env bash
# Daily launchd/cron entry point for the staging-first content campaign.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

LOG_DIR=".omc/content-pipeline/daily-log"
mkdir -p "$LOG_DIR"
LOG="$LOG_DIR/run-$(date +%Y-%m-%d).log"

# launchd does not inherit the interactive shell environment.
[ -f .env ] && set -a && source .env && set +a

# Bulk article generation is intentionally off by default. Re-enabling it is a
# deliberate operational decision, not a side effect of a scheduled job.
if [[ "${CONTENT_CAMPAIGN_ENABLED:-false}" != "true" ]]; then
	echo "Daily content campaign is disabled; no staging drafts were generated." >> "$LOG"
	exit 0
fi

echo "=== Daily campaign start: $(date) ===" | tee -a "$LOG"
CAMPAIGN_ARGS=("$@")
HAS_RELEASE_FLAG=false
for ARG in "${CAMPAIGN_ARGS[@]}"; do
	if [[ "$ARG" == "--release" || "$ARG" == "--no-release" ]]; then
		HAS_RELEASE_FLAG=true
		break
	fi
done
if [[ "$HAS_RELEASE_FLAG" == false && "${CAMPAIGN_AUTO_RELEASE:-false}" == "true" ]]; then
	CAMPAIGN_ARGS+=(--release)
fi
if [[ "${CAMPAIGN_AUTO_INDEXNOW:-true}" != "true" ]]; then
	CAMPAIGN_ARGS+=(--no-indexnow)
fi
echo "→ Auto release: ${CAMPAIGN_AUTO_RELEASE:-false}; auto IndexNow: ${CAMPAIGN_AUTO_INDEXNOW:-true}" | tee -a "$LOG"
# Replace the launcher shell so launchd sends SIGTERM directly to Node, which
# owns the command-group cleanup logic for a bounded campaign run.
exec node scripts/content-campaign-daily.mjs "${CAMPAIGN_ARGS[@]}" >> "$LOG" 2>&1
