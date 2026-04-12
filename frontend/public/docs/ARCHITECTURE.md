<!-- GSD:docs-update -->
# Architecture Overview — PulsePoint POS

> **Stack:** Node.js · Express · Sequelize · SQLite · React 18 · Vite · CSS Modules

---

## 1. High-Level Structure

```
POS-PulsePoint/
├── backend_rewrite/        # Express.js REST API + static file server
│   ├── config/             # Sequelize DB instance (db.js)
│   ├── middleware/         # Session auth (auth.js)
│   ├── models/             # Sequelize models + associations (index.js)
│   ├── routes/             # API route handlers
│   ├── utils/              # Cloudflare tunnel manager
│   ├── server.js           # Entry point — Node.js cluster + Express app
│   └── emergency-reset.js  # Standalone Master password reset CLI
├── frontend/               # React SPA (Vite)
│   └── src/
│       ├── api/            # Fetch wrapper + per-resource API clients
│       ├── components/     # Shared, Dashboard, POS component groups
│       ├── context/        # Auth, Notification, Product, Order providers
│       ├── layouts/        # Dashboard, POS, Public layout shells
│       └── pages/          # Public, POS terminal, and Dashboard pages
├── installer/              # Inno Setup scripts for Windows .exe packaging
└── pos_data.sqlite         # SQLite database (project root)
```

---

## 2. Backend

### 2.1 Process Model

`server.js` uses **Node.js `cluster`** to fork one worker process. The primary process watches for worker exits:
- On normal crash: auto-reforks after 1 second
- On `process.exit(0)` (triggered after a DB import): reforks, booting with the new database

This enables zero-intervention recovery and seamless database restoration without manual restarts.

### 2.2 Express App (Worker)

The worker sets up the Express application with:
- `cors` middleware
- `express.json()` body parser
- Static serving of uploaded images from `/uploads`
- All API routes mounted under `/api/*`
- Static serving of the pre-built React frontend (`../frontend/dist/`)
- Catch-all route for client-side React Router navigation
- On startup: `sequelize.sync()`, master account seeding, category seeding
- Optional Cloudflare tunnel via `tunnelManager.js`

### 2.3 Database

- **Dialect:** SQLite (via Sequelize ORM)
- **File path:** `../../pos_data.sqlite` (relative to `backend_rewrite/`) → project root
- **Sync strategy:** `sync()` without `force: true` — creates/alters tables without data loss

### 2.4 Models & Associations

| Model | Table | Key Fields |
|-------|-------|-----------|
| `User` | `users` | `id`, `name`, `username`, `password` (bcrypt), `role`, `is_active`, `session_id` |
| `Product` | `products` | `id`, `name`, `category_name`, `base_price`, `is_available`, `modifiers`, `addons` (JSON), `image_url` |
| `Category` | `categories` | `id`, `name` (unique), `is_active` |
| `Order` | `orders` | `id` (ORD-XXXXXX), `timestamp`, `subtotal`, `vat`, `total`, `payment_method`, `order_type`, `cashier` |
| `OrderItem` | `order_items` | `id`, `order_id`, `product_id`, `name`, `quantity`, `price`, `modifiers` (JSON) |
| `Inventory` | `inventory` | `id`, `name`, `category`, `stock`, `unit`, `threshold` |
| `Recipe` | `recipes` | `id`, `product_id`, `size_id` (nullable), `inventory_id`, `quantity` |
| `ProductSize` | `product_sizes` | `id`, `product_id`, `name`, `price_adjustment`, `sort_order` |
| `StockLog` | `stock_logs` | `id`, `inventory_id`, `change_qty`, `reason`, `reference_id`, `stock_after`, `timestamp` |
| `Notification` | `notifications` | `id`, `timestamp`, `type`, `message`, `details`, `cashier` |
| `Attendance` | `attendance` | `id`, `user_id`, `date`, `clock_in`, `clock_out`, `type` |

**Key Associations:**
- `Order` → `OrderItem` (cascade delete)
- `Product` → `ProductSize` (cascade delete), `Product` → `Recipe` (cascade delete)
- `ProductSize` → `Recipe` (SET NULL on delete)
- `Inventory` → `Recipe`, `Inventory` → `StockLog` (cascade delete)
- `User` → `Attendance`

---

## 3. Authentication

