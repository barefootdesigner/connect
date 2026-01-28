# iStep Connect - Deployment & Architecture

## Overview

Employee portal for The Nursery Family network. Replaces the old WordPress hub system.

## Where Everything Lives

| Component | Service | URL/Location |
|-----------|---------|--------------|
| Frontend App | Vercel | Auto-deployed from GitHub |
| Database | Supabase | PostgreSQL hosted by Supabase |
| File Storage | Supabase | Storage buckets for uploads |
| Git Repo | GitHub | https://github.com/barefootdesigner/connect |
| iCare Chatbot | Railway | Separate service, configured via admin panel |

## Environment Variables

Required in Vercel dashboard (Settings → Environment Variables):

```
NEXT_PUBLIC_SUPABASE_URL=https://lnfuiilyyrguiyxolqvq.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[your-anon-key]
```

Local development uses `.env.local` (git-ignored, not in repo).

## Deployment Workflow

1. Make changes locally
2. Test at `http://localhost:3001` (or any free port)
3. Commit and push:
   ```bash
   git add .
   git commit -m "your message"
   git push
   ```
4. Vercel auto-deploys in ~60 seconds

## Local Development

```bash
cd /Users/adambanister/Desktop/standalone/nursery-portal
npm run dev -- -p 3001
```

Port 3001 avoids conflicts with other local projects (3000, 8000, 8888 often in use).

## Supabase Storage Buckets

- `policies` - Policy documents
- `handbooks` - Employee handbooks
- `training` - Training materials
- `hr-library` - HR documents (password protected section)
- `wellbeing` - Wellbeing hub images

All buckets have public read access via RLS policies.

## Database Tables

- `company_updates` - News/announcements
- `policies`, `handbooks`, `training_files` - Document metadata
- `training_content`, `benefits_content`, `wellbeing_content` - Rich text content
- `wellbeing_images` - Image gallery metadata
- `hr_library_sections`, `hr_library_files` - Folder structure for HR docs
- `nurseries`, `jobs` - Vacancy system with geocoding
- `icare_settings` - Chat configuration

Migrations in `/supabase/migrations/`.

## Authentication

- Frontend password: `istep2024` (stored in layout, localStorage persistence)
- HR Library extra password: `hr`
- No backend auth - relies on Supabase anon key + RLS

## Admin Panel

Access at `/admin/*` routes:
- `/admin/company-updates`
- `/admin/policies`
- `/admin/handbooks`
- `/admin/training`
- `/admin/benefits`
- `/admin/wellbeing-hub`
- `/admin/hr-library`
- `/admin/vacancies` (CSV import)
- `/admin/icare-companion`

## Tech Stack

- Next.js 16 + React 19
- TypeScript
- Tailwind CSS
- Supabase (Postgres + Storage)
- TipTap (rich text editor)
- Framer Motion (animations)

## Notes

- Vercel handles SSL automatically
- Custom domain can be added in Vercel dashboard → Settings → Domains
- Build logs visible in Vercel dashboard
- Failed builds keep previous version live
