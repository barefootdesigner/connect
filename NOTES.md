# Session Notes

## 2026-03-16
- Got up to speed on the iStep Connect project (nursery employee portal)
- Added admin password gate (`nursery@dm1n`) via `/app/admin/layout.tsx`
- Added admin nav bar across all 9 admin sections
- Pushed to GitHub, Vercel auto-deployed
- Latest deploy URL: https://connect-aw2aor53z-adams-projects-0224e83a.vercel.app
- Production alias URL still needs checking in Vercel dashboard (Settings > Domains)
- npm cache has root-owned files — needs `sudo chown -R $(whoami) ~/.npm` before Vercel CLI can be installed
