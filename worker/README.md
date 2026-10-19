# FloraHearth sync Worker

Optional. Lets FloraHearth keep one backup of your garden data in Cloudflare D1 so you can move it between devices (Journal & ROI → Sync & Backup).

## Setup

1. Create the database and table:

   ```sh
   npx wrangler d1 create florahearth-sync
   npx wrangler d1 execute florahearth-sync --remote --command \
     "CREATE TABLE IF NOT EXISTS backups (id TEXT PRIMARY KEY, body TEXT NOT NULL, exported_at TEXT, updated_at TEXT);"
   ```

2. Create `worker/wrangler.toml`, pasting the `database_id` printed by step 1:

   ```toml
   name = "florahearth-sync"
   main = "florahearth-sync.js"
   compatibility_date = "2026-10-01"

   [vars]
   # Comma-separated list of sites allowed to call the Worker
   ALLOWED_ORIGIN = "https://cptnope.github.io"

   [[d1_databases]]
   binding = "DB"
   database_name = "florahearth-sync"
   database_id = "<paste id here>"
   ```

3. Set a long random token and deploy:

   ```sh
   cd worker
   openssl rand -base64 32 | npx wrangler secret put SYNC_TOKEN
   npx wrangler deploy
   ```

4. In FloraHearth, enter the Worker URL and the same token, then **Push** from the device that has your real data. On other devices, **Pull**.

## How it behaves

- Every request needs `Authorization: Bearer <SYNC_TOKEN>`; the Worker refuses to run without a token of 24+ characters.
- Only origins listed in `ALLOWED_ORIGIN` get CORS access.
- One backup is stored. FloraHearth checks its timestamp before overwriting it and asks you to confirm if another device pushed more recently.
- Data is plain JSON over HTTPS, not end-to-end encrypted. Journal photos stay on each device.
