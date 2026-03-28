# Frontend Summary

The frontend is a React SPA built with Vite, using CSS Modules for scoped styling. It features three layout zones: Public pages (landing/login), POS terminal, and Admin Dashboard. State management is handled through React Context providers.

---

## Root Files

### `main.jsx`
Standard Vite entry point. Renders `<App />` into `#root`.

### `App.jsx`
**The root component.** Wraps the entire app in context providers in this order: `AuthProvider` → `NotificationProvider` → `ProductProvider` → `OrderProvider`. Configures `react-hot-toast` (bottom-left, themed). Sets up React Router with three route groups:
- **Public:** `/` (LandingPage), `/login` (LoginPage), `/register` (AccountCreationPage — Master/Admin only)
- **POS:** `/pos` — All authenticated roles
- **Dashboard:** `/dashboard/*` — Master & Admin only. Sub-routes: `overview`, `orders`, `inventory`, `reports`, `settings`, `notifications`. Master-only: `users`, `menu`.

On mount, reads theme (`bwc_theme`) and accent color (`bwc_accent`) from localStorage and applies CSS custom properties.

### `index.css`
**Global design system.** Defines all CSS custom properties: colors (light + dark theme via `[data-theme="dark"]`), radii, transitions, typography (Sora, Fira Code, DM Serif Display). Includes global animations (`shake`, `slide-in-left`, `slide-in-up`, `fade-in`, `pulse`). Contains utility classes mimicking Tailwind patterns.

### `App.css`
Minimal — only contains `#root { width: 100% }`.

---

## API Layer (`api/`)

### `apiClient.js`
**Central fetch wrapper.** Automatically attaches `x-user-id` and `x-session-id` headers from `localStorage['bwc_user']`. Auto-sets `Content-Type: application/json` unless body is FormData. Handles 401 responses by dispatching a `pulsepoint-auth-error` CustomEvent (caught by AuthContext to force logout). Provides `get()`, `post()`, `patch()`, `delete()` methods.

### `users.js`
Methods: `getAll()`, `login(username, password)`, `create(userData)`, `update(id, updates)`, `delete(id)`.

### `products.js`
Methods: `getAll()`, `create(productData)` (supports FormData for images), `update(id, productData)`, `delete(id)`.

### `categories.js`
Methods: `getAll()`, `create(categoryData)`, `delete(id)`.

### `orders.js`
**Includes offline fallback logic.** Uses a circuit breaker pattern — if the server is unreachable, falls back to localStorage cache for reads and queues orders locally. Methods: `getAll(startDate, endDate, page, limit)` (returns `{orders, meta}`), `getRaw(startDate, endDate)` (no pagination, for analytics), `create(orderData)`.

### `inventory.js`
Methods: `getAllLogs()`, `logAction(actionData)`, `getSummary()`.

### `notifications.js`
Methods: `getAll()`, `add(notification)`, `clearAll()`, `getUnreadCount()`, `markAsRead(id)`, `markAllAsRead()`, `getCloudStatus()`.

### `attendance.js`
Methods: `clockIn(userId)`, `clockOut(userId)`, `getToday()`, `getRecords(userId)`, `getStats(username)`, `getLogs(startDate, endDate)`.

---

## Context Providers (`context/`)

### `AuthContext.jsx`
Manages `currentUser` state (persisted to `localStorage['bwc_user']`). Provides `login()`, `logout()`, `currentUser`, role booleans (`isMaster`, `isAdmin`, `isCashier`), and granular permission object `can` (e.g., `can.manageUsers`, `can.viewReports`). Listens for `pulsepoint-auth-error` events to auto-logout when session is kicked.

### `NotificationContext.jsx`
Manages system activity logs. Fetches all notifications on mount and polls every 30s (Master/Admin only). `addNotification(type, message, details)` sends to backend API and optimistically adds to local state. Tracks `unreadCount`. Provides `markAllRead()`, `clearLogs()`, `refreshLogs()`.

