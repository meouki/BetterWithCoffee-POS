# PulsePoint POS — Project Summary

> **Purpose:** A full-stack Point-of-Sale (POS) system built for a coffee shop ("Better With Coffee"). It features a touch-friendly POS terminal for cashiers, an admin dashboard for management, and optional cloud access via Cloudflare tunnels.

---

## Architecture Overview

```
POS-PulsePoint/
├── backend_rewrite/    # Express.js + Sequelize + SQLite API server
├── frontend/           # React (Vite) single-page application
├── installer/          # Inno Setup scripts for Windows packaging
└── pos_data.sqlite     # SQLite database file (root level)
```

**Tech Stack:**
- **Backend:** Node.js, Express, Sequelize ORM, SQLite, bcryptjs, multer + sharp (image upload), Cloudflare tunnels
- **Frontend:** React 18, Vite, React Router v6, Recharts, Lucide React icons, react-hot-toast, CSS Modules
- **Installer:** Inno Setup (Windows `.exe` installer), bundles Node.js MSI

**Auth Model:** Session-based. On login, a UUID `session_id` is generated and stored in the DB. Every API call sends `x-user-id` and `x-session-id` headers. Logging in elsewhere invalidates the previous session.

**Role Hierarchy:**
| Role     | POS | Dashboard | Reports | Users/Menu |
|----------|-----|-----------|---------|------------|
| Master   | ✅  | ✅        | ✅      | ✅ (full)  |
| Admin    | ✅  | ✅        | ✅      | ❌         |
| Cashier  | ✅  | ❌        | ❌      | ❌         |

---
