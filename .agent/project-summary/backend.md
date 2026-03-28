# Backend Summary

The backend is an Express.js REST API using Sequelize ORM with SQLite. It serves both the API endpoints and the production frontend build as static files.

---

## Core Files

### `server.js`
**The main entry point.** Sets up Express with CORS, JSON parsing, and static file serving for uploaded images (`/uploads`). Mounts all API route handlers under `/api/*`. Serves the pre-built React frontend from `../frontend/dist/` with a catch-all for client-side routing. On startup: syncs database tables, seeds a default Master user (`master`/`master123`) and default categories if none exist, optionally starts a Cloudflare tunnel if `ENABLE_CLOUD=true` in `.env`. Listens on port 5000 (configurable via `PORT` env var) on all interfaces (`0.0.0.0`) and prints LAN IP addresses for multi-device access.

### `emergency-reset.js`
**Standalone CLI script** to reset the Master account password back to `master123`. Run with `node emergency-reset.js` if locked out. Safe to re-run — finds or recreates the Master account.

### `package.json`
Dependencies: `express`, `cors`, `sequelize`, `sqlite3`, `bcryptjs`, `dotenv`, `multer`, `sharp`.

---

## Config (`config/`)

### `db.js`
Creates and exports a single Sequelize instance configured for SQLite dialect. The database file path resolves to `../../pos_data.sqlite` (project root). Logging is disabled by default.

---

## Middleware (`middleware/`)

### `auth.js`
**Session authentication middleware.** Reads `x-user-id` and `x-session-id` from request headers. Looks up the user in the DB and verifies the session ID matches. Returns 401 if the session was invalidated (e.g., user logged in from another device). Skips OPTIONS preflight requests. Attaches `req.user` for downstream route handlers. Applied to most routes in `server.js` except `/api/users/login` and `/api/notifications`.

---

## Models (`models/`)

### `index.js`
**Central model registry.** Imports all models, defines Sequelize associations, and exports everything. Key associations:
- `Category` ↔ `Product` (via `category_name` string foreign key, not ID)
- `Order` → `OrderItem` (cascade delete)
- `OrderItem` → `Product`
- `User` → `Attendance`

### `User.js`
Fields: `id`, `name`, `username` (unique), `password`, `role` (ENUM: Master/Admin/Cashier), `is_active`, `last_login`, `avatar_icon`, `session_id`. Has a `beforeSave` hook that auto-hashes the password with bcrypt when changed. Includes a `validatePassword()` instance method.

### `Product.js`
Fields: `id`, `name`, `category_name`, `base_price`, `is_available`, `modifiers` (boolean flag for whether customization is enabled), `has_sugar_selector`, `has_milk_selector`, `addons` (JSON text stored as string with custom getter/setter), `image_url`. Table: `products`.

### `Order.js`
Fields: `id` (string, e.g. `ORD-123456`), `timestamp`, `subtotal`, `vat`, `total`, `payment_method`, `order_type`, `cashier`, `amount_tendered`, `change`. Table: `orders`.

### `OrderItem.js`
Fields: `id`, `order_id`, `product_id`, `name`, `quantity`, `price`, `original_price`, `modifiers` (JSON text with getter/setter). Table: `order_items`.

### `Category.js`
Fields: `id`, `name` (unique), `is_active`. Table: `categories`.

### `Inventory.js`
Fields: `id`, `name`, `category`, `stock`, `unit`, `threshold`, `last_updated`. Table: `inventory`. Standalone — not linked to products via foreign key.

### `Notification.js`
Fields: `id`, `timestamp`, `type` (string, e.g. SALE/MENU_EDIT/ALERT), `message`, `details`, `cashier`. Table: `notifications`.

### `Attendance.js`
Fields: `id`, `user_id`, `date` (DATEONLY), `clock_in` (DATE), `clock_out` (DATE), `type` (ENUM: Work/DayOff). Has a unique composite index on `[user_id, date]`. Table: `attendance`.

---

## Routes (`routes/`)

### `users.js`
- `GET /` — List all users (excludes password field). Protected by `sessionAuth`.
- `POST /login` — Authenticate with username/password. Generates a new `session_id` (UUID) on success, effectively kicking out previous sessions. Has a backdoor via `FINANCIAL_BACKDOOR_KEY` env var.
- `POST /` — Create a new user. Protected by `sessionAuth`.
- `PATCH /:id` — Update user fields. Protects root Master (id=1) from being disabled.
- `DELETE /:id` — Delete user. Protects root Master (id=1) from deletion.

### `products.js`
- `GET /` — List all products ordered by ID.
- `GET /:id` — Get single product.
- `POST /` — Create product with optional image upload (multer + sharp → WebP at 400px width). Stores image as `/uploads/filename.webp`.
- `PATCH /:id` — Update product fields with optional image replacement.
- `DELETE /:id` — Delete product.

### `orders.js`
- `GET /` — List orders with optional date filtering (`from`/`to` query params) and pagination (`page`/`limit`). Includes associated `OrderItem` records.
- `POST /` — Create order with items in a single transaction. Validates that `id` and `items` are present.

### `categories.js`
- `GET /` — List active categories sorted by name.
- `POST /` — Create category. Returns 400 if name already exists.
- `PUT /:id` — Update category name/active status.
- `DELETE /:id` — Delete category only if it has no products.

### `inventory.js`
- `GET /` — List all inventory items.
- `POST /` — Create inventory item.
- `PATCH /:id` — Update stock/threshold/name/category/unit.
- `DELETE /:id` — Delete inventory item.

### `notifications.js`
- `GET /cloud-status` — Returns Cloudflare tunnel status (no auth required).
- `GET /` — List all notifications in reverse chronological order.
- `POST /` — Create a new notification log entry.
- `DELETE /` — Truncate all notifications.

### `attendance.js`
- `GET /:userId` — Fetch all attendance records for a specific user.
- `POST /clock-in` — Find or create today's attendance record with clock-in time. Accepts `user_id` from request body.
- `POST /clock-out` — Set clock-out time on today's record. Requires prior clock-in.
- `POST /day-off` — Mark a date as day off (clears clock times).
- `GET /stats/:username` — Aggregate total revenue and order count for a cashier (joins with Orders table).

---

## Utils (`utils/`)

### `tunnelManager.js`
**Cloudflare Quick Tunnel manager.** Spawns a `cloudflared tunnel --url http://localhost:PORT` child process. Parses the generated `*.trycloudflare.com` URL from stderr. Exposes `start()`, `stop()`, `getStatus()`. Auto-retries up to 10 times with exponential backoff on crash. Checks common Windows install paths for the `cloudflared` binary.
