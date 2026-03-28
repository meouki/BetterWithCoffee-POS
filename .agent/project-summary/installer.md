# Installer Summary

The installer packages the entire PulsePoint POS application into a single Windows `.exe` using Inno Setup. It handles Node.js installation, dependency setup, database initialization, and desktop shortcuts.

---

## Files

### `pulsepoint.iss`
**Inno Setup script** that compiles into `PulsePoint-Setup.exe`. Installation steps:
1. Silently installs bundled Node.js v24.14.0 MSI
2. Runs `npm install` in the backend directory (hidden)
3. Runs `setup-db.js` to create tables and seed data
4. Optionally launches the app post-install

Bundles: backend source (excluding node_modules), pre-built frontend (`dist/`), installer scripts. Creates desktop and Start Menu shortcuts. Installs to `C:\Program Files\PulsePoint` with user-modify permissions. Requires admin privileges.

### `setup-db.js`
**First-run database setup script.** Idempotent — safe to re-run. Auto-detects whether running from dev or production paths. Steps:
1. Connects to SQLite via Sequelize
2. Syncs all models (creates/alters tables without destroying data)
3. Seeds Master user (`master`/`master123`) if none exists
4. Seeds default categories (Cold Drinks, Hot Drinks, Blended Drinks, Frappe Drinks, Pastries) if none exist

### `start.bat`
**Windows batch launcher.** Kills any existing `node.exe` processes to prevent port conflicts, starts the backend server (`node backend_rewrite/server.js`), and opens `http://localhost:5000` in the default browser after a 2-second delay. The terminal window stays open — closing it stops the server.

### `setup-cloud.ps1`
**PowerShell helper** for enabling cloud access. Checks for `winget`, installs `cloudflared` via `winget install cloudflare.cloudflared` if not present, and sets `ENABLE_CLOUD=true` in the backend `.env` file.

### `node-v24.14.0-x64.msi`
Bundled Node.js installer (32MB). Installed silently during setup.
