# Session Notes

## 2026-03-16
- Got up to speed on the iStep Connect project (nursery employee portal for The Nursery Family)
- Added admin password gate (`nursery@dm1n`) via `/app/admin/layout.tsx`
- Added admin nav bar across all admin sections
- Synced documents from WordPress XML export to Supabase:
  - Policies: updated from 2025 .docx to 2026 PDFs (ALL POLICIES 2026, HR GDPR & Equality Policies)
  - Handbooks: updated to latest (Childcare Handbook, Support Centre Handbook)
  - Training: 9 PDFs already matched, no changes needed
- HR Library commented out from frontend nav (client may want it back later — routes/pages still exist)
- Uploaded 47 jobs from CSV (`/Users/adambanister/Desktop/nurseryjobmachine/jobs-march-2026.csv`)
  - CSV was missing `nursery_location` column — script auto-filled from nurseries DB
  - CSV had status "Live" but frontend filters on "active" — updated in DB
- Removed Referral Bonus and Golden Handshake from benefits page content (client request)
- Supabase backup saved at `/Users/adambanister/Desktop/standalone/supabase-backup-2026-03-16.json`

## Useful scripts in project root (`/Users/adambanister/Desktop/standalone/`)
- `backup-supabase.js` — dumps all Supabase tables to JSON
- `sync-from-wp.js` — downloads policies/handbooks PDFs from WP and uploads to Supabase
- `upload-jobs.js` — parses jobs CSV, matches to nurseries, fills locations, inserts to DB

## Live URL
- **Production:** https://connect-eta-seven.vercel.app/
- Will be embedded via iframe into the master site (staff area)

## Outstanding
- npm cache has root-owned files — needs `sudo chown -R $(whoami) ~/.npm` before Vercel CLI can be installed
- GitHub repo: https://github.com/barefootdesigner/connect
