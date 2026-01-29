# Backup: /api/test-db route

This route was removed from the app to fix Vercel build ("Failed to collect page data for /api/test-db").
You can test the database locally with: `node scripts/test-database-connection.js` or by calling your API after deploy.

To restore the route later, create `app/api/test-db/route.ts` and use dynamic import for prisma inside GET (so the module does not load Prisma at build time).