### `ProductContext.jsx`
Loads products and categories on mount (waits for `currentUser`). Provides: `products`, `categories`, `addProduct()`, `updateProduct()`, `deleteProduct()`, `toggleAvailability()`, `addCategory()`, `deleteCategory()`. All mutations automatically log notifications via `addNotification`.

### `OrderContext.jsx`
Loads today's orders on mount and polls every 15s for live tracking. Provides: `orders` (today's), `createOrder()`, `fetchOrders(startDate, endDate, page, limit)`, `fetchAnalytics(startDate, endDate)` (raw, no pagination), `getTodayRevenue()`, `getTodayOrderCount()`. Order creation auto-logs a SALE notification.

---

## Layouts (`layouts/`)

### `DashboardLayout.jsx` + `.module.css`
Renders the Sidebar + TopBar + page content area. Reads page transition animation type from localStorage and applies corresponding CSS class on route change. Uses `key={location.pathname}` to re-trigger animations.

### `POSLayout.jsx` + `.module.css`
Minimal wrapper. Renders `<Outlet />` in a full-height container.

### `PublicLayout.jsx` + `.module.css`
Minimal wrapper. Renders `<Outlet />` in a full-height container.

---

## Shared Components (`components/shared/`)

### `ProtectedRoute.jsx`
Route guard. Redirects to `/login` if unauthenticated. If `allowedRoles` is specified and user's role doesn't match, redirects Cashiers to `/pos` and others to `/dashboard/overview`.

### `ProfilePanel.jsx` + `.module.css`
**Slide-in profile panel** accessible from the TopBar. Shows user info, avatar picker (10 Lucide icons), attendance DTR calendar (monthly view with color-coded days), clock-in/clock-out/day-off buttons, stats (total sales & orders from attendance API), and a CSV export function. Users can change their avatar icon (saved to DB).

### `Loader.jsx` + `.module.css`
Simple animated loading spinner with optional text label.

### `Skeleton.jsx` + `.module.css`
Skeleton loading placeholder with shimmer animation.

---

## Dashboard Components (`components/dashboard/`)

### `TopBar.jsx` + `.module.css`
Dashboard header bar. Shows: hamburger menu (mobile), page title, "Go to POS" link (Master/Admin), live clock, notification bell with unread badge, cloud status button, and user pill with **attendance status indicator** (glowing red = not clocked in, spinning blue = clocked in, green = clocked out). Fetches attendance on mount and re-fetches when profile panel closes.

### `Sidebar.jsx` + `.module.css`
Dashboard navigation sidebar. Links: Overview, Orders, Menu Management (Master only), Inventory, Reports, User Management (Master only), Settings. Shows active state and collapses on mobile.

### `ProductDrawer.jsx` + `.module.css`
Slide-in drawer for creating/editing products. Fields: name, category (dropdown), base price, image upload with preview, availability toggle, modifier toggles (sugar selector, milk selector), custom addons (dynamic list with name + price). Handles FormData for image uploads.

### `UserDrawer.jsx` + `.module.css`
Slide-in drawer for creating/editing users. Fields: username, password (optional on edit — blank = keep current), role selector (tile-based: Master/Admin/Cashier with descriptions), account status toggle. Conditionally includes password in submission data.

### `UserDTRModal.jsx` + `.module.css`
Modal showing a specific user's attendance calendar (monthly view), clock-in/out times, day-off markers, absent detection for past dates, revenue/order stats, and CSV export.

### `CloudStatusPanel.jsx` + `.module.css`
Dropdown panel showing Cloudflare tunnel status (active/inactive/starting/error) and the generated public URL if active.

---

## POS Components (`components/pos/`)

### `HeaderBar.jsx` + `.module.css`
POS header with branding ("Better With Coffee"), current order type badge, "Go to Dashboard" link (Master/Admin), and a profile button that opens the ProfilePanel.

### `OrderTypeSelector.jsx` + `.module.css`
Full-screen modal with two large buttons: "Dine In" and "Take Out". Shown at POS start and when switching order types.

### `CategoryTabBar.jsx` + `.module.css`
Horizontal scrollable tab bar for filtering products by category. Includes an "All" tab. Reads categories from ProductContext.

