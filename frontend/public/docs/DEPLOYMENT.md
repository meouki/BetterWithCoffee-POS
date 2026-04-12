<!-- GSD:docs-update -->
# Deployment Guide — PulsePoint POS

PulsePoint is designed primarily for **local/on-premises deployment** in a single-location café environment. This guide covers both the standard Windows installer deployment and the manual production setup.

---

## Deployment Targets

| Target | Method | Best For |
|--------|--------|----------|
| Windows PC (local) | Inno Setup `.exe` installer | Café counter PCs, dedicated POS machines |
| Any OS (manual) | Clone + build + `node server.js` | Development, testing, Linux servers |
| Remote access | Cloudflare Quick Tunnel | Accessing from a tablet, phone, or offsite |

---

## Option A: Windows Installer (Standard Deployment)

### Building the Installer

Prerequisites:
- [Inno Setup](https://jrsoftware.org/isdl.php) installed on the build machine
- Pre-built frontend: `frontend/dist/` must exist (run `npm run build` first)

```bash
# Step 1: Build the frontend
cd frontend
npm run build

# Step 2: Compile the installer
# Open installer/pulsepoint.iss in Inno Setup Compiler and click Build
# Output: installer/Output/PulsePoint-Setup.exe
```

### What the Installer Does
1. Checks for and silently installs bundled **Node.js v24.x MSI** if needed
2. Copies all backend source files to `C:\Program Files\PulsePoint\backend_rewrite\`
3. Copies the pre-built frontend `dist/` to `C:\Program Files\PulsePoint\frontend\dist\`
4. Runs `npm install` for backend dependencies (hidden terminal window)
5. Runs `installer/setup-db.js` to create database tables and seed default data
6. Creates Desktop and Start Menu shortcuts pointing to `start.bat`
7. Optionally launches the app after install completes

### Install Location
```
C:\Program Files\PulsePoint\
├── backend_rewrite\     # Express API server
├── frontend\dist\       # Pre-built React app
├── installer\           # Setup scripts
├── pos_data.sqlite      # Database (created on first run)
└── start.bat            # Windows launcher
```

> **Permissions:** The installer grants user-modify permissions to the install directory so Node.js can write the SQLite database and upload images without elevation.

### Running the Installed App
Double-click the Desktop shortcut or `start.bat`. This:
1. Kills any existing `node.exe` processes to prevent port conflicts
2. Starts `node backend_rewrite/server.js`  
3. Opens `http://localhost:5000` in the default browser after a 2-second delay

---

## Option B: Manual Production Setup

For Linux, macOS, or custom Windows setups without the installer:

```bash
# 1. Clone the repo
git clone <repo-url> PulsePoint
cd PulsePoint

# 2. Install backend dependencies
cd backend_rewrite
npm install --production

# 3. Build the frontend
cd ../frontend
npm install
npm run build

# 4. Configure environment
cd ../backend_rewrite
cp .env.example .env
# Edit .env: set PORT, ENABLE_CLOUD, FINANCIAL_BACKDOOR_KEY

# 5. Initialize the database
node ../installer/setup-db.js

# 6. Start the server
node server.js
```

### Keeping It Running (Linux)

Use a process manager like `pm2`:
```bash
npm install -g pm2
cd backend_rewrite
pm2 start server.js --name pulsepoint
pm2 save
pm2 startup    # auto-start on reboot
```

> **Note:** PulsePoint's Node.js cluster mode provides basic crash recovery already. `pm2` adds persistent startup management.

---

## Multi-Device Access (LAN)

PulsePoint binds to `0.0.0.0` (all network interfaces) by default. On startup, it prints all available LAN IPs:

```
Server running on port 5000
LAN access: http://192.168.1.100:5000
```

Any device on the same Wi-Fi/LAN network can access the POS by visiting that URL. To allow cashiers on tablets or other PCs:
1. Ensure Windows Firewall allows inbound connections on port 5000
2. Share the LAN URL with the device
3. Log in with the cashier's credentials

---

## Remote Cloud Access (Cloudflare Tunnel)

For access from outside the local network (e.g., monitoring sales from home):

```powershell
# Install cloudflared (Windows — run as Administrator)
winget install cloudflare.cloudflared

# Enable tunnel in backend .env
ENABLE_CLOUD=true
```

Or run the helper script:
```powershell
cd installer
.\setup-cloud.ps1
```

Restart the server. The generated `*.trycloudflare.com` URL is shown in the Dashboard's **Cloud Status** panel. Share this URL for remote access.

> ⚠️ **Cloudflare Quick Tunnels** are ephemeral — the URL changes each time the server restarts. For a permanent URL, set up a named Cloudflare Tunnel with a registered domain.

---

## Database Backup & Restore

### Backup
Dashboard → Settings → Data Management → **Export**

Downloads `pos_data.sqlite` as a file. Store copies in a secure location (USB drive, Google Drive, etc.).

### Restore
Dashboard → Settings → Data Management → **Import**

Upload a `.sqlite` file and confirm with the Master password. The server automatically restarts and boots with the restored database.

### Manual Backup
```bash
# Copy the SQLite file to a safe location
copy pos_data.sqlite pos_data_backup_2026-04-12.sqlite
```

---

## Updating PulsePoint

### Via Installer
Re-run `PulsePoint-Setup.exe`. The installer preserves `pos_data.sqlite` and overwrites application files.

### Manual Update
```bash
git pull origin main
cd frontend && npm run build
cd ../backend_rewrite && node server.js
```

> Always back up `pos_data.sqlite` before updating.

---

## Port Configuration

Default port is `5000`. To change it:
1. Edit `backend_rewrite/.env`: `PORT=8080`
2. Edit `frontend/.env`: `VITE_API_URL=http://localhost:8080`
3. Rebuild the frontend: `cd frontend && npm run build`
4. Restart the server
