#!/usr/bin/env bash
# Local no-LLM SEO report runner. Logs to logs/seo-report.log.
set -u
cd "$(dirname "$0")/.."
mkdir -p logs .omc/seo
export PATH="/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin"
{
  echo "===== $(date '+%Y-%m-%d %H:%M:%S') seo-report start ====="
  node scripts/gsc-keyword-opportunities.mjs || true
  node scripts/competitor-keyword-scan.mjs --domains="${COMPETITOR_DOMAINS:-outequippro.com}" || true
  node scripts/seo-feed-topics.mjs --max=5 || true
  echo "===== $(date '+%Y-%m-%d %H:%M:%S') seo-report done ====="
} >> logs/seo-report.log 2>&1