**Mechanism:** Session-based (not JWT). On successful login:
1. A new **UUID** `session_id` is generated and saved to the `User` record
2. The response body includes `user_id` and `session_id`
3. The frontend stores these in `localStorage['bwc_user']`
4. Every subsequent API request attaches `x-user-id` and `x-session-id` headers
5. `auth.js` middleware reads these headers, looks up the user, and validates the session
6. Logging in from another device generates a new `session_id`, **invalidating the previous session** (single active session per account)

**Root protection:** User `id=1` (the seeded Master account) cannot have its role or active status changed via API, preventing accidental lockout.

---

## 4. Role Hierarchy

| Role | POS Terminal | Dashboard | Reports | Users/Menu | System |
|------|:---:|:---:|:---:|:---:|:---:|
| **Master** | ✅ | ✅ | ✅ | ✅ Full | ✅ |
| **Admin** | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Cashier** | ✅ | ❌ | ❌ | ❌ | ❌ |

---

## 5. API Route Groups

| Prefix | Responsibility |
|--------|---------------|
| `/api/users` | Auth (login), CRUD for staff accounts |
| `/api/products` | Product CRUD with image upload (multer + sharp → WebP) |
| `/api/categories` | Category CRUD |
| `/api/orders` | Order creation + paginated/filtered order history |
| `/api/inventory` | Ingredient CRUD + stock log retrieval |
| `/api/product-sizes` | Size variation CRUD (Regular, Large, etc.) |
| `/api/recipes` | Recipe entries linking products/sizes to inventory ingredients |
| `/api/attendance` | Clock-in/out, day-off, DTR records, cashier stats |
| `/api/notifications` | Activity log CRUD |
| `/api/system` | DB export, import (cluster restart), factory wipe |

All routes except `/api/users/login` and `/api/notifications` require `sessionAuth` middleware.

---

## 6. Frontend

### 6.1 State Management

The app uses React Context instead of a third-party state library:

| Context | Responsibility |
|---------|---------------|
| `AuthContext` | `currentUser`, `login()`, `logout()`, role booleans, `can.*` permissions |
| `ProductContext` | Products + categories CRUD, synced on mount |
| `OrderContext` | Today's orders, order creation, analytics queries |
| `NotificationContext` | Activity log, unread count, polling (30s) |

### 6.2 Route Structure

```
/                     → LandingPage (Public)
/login                → LoginPage (Public)
/register             → AccountCreationPage (Master/Admin only)
/pos                  → POS Terminal (all roles)
/dashboard/overview   → KPI overview (Admin+)
/dashboard/orders     → Order history browser (Admin+)
/dashboard/menu       → Menu management (Master only)
/dashboard/inventory  → Stock management (Admin+)
/dashboard/reports    → Analytics (Admin+)
/dashboard/users      → Staff management (Master only)
/dashboard/settings   → System settings (Admin+)
/dashboard/notifications → Activity log (Admin+)
/docs                 → Documentation (Public)
```

### 6.3 Offline Fallback

`api/orders.js` implements a **circuit breaker** pattern. If the backend is unreachable:
- `GET` reads fall back to `localStorage` cache
- `POST` creates are queued locally for later sync

---

## 7. Cloudflare Tunnel

`utils/tunnelManager.js` spawns a `cloudflared tunnel --url http://localhost:PORT` child process. It:
- Parses the generated `*.trycloudflare.com` URL from stderr
- Auto-retries up to 10 times with exponential backoff on crash
- Exposes `start()`, `stop()`, `getStatus()` methods
- Is activated by setting `ENABLE_CLOUD=true` in the backend `.env`

The frontend's `CloudStatusPanel.jsx` polls `/api/notifications/cloud-status` to display the tunnel URL.

---

## 8. Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| **Node.js cluster mode** | Enables DB import without manual server restart — `process.exit(0)` triggers automatic refork |
| **SQLite** | Zero-config, file-based DB ideal for single-location café deployments |
| **Session-based auth** | Simpler than JWT for local-only deployments; single active session enforces accountability |
| **CSS Modules** | Scoped styling with no runtime overhead; avoids class name collisions across components |
| **Recipe/Size model** | Flexible ingredient deduction — recipes can target the whole product or a specific size variation |
| **Offline circuit breaker** | Cashiers can continue taking orders even if the server restarts briefly |
