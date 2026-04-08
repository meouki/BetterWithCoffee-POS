# System Requirements Specification (SRS)
## PulsePoint Point-of-Sale System
### Better With Coffee — Internal System Document

---

**Document Version:** 1.0  
**Prepared Date:** April 8, 2026  
**Project:** PulsePoint POS  
**Client:** Better With Coffee  
**Classification:** Internal Use Only

---

## Table of Contents

- [4.1.0 Functional Requirements](#410-functional-requirements)
- [4.2.0 Non-Functional Requirements](#420-non-functional-requirements)

---

## 4.1.0 Functional Requirements

Functional requirements define the specific behaviors, features, and functions the system must perform to satisfy operational needs.

---

### 4.1.1 User Authentication and Session Management

**4.1.1.1** The system shall allow users to log in using a unique username and password combination.

**4.1.1.2** The system shall generate a universally unique identifier (UUID) as a `session_id` upon every successful login and store it in the database against the user record.

**4.1.1.3** The system shall invalidate any previously active session for a user when that user logs in from a different device or browser, enforcing single-session access.

**4.1.1.4** Every authenticated API request shall transmit `x-user-id` and `x-session-id` headers. The server shall reject any request where the `session_id` does not match the value stored in the database, returning an HTTP 401 Unauthorized response.

**4.1.1.5** The system shall automatically log out the frontend user and redirect them to the login page upon receiving a 401 Unauthorized response from any API endpoint.

**4.1.1.6** Upon successful login, the system shall redirect the user based on their assigned role: Cashier users shall be directed to `/pos`; Master and Admin users shall be directed to `/dashboard`.

**4.1.1.7** The system shall record the `last_login` timestamp on the user record each time a successful authentication occurs.

**4.1.1.8** The system shall provide a standalone emergency reset script (`emergency-reset.js`) that an administrator can execute from the command line to restore the root Master account and reset its password to the factory default.

---

### 4.1.2 Role-Based Access Control

**4.1.2.1** The system shall enforce three distinct user roles: **Master**, **Admin**, and **Cashier**, each with a defined permission set.

**4.1.2.2** The **Master** role shall have unrestricted access to all areas of the system, including the POS terminal, admin dashboard, reports, user management, menu management, inventory, and system settings.

**4.1.2.3** The **Admin** role shall have access to the POS terminal, admin dashboard, and reports. Admin users shall not have access to user management, menu management, or system-level settings.

**4.1.2.4** The **Cashier** role shall have access to the POS terminal only. Cashiers shall have no access to any dashboard page.

**4.1.2.5** Route guard components shall redirect unauthorized users: Cashiers attempting to access dashboard routes shall be redirected to `/pos`; non-Cashiers accessing protected Master-only pages shall be redirected to `/dashboard/overview`.

**4.1.2.6** The system shall permanently protect the root Master account (user `id = 1`) from having its role changed, its account disabled, or being deleted, whether via the API or the user interface.

---

### 4.1.3 POS Terminal — Order Creation

**4.1.3.1** The system shall present an order type selection screen (Dine In / Take Out) at the start of each new transaction and whenever the order type is changed mid-session.

**4.1.3.2** The system shall display all active products grouped by category, rendered as a scrollable grid of product cards showing product image (or a gradient placeholder), name, and price.

**4.1.3.3** The system shall allow filtering of the product grid by category via a horizontal tab bar. An "All" tab shall be available to display all active products simultaneously.

**4.1.3.4** Selecting a product that has modifiers enabled shall open a bottom sheet allowing the user to configure: quantity, size selection (with dynamic price adjustment), sugar level (0–100% slider), milk type, and custom add-ons with individual pricing.

**4.1.3.5** The system shall calculate and display the final item price dynamically as the user modifies selections on the modifier sheet.

**4.1.3.6** The system shall maintain a persistent cart session that accumulates multiple order lines. Each line shall display the product name, selected modifiers, quantity, and line total.

**4.1.3.7** The system shall provide controls within the cart to increase/decrease item quantity, remove individual items, and clear the entire cart.

**4.1.3.8** The system shall display a floating action button showing the current cart item count. The button shall animate (bounce) when the cart is updated.

**4.1.3.9** The system shall calculate and display the subtotal, VAT amount, and grand total of the cart in real time.

---

### 4.1.4 POS Terminal — Checkout and Payment

**4.1.4.1** The system shall provide a checkout modal displaying an itemized order summary, total amount due, and payment method selection.

**4.1.4.2** The system shall support the following payment methods: **Cash**, **GCash**, and **Card**.

**4.1.4.3** When the Cash payment method is selected, the system shall present a cash tendering input and calculate and display the change due in real time.

**4.1.4.4** Upon successful payment confirmation, the system shall submit the complete order — including all items, modifiers, payment method, order type, cashier name, amount tendered, and change — to the backend in a single atomic database transaction.

**4.1.4.5** The system shall assign each order a unique string identifier in the format `ORD-XXXXXX`.

**4.1.4.6** After a successful order submission, the system shall display a receipt modal showing: store information, order ID, timestamp, itemized list with modifiers, subtotal, VAT, total, payment method, amount tendered, and change.

**4.1.4.7** The receipt modal shall provide a "Print Receipt" function using the browser's native `window.print()` API.

**4.1.4.8** The receipt modal shall provide a "New Order" button that clears the cart and returns the terminal to the order type selection screen.

---

### 4.1.5 Menu Management

**4.1.5.1** The system shall restrict menu management capabilities exclusively to Master role users.

**4.1.5.2** The system shall allow the Master user to create new products with the following attributes: name, category, base price, availability status, image, and modifier flags (sugar selector, milk selector, add-ons).

**4.1.5.3** The system shall support image uploads for products. Uploaded images shall be automatically converted to WebP format and resized to a maximum width of 400 pixels on the server.

**4.1.5.4** The system shall allow the Master user to define named size variations for each product (e.g., "Regular", "Large"), each with an associated price adjustment that is applied to the base price.

**4.1.5.5** The system shall allow the Master user to define custom add-on items for a product, each with a name and additional price.

**4.1.5.6** The system shall allow the Master user to toggle individual product availability. Unavailable products shall not be displayed on the POS terminal.

**4.1.5.7** The system shall allow the Master user to edit all attributes of an existing product, including replacing its image.

**4.1.5.8** The system shall allow the Master user to delete products. Deletion shall set the foreign key reference on existing order items to NULL rather than deleting historical order data.

**4.1.5.9** The system shall allow the Master user to manage product categories: create new categories, and delete categories that contain no associated products.

**4.1.5.10** The menu management interface shall support searching and filtering products by category.

---

### 4.1.6 Recipe and Ingredient Linking

**4.1.6.1** The system shall allow each product (and optionally each size variation of a product) to be linked to one or more inventory ingredients with a defined consumption quantity per unit sold.

**4.1.6.2** The system shall provide a `RecipeBuilder` interface embedded within the product management drawer, enabling the Master user to add or remove ingredient links in real time for existing products.

**4.1.6.3** For new products being created (not yet saved), the system shall support a pending/offline recipe mode, where ingredient links are staged locally and then submitted to the backend immediately after the product record is created.

**4.1.6.4** A recipe entry with a null `size_id` shall be interpreted as applying to the base product regardless of any size selected by the customer.

**4.1.6.5** Each ingredient may only be added once per `(product, size)` combination; the system shall enforce this uniqueness constraint at the database level.

---

### 4.1.7 Inventory Management

**4.1.7.1** The system shall maintain a list of raw inventory items (ingredients/supplies), each with a name, category, current stock level, unit of measure, and low-stock threshold.

**4.1.7.2** The system shall allow authorized users to add new inventory items, edit existing item details (name, category, unit, threshold), and delete items.

**4.1.7.3** The system shall automatically create a `StockLog` entry whenever a new inventory item is created, recording the initial stock quantity with reason `'manual'`.

**4.1.7.4** The system shall automatically create a `StockLog` entry whenever a manual stock update is performed, recording the quantity delta, the stock snapshot after the change, a reason, and an optional reference identifier.

**4.1.7.5** The system shall visually differentiate inventory items that have fallen at or below their low-stock threshold using distinct UI indicators (e.g., color badges or warning icons).

**4.1.7.6** The system shall provide a stock log history view showing the last 200 stock movements per audit trail, displaying the item name, quantity change, reason, reference, and timestamp.

---

### 4.1.8 Order Management and History

**4.1.8.1** The system shall provide the dashboard with a full, paginated order history table accessible to Master and Admin users.

**4.1.8.2** The system shall support date range filtering on the order history view with the following preset options: Today, Last 7 Days, Last 30 Days, and Custom (user-defined date range using a date picker).

**4.1.8.3** The system shall support "Load More" infinite scroll pagination on the orders table, progressively fetching additional records as the user scrolls.

**4.1.8.4** Each order row shall be expandable to reveal the line items for that order, including individual product names, modifiers selected, quantity, and price.

**4.1.8.5** The system shall display the payment method and order type (Dine In / Take Out) for each order.

**4.1.8.6** The `OrderContext` shall poll for today's orders every 15 seconds to keep dashboard live statistics up to date.

---

### 4.1.9 Reporting and Analytics

**4.1.9.1** The system shall provide a dedicated Reports page accessible to Master and Admin users, containing three report tabs: **Sales Report**, **Best Sellers**, and **Cashier Performance**.

**4.1.9.2** The **Sales Report** tab shall display: a bar chart of revenue by day of the week, total revenue, total order count, average order value (AOV), and the most used payment method for the selected period.

**4.1.9.3** The **Best Sellers** tab shall display a ranked table of products by quantity sold, with a visual performance bar representing relative popularity.

**4.1.9.4** The **Cashier Performance** tab shall display per-staff metrics including total orders handled, total revenue generated, average order value, and the most frequently sold item per cashier.

**4.1.9.5** All report tabs shall support the same date range filter options as the order history page (Today, 7 Days, 30 Days, Custom).

**4.1.9.6** The system shall allow users to export the currently displayed report data as a CSV file.

**4.1.9.7** The Overview page of the dashboard shall display the following live KPIs: today's total revenue, today's order count, today's top-selling item, a revenue trend line chart (Daily/Weekly/Monthly), a top-5 best sellers bar chart, and a recent orders table (last 10 orders).

---

### 4.1.10 User Management

**4.1.10.1** The system shall provide a User Management page accessible exclusively to the Master role.

**4.1.10.2** The system shall allow the Master user to create new staff accounts with a username, password, assigned role, and initial active status. The username shall be stored in lowercase with no spaces.

**4.1.10.3** The system shall validate user creation inputs: username is required and must not contain spaces; password is required for new accounts and must be at least 6 characters; password and confirm password fields must match.

**4.1.10.4** The system shall allow the Master user to edit existing user accounts, including updating the username, role, and account status. Leaving the password field blank during an edit shall preserve the existing password.

**4.1.10.5** The system shall allow the Master user to deactivate user accounts. Deactivated accounts shall be blocked from logging in.

**4.1.10.6** The system shall allow the Master user to delete user accounts. The root Master account (id = 1) shall be immune to deletion.

**4.1.10.7** The user management interface shall display each user's assigned avatar icon, role badge, account status, creation date, and last login timestamp.

**4.1.10.8** The system shall allow each user to personalize their profile by selecting one of 10 available avatar icons (Lucide icons). The selection shall be persisted to the database.

---

### 4.1.11 Attendance and Time Tracking (DTR)

**4.1.11.1** The system shall allow any authenticated user to clock in and clock out directly from the dashboard profile panel.

**4.1.11.2** The system shall enforce a single attendance record per user per calendar day. Attempting to create a second record for the same day shall return the existing record.

**4.1.11.3** Clock-out shall only succeed if a clock-in record exists for the current day.

**4.1.11.4** The system shall allow the Master user to mark specific past dates for any staff member as a Day Off, clearing any associated clock-in/clock-out times for that date.

**4.1.11.5** The system shall detect and display "Absent" status for past dates where no attendance record (Work or DayOff) exists.

**4.1.11.6** The system shall render a monthly calendar view within the profile panel and the User DTR Modal, color-coding each date by its attendance status (clocked in, clocked out, day off, absent).

**4.1.11.7** The system shall display an attendance status indicator (glowing dot) on the TopBar for the currently logged-in user: red = not clocked in, spinning blue = clocked in, green = clocked out.

**4.1.11.8** The DTR modal accessible by the Master user shall display per-staff aggregate statistics: total revenue generated and total orders processed, sourced by cross-referencing the Orders table with the cashier's name.

**4.1.11.9** The system shall provide a CSV export function for a user's complete attendance records within the DTR modal and the profile panel.

---

### 4.1.12 System Notifications and Activity Log

**4.1.12.1** The system shall automatically log a notification entry for every significant system event, including: completed sales (type: SALE), menu edits (type: MENU_EDIT), and system alerts (type: ALERT).

**4.1.12.2** The system shall display an unread notification count badge on the notification bell icon in the TopBar and update it in real time.

**4.1.12.3** The system shall poll the notification feed every 30 seconds for Master and Admin users to surface new activity without requiring a manual refresh.

**4.1.12.4** The Notifications page shall display all system logs in reverse chronological order, with each entry showing its timestamp, type badge, message, detail text, and the actor (cashier/user) who triggered it.

**4.1.12.5** The system shall allow the Master user to permanently clear all notification logs via a "Clear All" action.

---

### 4.1.13 System Settings and Data Management

**4.1.13.1** The system shall allow any authenticated user to switch the application between light mode and dark mode. The selected theme shall be persisted in `localStorage` and applied on subsequent visits.

**4.1.13.2** The system shall allow users to select an accent color from five named presets (Caramel, Sage, Dusty Rose, Slate Blue, Amber), persisted in `localStorage` with the selection applied globally via CSS custom properties.

**4.1.13.3** The system shall allow users to configure the page transition animation style (Slide In Left, Slide In Up, Fade In) and duration (0.1–1.0 seconds), persisted in `localStorage`.

**4.1.13.4** The system shall provide a **Database Export** function that downloads the raw `pos_data.sqlite` file as a dated archive. The download request shall include cache-busting headers to prevent the browser from serving a stale cached response.

**4.1.13.5** The system shall provide a **Database Import** function that allows the Master user to upload a previously exported `.sqlite` file. The import flow shall require: file validation (`.sqlite` extension), Master password authentication, and a final destructive-action confirmation before proceeding.

**4.1.13.6** Upon a successful import, the backend shall close open database connections, overwrite `pos_data.sqlite` with the uploaded file, and exit the worker process with code `0`. The cluster primary process shall automatically fork a new worker, which will boot with the restored database.

**4.1.13.7** The system shall provide a **Factory Reset** function (Master only) accessible from a Danger Zone section. The reset flow shall require two confirmation steps and Master password entry before executing. A successful reset shall drop and recreate all database tables, reseed the default Master account and default categories, then redirect the user to the login page.

---

### 4.1.14 Cloud Access (Cloudflare Tunnel)

**4.1.14.1** The system shall optionally start a Cloudflare Quick Tunnel at server startup when `ENABLE_CLOUD=true` is set in the backend `.env` configuration file.

**4.1.14.2** The tunnel manager shall spawn the `cloudflared` binary as a child process and parse the generated `*.trycloudflare.com` public URL from the process output.

**4.1.14.3** If the tunnel process crashes, the system shall automatically retry starting it, up to 10 times with exponential backoff.

**4.1.14.4** The system shall expose a public, unauthenticated endpoint (`GET /api/notifications/cloud-status`) that returns the current tunnel status and active public URL, allowing the frontend to display connectivity information.

**4.1.14.5** A Cloud Status Panel in the dashboard TopBar shall display the tunnel state (Active / Inactive / Starting / Error) and the public URL when active.

---

## 4.2.0 Non-Functional Requirements

Non-functional requirements define system quality attributes, constraints, and standards that govern how the system performs its functions.

---

### 4.2.1 Performance

**4.2.1.1** The backend API shall respond to standard CRUD requests (product list, order creation, user fetch) within **500 milliseconds** under typical single-location load conditions.

**4.2.1.2** The POS terminal product grid shall render and be interactive within **2 seconds** of the initial page load on the target hardware.

**4.2.1.3** Database queries for order analytics (Reports page) covering up to 90 days of data shall complete within **3 seconds**.

**4.2.1.4** The system shall support concurrent usage by a minimum of **5 simultaneous client sessions** (e.g., multiple POS terminals and dashboard views) without degradation of response time beyond the stated thresholds.

**4.2.1.5** Product images shall be automatically compressed to WebP format at a maximum width of 400px during upload to minimize storage footprint and reduce page load times on the POS grid.

---

### 4.2.2 Security

**4.2.2.1** All user passwords shall be hashed using **bcrypt** with an appropriate cost factor before storage. Plaintext passwords shall never be persisted or logged.

**4.2.2.2** The system shall use session-based authentication with server-side session validation on every protected request; client-side token forgery alone shall not grant access.

**4.2.2.3** Logging in from a second device shall immediately invalidate the first device's session, preventing concurrent session abuse.

**4.2.2.4** All destructive data operations (factory reset, database import, database wipe) shall require explicit Master password re-authentication, regardless of the user's current login state.

**4.2.2.5** The root Master account (user id = 1) shall be permanently protected at both the API and database layers from role modification, deactivation, or deletion.

**4.2.2.6** The `/api/system` routes (export, import, wipe) shall require valid session authentication; unauthenticated access attempts shall result in an HTTP 401 response.

**4.2.2.7** File upload endpoints shall accept only image files for product images and only `.sqlite` files for database imports. Invalid file types shall be rejected before processing.

---

### 4.2.3 Reliability and Availability

**4.2.3.1** The system shall use Node.js `cluster` mode such that the primary process automatically restarts the application worker within **1 second** of any unexpected crash or intentional `process.exit()`, ensuring self-healing operation.

**4.2.3.2** The frontend order API shall implement a circuit-breaker pattern: if the backend server is unreachable, the system shall fall back to a locally cached order list for reads and queue new order submissions in `localStorage`, minimizing service disruption during temporary network issues.

**4.2.3.3** The SQLite database shall be treated as the single source of truth. The database file path shall be resolved relative to the project root and shall remain consistent between development and production environments.

**4.2.3.4** All database mutations (order creation, factory reset, import) shall use Sequelize transactions or atomic file-write operations to prevent data corruption from partial failures.

**4.2.3.5** The system shall implement automatic seeding on startup: if no Master user or categories exist in the database, defaults shall be created without administrator intervention.

---

### 4.2.4 Usability

**4.2.4.1** The POS terminal interface shall be optimized for **touch-based input** on tablet and desktop touchscreen hardware, with sufficiently large tap targets on product cards, modifier controls, and cart buttons.

**4.2.4.2** All user-facing error states shall be communicated through clearly visible, non-technical messages using toast notifications and inline form validation feedback.

**4.2.4.3** Destructive or irreversible actions (delete, wipe, import) shall always present at least two confirmation steps or an explicit password gate before execution, preventing accidental data loss.

**4.2.4.4** All form drawers (Product, User) shall reset their state completely when closed and re-opened, ensuring no stale data is carried between sessions.

**4.2.4.5** Page transitions between dashboard routes shall be animated using configurable CSS animations (slide, fade) with duration adjustable by the user, providing a premium perceived quality of interaction.

**4.2.4.6** The system shall provide skeleton loading placeholders and inline loading states to prevent layout shifts and communicate system responsiveness during data fetches.

**4.2.4.7** The application shall support both **light and dark color themes**, persisted across sessions, with all UI components conforming to the active theme via CSS custom properties.

---

### 4.2.5 Portability and Deployment

**4.2.5.1** The system shall be deployable on **Windows** machines as a self-contained application via a single `.exe` installer produced by Inno Setup, requiring no prior technical setup by the end user.

**4.2.5.2** The installer shall bundle a compatible Node.js runtime (v24.x or later), eliminating any external runtime dependency on the host machine.

**4.2.5.3** The installed application shall function entirely **offline** on a local network; internet connectivity shall only be required for optional Cloudflare cloud access.

**4.2.5.4** The backend shall be accessible to any device on the same local area network (LAN) by binding to `0.0.0.0` and displaying available LAN IP addresses on startup.

**4.2.5.5** All persistent data shall be stored in a single portable SQLite file (`pos_data.sqlite`) at the project root, enabling straightforward backup, migration, and restoration.

**4.2.5.6** The frontend build artifact (`dist/`) shall be served directly by the backend Express server, requiring no separate web server or reverse proxy for production deployment.

---

### 4.2.6 Maintainability

**4.2.6.1** Backend code shall be organized into distinct layers: entry point (`server.js`), models (`/models`), routes (`/routes`), middleware (`/middleware`), utilities (`/utils`), and database config (`/config`), ensuring separation of concerns.

**4.2.6.2** Frontend code shall be organized into distinct layers: API clients (`/api`), context providers (`/context`), layout wrappers (`/layouts`), reusable components (`/components`), and page-level views (`/pages`).

**4.2.6.3** All frontend component styles shall be implemented using **CSS Modules** for local scoping, preventing global style conflicts and facilitating component-level refactoring.

**4.2.6.4** The API client (`apiClient.js`) shall serve as the single point of configuration for all HTTP communication, including authentication header injection and 401 error handling, to avoid scattered authentication logic.

**4.2.6.5** Database schema evolution shall be managed by Sequelize's `sync()` mechanism. Destructive resets shall only occur through the explicit `{ force: true }` flag, used solely in the factory reset flow.

**4.2.6.6** The system shall include an `emergency-reset.js` script as a documented recovery procedure for lockout scenarios, reducing dependency on database tools for account recovery.

---

### 4.2.7 Compatibility

**4.2.7.1** The frontend application shall be compatible with modern versions of **Google Chrome**, **Microsoft Edge**, and **Firefox** (latest two stable releases).

**4.2.7.2** The application's print receipt functionality shall rely on the browser's native `window.print()` API and shall not depend on any physical thermal printer driver or third-party print library.

**4.2.7.3** The backend shall run on **Node.js v24.x** and shall not use APIs deprecated or removed in that version.

**4.2.7.4** The frontend application shall be responsive and support display resolutions from **768px width** (tablet) and above. The POS terminal shall be optimized for landscape tablet usage.

---

### 4.2.8 Scalability Constraints

**4.2.8.1** The system is designed for **single-location, single-store** deployment. It is not designed to support multi-branch or multi-tenant operations in its current version.

**4.2.8.2** SQLite is used as the database engine. It is appropriate for the expected concurrent load (under 10 simultaneous writes). Should concurrent write frequency exceed this threshold in a future version, migration to a client-server database (e.g., PostgreSQL) should be considered.

**4.2.8.3** The Node.js cluster mode implements a **single worker** architecture. Scaling to multiple workers is not supported in the current version due to SQLite's single-writer constraint.

---

### 4.2.9 Data Integrity and Auditability

**4.2.9.1** Order records shall never be deleted from the system. Historical orders shall be preserved permanently for audit and reporting purposes.

**4.2.9.2** Deleting a product shall not delete associated historical order items; the `product_id` foreign key on `order_items` shall be set to NULL to preserve the order record with the item's name and price captured at time of sale.

**4.2.9.3** Every manual inventory stock adjustment shall produce an immutable `StockLog` entry recording what changed, by how much, and why, providing a complete audit trail.

**4.2.9.4** The system shall record the cashier's name (denormalized string) on both the `orders` table and notification entries, ensuring historical records remain readable even if the originating user account is later deleted.

**4.2.9.5** The database backup (export) file shall be a raw, unmodified copy of the SQLite binary file, ensuring full integrity verification and compatibility with standard SQLite tooling.
