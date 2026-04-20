---
name: cooldrivepro-workflows
description: Project-specific OMC workflow router for SEO batch, locale QA, and code review in CoolDrivePro
level: 2
triggers:
  - cooldrivepro seo
  - blog locale validation
  - cooldrivepro code review
  - translate blog locales
---

# CoolDrivePro Workflows

Use this project skill to route requests into one of the three default lanes below.

## 1) SEO Batch Lane

Use when the request mentions batch translation, localized SEO generation, or sitemap/hreflang refresh.

Primary sequence:
- npm run translate:blog-locales -- --langs=<lang1,lang2,...>
- npm run sync:blog-index
- npm run build

OMC helpers:
- node scripts/omc-workflow.mjs seo-batch
- node scripts/omc-workflow.mjs seo-batch --ask --agent=planner

## 2) Locale QA Lane

Use when the request mentions multilingual validation, locale completeness, or JSON/index consistency checks.

Primary sequence:
- npm run sync:blog-index
- npm run validate:blog-locales

OMC helpers:
- node scripts/omc-workflow.mjs locale-qa
- node scripts/omc-workflow.mjs locale-qa --ask --agent=verifier

## 3) Code Review Lane

Use when the request asks for review, risk analysis, or pre-release quality checks.

Primary sequence:
- npm run build
- node scripts/omc-workflow.mjs code-review

OMC helpers:
- node scripts/omc-workflow.mjs code-review --ask --agent=code-reviewer --scope=changed-files

## Review Rules

- Findings first, ordered by severity.
- Prioritize regressions, SEO/i18n correctness, security, and missing tests.
- Keep summaries short and actionable.

Task: {{ARGUMENTS}}
