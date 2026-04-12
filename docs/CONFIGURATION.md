<!-- GSD:docs-update -->
# Configuration Reference — PulsePoint POS

This document covers all environment variables, runtime settings, local storage keys, and seed data for the PulsePoint POS system.

---

## 1. Backend Environment Variables

File: `backend_rewrite/.env` (copy from `backend_rewrite/.env.example`)

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `5000` | Port the Express server listens on. The app binds to `0.0.0.0` so it is accessible from other devices on the LAN. |
| `ENABLE_CLOUD` | `false` | Set to `true` to start a Cloudflare Quick Tunnel on boot. Requires `cloudflared` to be installed. |
| `FINANCIAL_BACKDOOR_KEY` | *(unset)* | If set, this key can be passed as the password in `POST /api/users/login` to bypass normal password authentication. Used for emergency recovery only. |

> **Note:** If the `.env` file does not exist, the server will still start using its built-in defaults (`PORT=5000`, `ENABLE_CLOUD=false`).

---

## 2. Frontend Environment Variables

File: `frontend/.env` (copy from `frontend/.env.example`)

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_URL` | `http://localhost:5000` | Base URL for all API calls. The `apiClient.js` prepends this to every request path. Change this if the backend runs on a different host or port (e.g., for cloud deployments). |

---

## 3. Database

- **Engine:** SQLite (via Sequelize ORM)
- **Driver:** `sqlite3` npm package
- **File location:** `pos_data.sqlite` at the **project root**
  - Resolved from backend as: `../../pos_data.sqlite` (relative to `backend_rewrite/config/db.js`)
- **Sync strategy:** `sequelize.sync()` — creates and alters tables without dropping data
- **Backup:** Use the Settings page → Data Management → Export to download the raw `.sqlite` file

---

## 4. Seed Data (First Boot)

On every server startup, `server.js` checks for and seeds the following if missing:

### Master Account
| Field | Value |
|-------|-------|
| `username` | `master` |
| `password` | `master123` (hashed with bcrypt on save) |
| `role` | `Master` |
| `is_active` | `true` |

> ⚠️ **Change the master password immediately after first login** via the Settings panel or User Management.

### Default Categories
The following categories are seeded if no categories exist:
- Cold Drinks
- Hot Drinks
- Blended Drinks
- Snacks

---

## 5. Image Uploads

- **Middleware:** `multer` (file reception) + `sharp` (image processing)
- **Storage path:** `backend_rewrite/uploads/` (served at `/uploads/` URL path)
- **Output format:** WebP, resized to **400px width** (aspect ratio preserved)
- **Naming:** Original filename stem + `.webp` extension
- **Referenced in DB:** `products.image_url` stores the `/uploads/filename.webp` path

---

## 6. Cloudflare Tunnel Setup

To enable remote access via a public URL:

### Automatic (via Installer)
Run `installer/setup-cloud.ps1` in PowerShell as Administrator. This script:
1. Checks for `winget`
2. Installs `cloudflare.cloudflared` via winget if not present
3. Sets `ENABLE_CLOUD=true` in `backend_rewrite/.env`

### Manual
1. Install `cloudflared`: `winget install cloudflare.cloudflared`
2. Edit `backend_rewrite/.env` and set `ENABLE_CLOUD=true`
3. Restart the server

The `cloudflared` binary is searched at these Windows paths automatically by `tunnelManager.js`:
- `C:\Program Files\Cloudflare\cloudflared\cloudflared.exe`
- `C:\Program Files (x86)\Cloudflare\cloudflared\cloudflared.exe`
- System `PATH`

---

## 7. Frontend localStorage Keys

The frontend persists user preferences and session data in `localStorage` under the following keys:

| Key | Type | Description |
|-----|------|-------------|
| `bwc_user` | JSON object | Authenticated user data: `{ id, username, role, session_id }`. Cleared on logout. |
| `bwc_theme` | `"light"` \| `"dark"` | Active UI theme. Applied as `data-theme` attribute on `<html>`. |
| `bwc_accent` | CSS color string | Active accent color (one of 5 presets). Applied as `--accent` CSS custom property. |
| `bwc_ambient_bg` | `"true"` \| `"false"` | Whether the animated ambient background effect is enabled. Default: `"true"`. |
| `bwc_transition_style` | string | Page transition animation style (e.g., `"slide-left"`, `"fade"`). |
| `bwc_transition_duration` | number (ms) | Page transition animation duration in milliseconds. |

---

## 8. Emergency Account Reset

If the Master account password is lost and the backdoor key is not set:

```bash
cd backend_rewrite
node emergency-reset.js
```

This script connects directly to SQLite, finds or recreates the Master account, and resets the password to `master123`. Safe to re-run.
