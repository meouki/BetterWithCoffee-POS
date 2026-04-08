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
- **Backend:** Node.js (cluster mode for auto-restart), Express, Sequelize ORM, SQLite, bcryptjs, multer + sharp (image upload), Cloudflare tunnels
- **Frontend:** React 18, Vite, React Router v6, Recharts, Lucide React icons, react-hot-toast, CSS Modules
- **Installer:** Inno Setup (Windows `.exe` installer), bundles Node.js MSI
- **Key API Routes:** `/api/products`, `/api/orders`, `/api/categories`, `/api/inventory`, `/api/product-sizes`, `/api/recipes`, `/api/users`, `/api/attendance`, `/api/notifications`, `/api/system` (export/import/wipe)

**Auth Model:** Session-based. On login, a UUID `session_id` is generated and stored in the DB. Every API call sends `x-user-id` and `x-session-id` headers. Logging in elsewhere invalidates the previous session.

**Role Hierarchy:**
| Role     | POS | Dashboard | Reports | Users/Menu |
|----------|-----|-----------|---------|------------|
| Master   | ✅  | ✅        | ✅      | ✅ (full)  |
| Admin    | ✅  | ✅        | ✅      | ❌         |
| Cashier  | ✅  | ❌        | ❌      | ❌         |

---

## Key Operational Notes
- **Seeded defaults:** `master`/`master123` (hashed on first boot), categories: Cold Drinks, Hot Drinks, Blended Drinks, Snacks.
- **Root protection:** User with `id=1` (root Master) cannot have role/status changed via `PATCH /api/users/:id`; same protection is visible in `UserDrawer.jsx`.
- **Data backup:** `GET /api/system/export` downloads raw SQLite. `POST /api/system/import` replaces the DB file and triggers a `process.exit(0)` which the cluster primary catches to auto-reboot.
- **Offline fallback:** The `orders.js` API client has a circuit breaker that falls back to `localStorage` reads and queues creates when the server is unreachable.
- **Recipe/Inventory system:** `ProductSize` defines named size variations with price adjustments. `Recipe` links a `(product, size?)` pair to an inventory ingredient with a quantity, enabling stock deduction on sale.
- **V2 Roadmap:** See `ideas.md` in the project root for next-phase feature concepts (Predictive Restocking, KDS, QR Receipts, Gamification, etc.).
