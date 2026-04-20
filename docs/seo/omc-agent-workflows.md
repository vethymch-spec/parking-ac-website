# CoolDrivePro OMC Agent Workflows

This preset defines three default workflows for this repository.

## Quick Start

- Print workflow templates:
  - npm run omc:workflow:seo-batch
  - npm run omc:workflow:locale-qa
  - npm run omc:workflow:code-review
- Run advisor prompts directly:
  - npm run omc:workflow:seo-batch:ask
  - npm run omc:workflow:locale-qa:ask
  - npm run omc:workflow:code-review:ask

## Workflow A: SEO Batch

Use for localized blog expansion and SEO output refresh.

Suggested execution order:
1. npm run translate:blog-locales -- --langs=fr,de,es,it,pt,ja,ko
2. npm run sync:blog-index
3. npm run build

Expected outputs:
- localized blog JSON files under client/public/data/blog/locales/<lang>/
- refreshed list.json, manifest.json, locale-availability.json
- regenerated static SEO pages and sitemap

## Workflow B: Locale QA

Use for multilingual data quality validation.

Suggested execution order:
1. npm run sync:blog-index
2. npm run validate:blog-locales
3. npm run build

Checks included:
- malformed JSON in locale files
- missing required text fields in localized article payloads
- non-array list/manifest payloads in each locale
- unknown slugs in locale-availability.json

## Workflow C: Code Review

Use before release or after high-impact refactors.

Suggested execution order:
1. npm run build
2. npm run omc:workflow:code-review
3. npm run omc:workflow:code-review:ask

Review focus order:
1. behavioral regressions
2. SEO and i18n correctness
3. security and data handling
4. missing tests and validation gaps

## Notes

- These workflows are project-specific and aligned to existing scripts in this repository.
- For in-session OMC usage, each workflow command prints copy-ready slash command prompts.