### `MenuGrid.jsx` + `.module.css`
Responsive grid of ProductCards filtered by active category. Filters out unavailable products.

### `ProductCard.jsx` + `.module.css`
Individual product tile showing image (or gradient placeholder), name, price, and availability badge. Click triggers product selection.

### `ModifierSheet.jsx` + `.module.css`
Bottom sheet for customizing a product before adding to cart. Shows: quantity selector, size options (Regular/Large with price adjustments), sugar level slider (0-100%), milk type selector, and add-on checkboxes. Calculates final price dynamically.

### `CartDrawer.jsx` + `.module.css`
Slide-in cart panel showing all cart items with quantity controls, individual item removal, clear cart, subtotal/VAT/total calculation, and a "Proceed to Payment" button.

### `CheckoutModal.jsx` + `.module.css`
Payment modal. Shows order summary, total amount, payment method selector (Cash/GCash/Card), and cash tendering input with change calculation. Submits order via OrderContext.

### `FloatingCartButton.jsx` + `.module.css`
Fixed-position floating action button showing cart item count badge. Bounces on update.

### `ReceiptModal.jsx` + `.module.css`
Post-checkout receipt display. Shows store info, order ID, timestamp, itemized list with modifiers, subtotal/VAT/total, payment method, tendered amount, change. Has a "Print Receipt" button (window.print) and "New Order" button.

---

## Dashboard Pages (`pages/dashboard/`)

### `OverviewPage.jsx` + `.module.css`
Main dashboard landing. Shows KPI cards (today's revenue, order count, top item), a Recharts LineChart for revenue trends (Daily/Weekly/Monthly with API-fetched historical data), top 5 best sellers bar chart, and a recent orders table (last 10).

### `OrdersPage.jsx` + `.module.css`
Full order history browser. Date range filters (Today/7 Days/30 Days/Custom with date pickers), paginated order table with infinite scroll ("Load More"), expandable row detail showing individual items and modifiers, order type badges, payment method display.

### `MenuManagementPage.jsx` + `.module.css`
**Master only.** Product catalog management. Category tabs, product grid with edit/delete/toggle-availability actions, "Add Product" button opens ProductDrawer. Category management section with add/delete. Search functionality.

### `InventoryPage.jsx` + `.module.css`
Stock tracking interface. Table of inventory items with name, category, stock level, unit, and low-stock threshold indicators. Add/edit/delete functionality.

### `ReportsPage.jsx` + `.module.css`
Analytics hub with three tabs: **Sales Report** (bar chart by day-of-week + KPI metrics: total revenue, total orders, AOV, top payment method), **Best Sellers** (ranked table with performance bars), **Cashier Performance** (table with orders, revenue, AOV, most-sold item per staff). Date range filters, CSV export.

### `UserManagementPage.jsx` + `.module.css`
**Master only.** Staff management. User table with avatar, name, role badges, active/inactive toggle, created date, last login. Add/edit via UserDrawer. Delete with confirmation. Click user row to open DTR modal.

### `SettingsPage.jsx` + `.module.css`
System preferences: dark/light mode toggle, accent color picker (5 presets: Caramel/Sage/Dusty Rose/Slate Blue/Amber), page transition animation style and duration slider. System info panel (version, environment, DB dialect, API URL, browser info, network status).

### `NotificationsPage.jsx` + `.module.css`
Activity log viewer. Shows all system notifications with timestamp, type badge (SALE/MENU_EDIT/ALERT), message, details, and actor name. "Clear All" button.

---

## Public Pages (`pages/public/`)

### `LandingPage.jsx` + `.module.css`
Cinematic landing page with animated hero section, tagline, and two CTA buttons: "Explore POS" (→ `/pos`) and "Access Admin" (→ `/dashboard`).

### `LoginPage.jsx` + `.module.css`
Authentication form. Username/password inputs with validation, error shake animation on failure, redirects based on role after login (Cashier → `/pos`, others → `/dashboard`).

### `AccountCreationPage.jsx` + `.module.css`
Quick user registration form (Master/Admin access only). Minimal — just username and password fields.
