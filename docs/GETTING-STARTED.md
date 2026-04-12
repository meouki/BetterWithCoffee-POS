<!-- GSD:docs-update -->
# Getting Started — PulsePoint POS

> First time here? Follow this guide to get PulsePoint running and ready for your coffee shop.

---

## Prerequisites

| Requirement | Version | Notes |
|------------|---------|-------|
| Node.js | v18.x or higher | [nodejs.org](https://nodejs.org/) |
| npm | v8+ | Bundled with Node.js |
| cloudflared | Latest | Optional — only for cloud access |

---

## Option A: Windows Installer (Recommended)

If you received `PulsePoint-Setup.exe`:

1. **Run the installer** as Administrator
2. The installer will:
   - Silently install Node.js (bundled)
   - Run `npm install` for backend dependencies
   - Initialize the database and seed default data
   - Create Desktop and Start Menu shortcuts
3. **Launch PulsePoint** from the Desktop shortcut or Start Menu
4. Your default browser opens automatically at `http://localhost:5000`

---

## Option B: Manual Setup (Development)

### Step 1 — Clone the Repository
```bash
git clone <repository-url>
cd POS-PulsePoint
```

### Step 2 — Configure Environment Files

**Backend:**
```bash
cd backend_rewrite
copy .env.example .env
```
Edit `.env` and set your values (see [CONFIGURATION.md](./CONFIGURATION.md) for all options).

**Frontend:**
```bash
cd ../frontend
copy .env.example .env
```
Edit `.env` and set `VITE_API_URL=http://localhost:5000`.

### Step 3 — Install Dependencies
```bash
# Backend
cd backend_rewrite
npm install

# Frontend
cd ../frontend
npm install
```

### Step 4 — Build the Frontend
The backend serves the pre-built React app as static files:
```bash
cd frontend
npm run build
```

### Step 5 — Start the Server
```bash
cd backend_rewrite
node server.js
```

Open `http://localhost:5000` in your browser.

---

## First Login

| Field | Value |
|-------|-------|
| Username | `master` |
| Password | `master123` |

> ⚠️ **Change this password immediately** after first login. Go to **Dashboard → Settings → User Management** or use the profile panel in the top bar.

---

## What You'll See

After logging in as Master, you land on the **Dashboard Overview** showing:
- Today's revenue & order count
- Revenue trend chart
- Top 5 best sellers
- Recent orders table

From here you can:
- **Add products**: Dashboard → Menu Management → Add Product
- **Add staff**: Dashboard → User Management → Add User  
- **Set up inventory**: Dashboard → Inventory → Add Item
- **Go to POS**: Click "Go to POS" in the top bar to open the cashier terminal

---

## Enabling Cloud Access (Optional)

To allow remote access from any device via a public URL:

```powershell
# Run as Administrator in PowerShell
cd installer
.\setup-cloud.ps1
```

Or manually:
```bash
winget install cloudflare.cloudflared
# Then set ENABLE_CLOUD=true in backend_rewrite/.env
```

Restart the server. The tunnel URL will appear in **Dashboard → Cloud Status** (top bar button).

---

## Stopping the Server

- **If launched via installer shortcut (`start.bat`):** Close the terminal window
- **If launched manually:** Press `Ctrl+C` in the terminal running `node server.js`

---

## Next Steps

| Doc | What It Covers |
|-----|---------------|
| [ARCHITECTURE.md](./ARCHITECTURE.md) | How the system is structured internally |
| [CONFIGURATION.md](./CONFIGURATION.md) | All environment variables and settings |
| [DEVELOPMENT.md](./DEVELOPMENT.md) | How to run in dev mode with hot reload |
| [API.md](./API.md) | Full REST API reference |
