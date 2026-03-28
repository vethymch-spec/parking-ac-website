# Railway Environment Variables Setup

Configure these variables in Railway → Project → Variables panel.

## Required Variables

| Variable | Value | Notes |
|----------|-------|-------|
| `NODE_ENV` | `production` | Required |
| `PORT` | `3000` | Railway auto-injects this, but set as fallback |
| `DATABASE_URL` | *(auto-injected by Railway MySQL plugin)* | Format: `mysql://user:pass@host:3306/dbname` |
| `JWT_SECRET` | *(generate with: `openssl rand -hex 32`)* | Session signing key |
| `RESEND_API_KEY` | `re_xxxxxxxxxxxx` | Keep your existing Resend key |

## Variables to REMOVE (Manus-specific, not needed on Railway)

These are Manus platform variables that do NOT work on external servers:
- `VITE_APP_ID` — Manus OAuth app ID (remove)
- `OAUTH_SERVER_URL` — Manus OAuth backend (remove)
- `VITE_OAUTH_PORTAL_URL` — Manus login portal (remove)
- `BUILT_IN_FORGE_API_URL` — Manus LLM API (remove unless replacing with OpenAI)
- `BUILT_IN_FORGE_API_KEY` — Manus LLM key (remove unless replacing with OpenAI)
- `VITE_FRONTEND_FORGE_API_KEY` — Manus frontend key (remove)
- `VITE_FRONTEND_FORGE_API_URL` — Manus frontend URL (remove)
- `VITE_ANALYTICS_ENDPOINT` — Manus analytics (remove)
- `VITE_ANALYTICS_WEBSITE_ID` — Manus analytics (remove)
- `OWNER_OPEN_ID` — Manus owner ID (remove)
- `OWNER_NAME` — Manus owner name (remove)

## After Setting Variables

Run database setup:
```bash
# In Railway shell or locally with Railway DATABASE_URL
pnpm db:push

# Then seed initial data
mysql -h HOST -u USER -p DATABASE < railway-deploy/seed-data.sql
```

## Notes

- Manus OAuth (user login via Manus) will NOT work on Railway
- Customer support login (/support/login) uses email+password — works fine
- Blog images now use jsDelivr CDN (GitHub-backed) — no Manus dependency
- All 86 blog article JSON files are in client/public/data/blog/ — no DB needed
