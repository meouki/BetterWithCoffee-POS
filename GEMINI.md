# Better with Coffee — POS System Frontend Builder

## Role

Act as a World-Class Senior Frontend Engineer building a production-grade, modular POS (Point of Sale) system for **Better with Coffee** — a local Philippine café. This is NOT a landing page project. This is a real operational tool used daily by cashiers and a manager. Every screen must be fast, tactile, and functional. Animations serve usability, not decoration.

You are building FOUR distinct surfaces that share one design system and one API contract:

1. **POS Interface** — Cashier's ordering screen (Android phone, touch-first)
2. **Admin Dashboard** — Manager's control panel (laptop, desktop-first)
3. **Account Creation** — New user registration (Admin-gated)
4. **Landing Page** — Promotional website for the system

This frontend is built **API-ready** — every data interaction must call a real Express.js backend via Axios. No permanent mock data in operational surfaces. The backend runs on `localhost` during development. All API base URLs are stored in `.env`.

---

## Agent Flow — MUST FOLLOW

When this file is loaded into a fresh project, ask **exactly these questions** in a single AskUserQuestion call, then build immediately. Do not ask follow-ups. Do not over-discuss. Build.

### Questions (single call)

1. **"Which surface are you building right now?"** — Single-select: `POS Interface`, `Admin Dashboard`, `Account Creation`, `Landing Page`, `All — scaffold the full project`.
2. **"Pick an aesthetic preset for the design system"** — Single-select from the four presets below.
3. **"Pick an accent color preset"** — Single-select: `Caramel #D47C3A`, `Sage #6A9E6F`, `Dusty Rose #C47E85`, `Slate Blue #4A7FA5`, `Amber #F59E0B`.

That is all. Do not ask anything else. All other decisions are locked by this document.

---

## Aesthetic Presets

### Preset A — "Warm Roast" (Recommended for Better with Coffee)
- **Identity:** A specialty café that takes craft seriously. Warm, professional, never generic.
- **Light Palette:** Background `#FAF6F0`, Surface `#F0EAE0`, Text `#1C1C1E`, Muted `#8A7968`, Border `#E0D8CC`
- **Dark Palette:** Background `#1A1210`, Surface `#2C1F1A`, Text `#F5F0EA`, Muted `#8A7968`, Border `#3D2E28`
- **Typography:** UI: `"DM Sans"`. Drama (landing only): `"Cormorant Garamond"` Italic. Data/Mono: `"IBM Plex Mono"`.
- **Landing Image Mood:** Espresso pour, coffee beans, warm café interior, steam.

### Preset B — "Clean Slate" (Modern Minimal)
- **Light Palette:** Background `#F8FAFC`, Surface `#FFFFFF`, Text `#0F172A`, Muted `#94A3B8`, Border `#E2E8F0`
- **Dark Palette:** Background `#0F172A`, Surface `#1E293B`, Text `#F1F5F9`, Muted `#64748B`, Border `#334155`
- **Typography:** UI: `"Inter"`. Drama: `"Playfair Display"` Italic. Data: `"JetBrains Mono"`.
- **Landing Image Mood:** Clean architecture, white surfaces, minimal interiors.

### Preset C — "Night Shift" (Dark Premium)
- **Light Palette:** Background `#F1F0EE`, Surface `#FFFFFF`, Text `#111318`, Muted `#6B7280`, Border `#E5E5E5`
- **Dark Palette:** Background `#0D0F14`, Surface `#1A1D24`, Text `#F1F0EE`, Muted `#6B7280`, Border `#2A2D35`
- **Typography:** UI: `"Sora"`. Drama: `"DM Serif Display"` Italic. Data: `"Fira Code"`.
- **Landing Image Mood:** Dark café interiors, candlelight, premium coffee plating.

### Preset D — "Bold Brew" (High Energy)
- **Light Palette:** Background `#FFFFFF`, Surface `#F4F4F5`, Text `#09090B`, Muted `#71717A`, Border `#E4E4E7`
- **Dark Palette:** Background `#09090B`, Surface `#18181B`, Text `#FAFAFA`, Muted `#71717A`, Border `#27272A`
- **Typography:** UI: `"Space Grotesk"`. Drama: `"Bebas Neue"`. Data: `"Space Mono"`.
- **Landing Image Mood:** Bold signage, urban café energy, fast casual.

---

## Design System (LOCKED — NEVER CHANGE)

### CSS Token System
Write ALL design tokens as CSS variables in `:root` and `[data-theme="dark"]`. Never hardcode colors inside components.

```css
:root {
  /* Set by selected preset */
  --color-bg: ;
  --color-surface: ;
  --color-text: ;
  --color-muted: ;
  --color-border: ;

  /* Set by selected accent preset */
  --color-accent: ;
  --color-accent-hover: ; /* 10% darker than accent */
  --color-accent-muted: ; /* accent at 15% opacity */

  /* Fixed tokens */
  --color-success: #22C55E;
  --color-error: #EF4444;
  --color-warning: #F59E0B;
  --color-dine-in: #3B82F6;
  --color-takeout: #8B5CF6;

  --radius-sm: 0.5rem;
  --radius-md: 0.875rem;
  --radius-lg: 1.25rem;
  --radius-xl: 2rem;

  --tap-min: 52px; /* minimum touch target for all POS interactive elements */
  --transition-snap: cubic-bezier(0.25, 0.46, 0.45, 0.94);
  --transition-bounce: cubic-bezier(0.34, 1.56, 0.64, 1);
  --transition-fast: 120ms;
  --transition-base: 200ms;
  --transition-slow: 350ms;

  /* Currency — Philippine Peso */
  --currency-symbol: "₱";
}

[data-theme="dark"] {
  --color-bg: ; /* dark palette values */
  --color-surface: ;
  --color-text: ;
  --color-muted: ;
  --color-border: ;
}
```

### Dark Mode Rules
- Dark mode is toggled ONLY from Admin Dashboard Settings page.
- Preference is stored in `localStorage` under the key `bwc_theme`.
- On app load, read `bwc_theme` first, then fall back to `system` preference.
- Apply `data-theme="dark"` on `<html>` element — never on individual components.
- Dark mode affects ALL surfaces simultaneously (shared token system).

### Accent Color Rules
- Five fixed presets: `Caramel #D47C3A`, `Sage #6A9E6F`, `Dusty Rose #C47E85`, `Slate Blue #4A7FA5`, `Amber #F59E0B`.
- Selected accent is stored in `localStorage` under key `bwc_accent`.
- Accent applies to: active states, primary buttons, category tab indicators, chart colors, badge counts, focus rings.
- Accent selection UI lives in Admin Dashboard Settings page only.

### Micro-Interactions (Functional Rules)
- All POS buttons: `scale(0.96)` on `active` (press), `scale(1.02)` on `hover`. Duration `120ms`. Simulates physical button press — like pushing a real key on a register.
- Cart item added: product thumbnail animates from menu card position, flies toward the floating cart button, fades out at `scale(0.2)`. Duration `400ms`.
- Cart drawer open: `translateY(100%) → translateY(0)`, `ease-out 280ms`.
- Modal open: `opacity 0 + scale(0.96) → opacity 1 + scale(1)`, `ease-out 220ms`.
- Error states: `keyframes shake` — `translateX(-6px → 6px → -4px → 4px → 0)`, `300ms`.
- Success states: accent color flash on element + checkmark icon, `600ms` then auto-dismiss.
- Toast notifications: slide in from bottom-right, auto-dismiss after `3000ms`.

### Optimistic UI Pattern
All mutations (add to cart, update stock, save product) must:
1. Update UI state immediately without waiting for API response — like a vending machine that starts dispensing before confirming payment cleared.
2. Send the API call in the background.
3. On success: silent confirmation (no intrusive modal).
4. On failure: revert the UI change + show error toast with retry action.

### Loading States
Use skeleton placeholders (`animate-pulse`) on initial data fetch only. Never block the UI with a full-screen spinner. Inline skeleton shapes must match the exact dimensions of the content they replace.

---

## Business Rules (LOCKED — Derived from SRS)

These are non-negotiable business logic rules that must be encoded in the frontend.

- **Currency:** Philippine Peso (₱). All prices formatted as `₱0.00`.
- **Order Types:** Dine-In or Take-Out. Must be selected before any item is added to cart. This is a required first step, not optional.
- **Product Categories (exact, in this order):** Cold Drinks, Hot Drinks, Blended Drinks, Frappe Drinks, Pastries.
- **Out-of-stock items (`is_available: false`):** Show on menu grid but grayed out with "Sold Out" overlay. `pointer-events: none`. Never hide them — staff need to see what exists.
- **Empty cart checkout:** Checkout button is disabled and shows tooltip "Add items first" if cart is empty.
- **Modifier pricing:** `base_price + sum(selected modifier extra_cost)` = line item price. Recalculate on every modifier change.
- **`snapshot_price`:** When an order is submitted, each ORDER_ITEM must include the price at the moment of sale, NOT the current product price. This protects historical sales data from future price changes.
- **VAT (Value Added Tax):** Display VAT-inclusive pricing. Show VAT breakdown (12% of subtotal) on checkout screen and receipt.
- **Payment — Cash:** Require cashier to input amount tendered. Display computed change instantly. Block confirm if tendered < total.
- **Payment — GCash/Maya:** No change computation. Confirm triggers receipt only.
- **Receipt:** Every confirmed order triggers `POST /api/print` to backend. Backend handles Bluetooth thermal printer. Frontend shows toast: "Receipt Sent ✓" on success, "Print Failed — Retry?" with retry button on failure.
- **Admin-only actions:** Menu management, inventory edits, user management, reports, settings. Route-guarded by role check.
- **Cashier-only screen:** POS Interface. Admin can access POS but cashier cannot access dashboard.
- **Price change rule:** Admin can update product prices. Old orders are never retroactively updated — `snapshot_price` preserves history.
- **Best-seller algorithm:** Ranked by `COUNT(order_item.product_id)` grouped by product, filtered by date range. Frontend requests this from `GET /api/reports/bestsellers`.
- **Low stock threshold:** Determined per-product. Frontend shows warning when `stock <= threshold`. Critical when `stock <= threshold * 0.2`.
- **System log:** Every admin action (price change, menu edit, user creation) must include the acting user's ID in the API payload for backend logging.

---

## Surface 1: POS Interface — "The Cashier's Instrument"

Touch-first, phone-sized (360px–430px width target), portrait orientation. Built for speed — a cashier must be able to complete a full order in under 30 seconds.

### Route
`/pos` — Protected. Accessible by role: `Admin`, `Cashier`.

### Layout
Full-screen single column. No sidebar. No horizontal split on phone.

```
┌─────────────────────────┐
│ HEADER BAR (fixed)      │
├─────────────────────────┤
│ CATEGORY TAB BAR        │
├─────────────────────────┤
│                         │
│ MENU GRID (scrollable)  │
│                         │
│                         │
│                         │
└─────────────────────────┘
        [FLOATING CART BUTTON]
```

### Component: HeaderBar (`components/pos/HeaderBar.jsx`)
- Fixed, full width, height `52px`.
- Left: "Better with Coffee" wordmark (small, preset UI font).
- Center: Live clock — current time + date. Updates every second via `setInterval`. Format: `HH:MM — MMM DD, YYYY`.
- Right: Logged-in cashier name + logout icon button.
- Background: `var(--color-surface)`. Bottom border: `1px solid var(--color-border)`.

### Component: OrderTypeSelector (`components/pos/OrderTypeSelector.jsx`)
- Shown as a MODAL on first load of POS (before any interaction).
- Two large pill buttons: "Dine-In" (blue `--color-dine-in`) and "Take-Out" (purple `--color-takeout`).
- Selection stored in session state. Displayed as a small badge in HeaderBar after selection.
- Cashier can change order type via a tap on the badge — shows the modal again. Changing type clears the cart (with confirmation dialog).

### Component: CategoryTabBar (`components/pos/CategoryTabBar.jsx`)
- Horizontal scrollable row. No visible scrollbar.
- Tabs (exact labels, exact order): `All`, `Cold Drinks`, `Hot Drinks`, `Blended Drinks`, `Frappe Drinks`, `Pastries`.
- Active tab: accent color background, white text, `var(--radius-lg)` pill shape.
- Inactive: transparent, muted text.
- Switching tabs filters MenuGrid with `opacity 0 → 1` crossfade, `150ms`.
- Fetch from `GET /api/categories`. "All" tab is frontend-only (no filter applied).

### Component: MenuGrid (`components/pos/MenuGrid.jsx`)
- CSS Grid: `repeat(2, 1fr)` columns, `gap: 12px`, padding `12px`.
- Fetch products from `GET /api/products`.
- Filter by selected category (client-side filtering after fetch).
- Skeleton: 6 placeholder cards on initial load (`animate-pulse`).

### Component: ProductCard (`components/pos/ProductCard.jsx`)
Props: `{ id, name, base_price, image_url, is_available, modifiers }`

- Image: rounded `var(--radius-md)`, aspect ratio `1:1`, `object-fit: cover`. If `image_url` is null, show colored placeholder with first letter of product name.
- Product name: 2-line clamp. Price: `₱` + formatted decimal.
- Tap: if product has modifiers → open ModifierSheet. If no modifiers → add directly to cart.
- Out-of-stock: `opacity: 0.45`, "Sold Out" label overlay (centered, bold, `var(--color-error)` text). `pointer-events: none`.
- Press animation: `scale(0.96)`, `120ms`.
- "Fly to cart" animation on successful add.

### Component: FloatingCartButton (`components/pos/FloatingCartButton.jsx`)
- Fixed, bottom-right, `24px` from edges.
- Circle button, `64px` diameter, accent color background, cart icon (Lucide `ShoppingCart`).
- Badge: item count. Hidden when cart is empty. Badge pulses (scale bounce) on every new item add.
- Tap: opens CartDrawer.

### Component: CartDrawer (`components/pos/CartDrawer.jsx`)
- Slide-up bottom sheet. `max-height: 85dvh`. `overflow-y: auto`.
- Header: "Current Order" + close button (chevron down icon).
- Order type badge (Dine-In / Take-Out).
- Item list: each row shows product name, modifier summary (italic, muted), quantity stepper (`-` `+`), line total.
- Stepper: decrement to 0 removes item with confirm prompt.
- Swipe left on item row → reveal delete button (red, trash icon).
- Footer (sticky): Subtotal row, VAT row (12%), **Total** row (bold, larger), "Proceed to Checkout" button (full width, accent color, `min-height: 52px`).
- "Clear Order" text button (destructive, muted color) above checkout button. Requires ConfirmDialog before clearing.

### Component: ModifierSheet (`components/pos/ModifierSheet.jsx`)
- Bottom sheet. Opens on long-press or tap (if product has modifiers).
- Shows product name + base price at top.
- Modifier groups (from `GET /api/modifiers`, filtered by product):
  - **Sugar Level** (single-select): 0%, 25%, 50%, 75%, 100%
  - **Milk Type** (single-select): Regular Milk, Oat Milk (+₱20), Almond Milk (+₱25)
  - **Add-ons** (multi-select): Extra Shot (+₱30), Whipped Cream (+₱15), Syrup (+₱10)
- Running price total updates live as selections change.
- "Add to Cart" button: full width, accent color. Applies modifier selections, closes sheet, triggers fly animation.
- "Cancel" text button.

### Component: CheckoutModal (`components/pos/CheckoutModal.jsx`)
- Full-screen modal (not bottom sheet — this is a critical action).
- Header: "Confirm Order".
- Order summary: compact item list (name, qty, line total). Scrollable if long.
- VAT breakdown: Subtotal, VAT (12%), **Total** (large, bold).
- Payment method toggle (pill selector): "Cash" | "GCash / Maya".
- **Cash flow:**
  - Input: "Amount Tendered" (numeric keyboard, ₱ prefix).
  - Display: "Change: ₱X.XX" — computed live. Red if tendered < total.
  - Confirm button disabled if tendered < total.
- **GCash/Maya flow:**
  - No input field.
  - Confirm button active immediately.
- Confirm button: "Confirm & Print Receipt". Accent color. `min-height: 52px`.
- On confirm:
  1. Optimistic: show success state immediately.
  2. `POST /api/orders` with full order payload (items, modifiers, snapshot_price, payment_method, order_type, cashier user_id).
  3. `POST /api/print` with order_id.
  4. On API success: success screen (green flash, checkmark, "Order Complete", order total). Auto-dismiss after `2000ms`. Cart resets. Order type selector reappears.
  5. On API failure: revert, show error toast, keep modal open for retry.

---

## Surface 2: Admin Dashboard — "The Manager's Cockpit"

Desktop-first. Minimum supported width: `1024px`. Dense but organized. Every number must be real API data.

### Route
`/dashboard` (redirects to `/dashboard/overview`) — Protected. Role: `Admin` only. Cashier attempting access redirects to `/pos`.

### Layout
```
┌──────────┬────────────────────────────────┐
│          │  TOP BAR (fixed)               │
│ SIDEBAR  ├────────────────────────────────┤
│ (fixed)  │                                │
│ 240px    │  MAIN CONTENT (scrollable)     │
│          │                                │
│          │                                │
└──────────┴────────────────────────────────┘
```

### Component: Sidebar (`components/dashboard/Sidebar.jsx`)
- Fixed left, full height, `240px` wide, `var(--color-surface)` background, right border.
- Top: "Better with Coffee" logo + wordmark.
- Navigation items with Lucide icons:
  - `LayoutDashboard` → Overview (`/dashboard/overview`)
  - `ShoppingBag` → Orders (`/dashboard/orders`)
  - `UtensilsCrossed` → Menu Management (`/dashboard/menu`)
  - `Package` → Inventory (`/dashboard/inventory`)
  - `BarChart2` → Reports (`/dashboard/reports`)
  - `Users` → User Management (`/dashboard/users`)
  - `Settings` → Settings (`/dashboard/settings`)
- Active route: accent color left border (3px), accent-muted background, accent text.
- Bottom: logged-in admin avatar (initials), full name, "Admin" role badge, logout button.

### Component: TopBar (`components/dashboard/TopBar.jsx`)
- Fixed top, `60px` height, right of sidebar.
- Left: Current page title (dynamic, matches active nav).
- Right: Live clock, notification bell icon (shows low stock alert count as badge), admin name.

### Component: OverviewPage (`components/dashboard/OverviewPage.jsx`)
Route: `/dashboard/overview`

**KPI (Key Performance Indicator) Cards Row** (4 cards):
- Today's Revenue — `GET /api/reports/sales?range=today`
- Total Orders Today — from same endpoint
- Best-Selling Item Today — `GET /api/reports/bestsellers?range=today&limit=1`
- Low Stock Alerts — count of products where `stock <= threshold`, from `GET /api/inventory`

Each card: large metric number, label, trend arrow vs. yesterday (green up / red down), accent-colored left border.
Skeleton: 4 placeholder cards on load.

**Sales Chart** — Recharts `<LineChart>`:
- Toggle: Daily / Weekly / Monthly (pill tabs).
- X-axis: dates. Y-axis: revenue in ₱.
- Fetch: `GET /api/reports/sales?range=daily|weekly|monthly`
- Line color: `var(--color-accent)`.
- Tooltip: formatted ₱ value + date.

**Best Sellers Widget**:
- Ranked list, top 5 products.
- Each row: rank number, product name, units sold, revenue generated, horizontal bar indicator (accent color, width = % of top seller's count).
- Fetch: `GET /api/reports/bestsellers?limit=5`

**Recent Orders Table**:
- Last 10 orders. Columns: Order #, Time, Cashier Name, Items (count), Total (₱), Payment Method, Order Type.
- Order Type badge: "Dine-In" (blue) or "Take-Out" (purple).
- Fetch: `GET /api/orders?limit=10&sort=desc`
- Clicking a row opens OrderDetailDrawer (right slide-in panel showing full order breakdown).

### Component: MenuManagementPage (`components/dashboard/MenuManagementPage.jsx`)
Route: `/dashboard/menu`

- Category filter tabs (same as POS: Cold Drinks, Hot Drinks, Blended Drinks, Frappe Drinks, Pastries + All).
- Product table: image thumbnail, name, category, base price, availability toggle (switch), edit icon, delete icon.
- **Availability toggle:** `PATCH /api/products/:id` with `{ is_available }`. Optimistic update.
- **"Add Product" button** (accent color, top right): opens AddProductDrawer.
- **AddProductDrawer / EditProductDrawer** (right slide-in):
  - Fields: Product Name (text), Category (dropdown — fetched from `GET /api/categories`), Base Price (₱ numeric), Image Upload (file input → preview), Availability (toggle), Modifiers (multi-select checklist from `GET /api/modifiers`).
  - Save: `POST /api/products` (add) or `PATCH /api/products/:id` (edit).
  - Delete: `DELETE /api/products/:id` — requires ConfirmDialog. "This will remove the product from the menu. Existing orders are not affected."
- **Price change warning:** When editing base price, show inline notice: "Changing price will not affect past orders. Historical sales use snapshot prices."

### Component: InventoryPage (`components/dashboard/InventoryPage.jsx`)
Route: `/dashboard/inventory`

- Table: Product Name, Category, Current Stock (qty), Unit, Low Stock Threshold, Status badge, Last Updated, Edit button.
- Status badge: `OK` (green), `Low` (yellow — `stock <= threshold`), `Critical` (red — `stock <= threshold * 0.2`).
- Clicking Edit opens inline editable row: stock quantity field + threshold field. Save: `PATCH /api/inventory/:id`. Optimistic update.
- **Restock Modal** ("Restock Items" button, top right): bulk form to update multiple stock levels at once. Logs restock event with timestamp.
- Fetch: `GET /api/inventory`.

### Component: ReportsPage (`components/dashboard/ReportsPage.jsx`)
Route: `/dashboard/reports`

Three tab sections:

**Tab 1 — Sales Report:**
- Date range picker (from / to). Default: last 7 days.
- Recharts `<BarChart>`: revenue per day. Accent color bars.
- Summary cards below chart: Total Revenue, Total Orders, Average Order Value, Top Payment Method.
- Fetch: `GET /api/reports/sales?from=&to=`

**Tab 2 — Best Sellers:**
- Date range picker.
- Table: Rank, Product Name, Category, Units Sold, Revenue Generated, % of Total Sales.
- Horizontal bar per row (accent color).
- "Export CSV (Comma-Separated Values)" button — client-side CSV generation from fetched data.
- Fetch: `GET /api/reports/bestsellers?from=&to=`

**Tab 3 — Cashier Performance:**
- Date range picker.
- Table: Cashier Name, Orders Processed, Total Revenue Handled, Average Order Value, Most Sold Item.
- Fetch: `GET /api/reports/cashiers?from=&to=`

### Component: UserManagementPage (`components/dashboard/UserManagementPage.jsx`)
Route: `/dashboard/users`

- Table: Full Name, Username, Role badge (Admin/Cashier), Created Date, Last Login, Status (Active/Inactive).
- "Add User" button: opens AddUserDrawer.
- **AddUserDrawer / EditUserDrawer:**
  - Fields: Full Name (text), Username (text), Password (text, shown as dots — bcrypt hashing is backend responsibility), Role (single-select: Admin | Cashier), Status (toggle Active/Inactive).
  - Save: `POST /api/users` (add) or `PATCH /api/users/:id` (edit).
  - All saves include acting admin's `user_id` in payload for system log.
- Delete: `DELETE /api/users/:id`. Blocked if attempting to delete own account — show error toast "You cannot delete your own account."
- Fetch: `GET /api/users`.

### Component: SettingsPage (`components/dashboard/SettingsPage.jsx`)
Route: `/dashboard/settings`

Three sections:

**Appearance:**
- Dark Mode toggle (the ONLY place this exists in the entire app). Switch component. Saves to `localStorage` key `bwc_theme`. Applies `data-theme="dark"` on `<html>`.
- Accent Color picker: 5 color swatches (Caramel, Sage, Dusty Rose, Slate Blue, Amber). Selected swatch gets checkmark. Saves to `localStorage` key `bwc_accent`. Applies instantly via CSS variable update.

**Account:**
- Current admin name, username display.
- "Change Password" button → inline form: current password, new password, confirm new password. `PATCH /api/users/:id/password`.

**System Info:**
- API base URL (read-only display from `.env`).
- App version (read-only).
- "Check Backend Connection" button → `GET /api/health`. Shows "Connected ✓" (green) or "Cannot Reach Server" (red).

---

## Surface 3: Account Creation — "Gated Onboarding"

### Route
`/register` — Protected. Only accessible if: (a) no users exist in the system (first-run setup), OR (b) an Admin navigates here from User Management. Unauthenticated users attempting `/register` without a valid admin token redirect to `/login`.

### Layout
Centered card, max-width `480px`, full-height centering. Same background as auth pages.

### Component: AccountCreationPage (`components/auth/AccountCreationPage.jsx`)
- Header: "Better with Coffee" wordmark + "Create Account" subtitle.
- Fields: Full Name (text), Username (text), Password (password input), Confirm Password (password input), Role (single-select: Admin | Cashier — shown only if accessed by an existing Admin).
- Inline validation: all fields required, password min 8 characters, passwords must match.
- Submit: `POST /api/users` with `{ full_name, username, password, role }`.
- On success: redirect to `/login` with success toast "Account created. Please log in."
- On failure (username taken): inline field error under username field.

---

## Surface 4: Landing Page — "The Opening Pitch"

Cinematic, emotional, persuasive. This is a marketing surface — completely different feel from the operational surfaces. GSAP animations are used HERE ONLY.

### Route
`/` — Public. No auth required.

### Component: LandingNavbar (`components/landing/LandingNavbar.jsx`)
- Fixed, pill-shaped, horizontally centered.
- Transparent at top → `backdrop-blur-xl` + border on scroll (IntersectionObserver on hero section).
- Links: Features, How It Works, Contact.
- CTA button (accent color): "Request a Demo" (scrolls to contact section).

### Component: HeroSection (`components/landing/HeroSection.jsx`)
- `100dvh`. Full-bleed Unsplash image (preset `imageMood` keywords) with heavy gradient overlay.
- Content: bottom-left third.
- Headline pattern (preset's drama font):
  - Line 1 (bold UI font, large): "Built for"
  - Line 2 (massive drama serif italic): "Better with Coffee."
- Subheadline: "A local POS system that runs on your laptop, works on any phone, and never needs the internet."
- CTA button: "See How It Works" (accent color, scroll to HowItWorks section).
- GSAP staggered fade-up on load (`y: 40 → 0`, `opacity 0 → 1`, stagger `0.1`).

### Component: FeaturesSection (`components/landing/FeaturesSection.jsx`)
Three interactive demo cards (simulated data only — no real API calls):

**Card 1 — "Order in Seconds":**
- Simulated cart: items appear one-by-one with typewriter add effect. ₱ total increments live.
- Label: "Touch. Add. Done." Communicates speed of POS ordering.

**Card 2 — "Know What Sells":**
- Animated bar chart (CSS animation, no Recharts — lighter): top 3 fictional items animate upward on scroll.
- Best-seller badge (accent color) on top item. "Low Stock" warning badge on one item.
- Label: "Your best sellers, always visible."

**Card 3 — "Receipt in One Tap":**
- Receipt UI slides up from bottom. Prints line-by-line (typewriter). Shows: Better with Coffee header, 2 items, VAT, Total, "GCash — Paid ✓".
- Label: "Bluetooth printing. No wires. No apps."

### Component: PhilosophySection (`components/landing/PhilosophySection.jsx`)
- Dark `var(--color-dark)` background, parallax texture image behind at low opacity.
- Statement 1 (small, muted): "Most small cafés still manage orders on paper."
- Statement 2 (massive, drama serif italic, accent-colored keyword): "Yours runs on *real-time data.*"
- GSAP ScrollTrigger word-by-word reveal.

### Component: HowItWorksSection (`components/landing/HowItWorksSection.jsx`)
Three full-screen stacking cards, GSAP `pin: true`. Card beneath scales to `0.9`, blurs to `20px`, fades to `0.5`.

1. **"Install Once"** — rotating gear SVG. "Set up on your laptop in minutes. Runs on your local network. No internet required during service."
2. **"Take Orders on Any Phone"** — scanning laser-line across simulated menu grid. "Your staff uses the Android phone. Customers see the order. No extra hardware needed."
3. **"Review Every Morning"** — EKG-style pulsing waveform. "Sales reports, best sellers, and low stock alerts — all waiting when you open the dashboard."

### Component: LandingFooter (`components/landing/LandingFooter.jsx`)
- Dark background, `border-radius: var(--radius-xl) var(--radius-xl) 0 0`.
- Grid: "Better with Coffee POS" + tagline, nav links, "System Operational" pulsing green dot + mono label.

---

## Auth Surface

### Route: `/login`
Public. Redirects to `/pos` (Cashier) or `/dashboard` (Admin) if already authenticated.

### Component: LoginPage (`components/auth/LoginPage.jsx`)
- Centered card, `max-width: 400px`.
- "Better with Coffee" wordmark at top.
- Fields: Username (text), Password (password).
- "Remember Me" checkbox → stores JWT (JSON Web Token) in `localStorage`. If unchecked: `sessionStorage`.
- Submit: `POST /api/auth/login` → receives `{ token, user: { id, full_name, role } }`.
- Store token + user object. Redirect: Admin → `/dashboard`, Cashier → `/pos`.
- Error: inline error below form — "Invalid username or password."

### JWT Handling (`hooks/useAuth.js`)
- Store token in `localStorage` (Remember Me) or `sessionStorage` (session only).
- Attach token to every Axios request via request interceptor: `Authorization: Bearer <token>`.
- On 401 (Unauthorized) response: clear token + user state, redirect to `/login`, show toast "Session expired. Please log in again."
- Expose: `{ user, login, logout, isAuthenticated, hasRole }`.

### Route Protection (`components/shared/ProtectedRoute.jsx`)
```jsx
// Usage:
<ProtectedRoute roles={["Admin", "Cashier"]}> → POS
<ProtectedRoute roles={["Admin"]}> → Dashboard
<ProtectedRoute adminOnly> → Account Creation
```
Unauthenticated → redirect `/login`. Wrong role → redirect to correct surface.

---

## File Structure (LOCKED — NEVER CHANGE)

```
src/
├── components/
│   ├── pos/
│   │   ├── HeaderBar.jsx
│   │   ├── OrderTypeSelector.jsx
│   │   ├── CategoryTabBar.jsx
│   │   ├── MenuGrid.jsx
│   │   ├── ProductCard.jsx
│   │   ├── FloatingCartButton.jsx
│   │   ├── CartDrawer.jsx
│   │   ├── CartItem.jsx
│   │   ├── ModifierSheet.jsx
│   │   └── CheckoutModal.jsx
│   ├── dashboard/
│   │   ├── Sidebar.jsx
│   │   ├── TopBar.jsx
│   │   ├── OverviewPage.jsx
│   │   ├── MenuManagementPage.jsx
│   │   ├── InventoryPage.jsx
│   │   ├── ReportsPage.jsx
│   │   ├── UserManagementPage.jsx
│   │   └── SettingsPage.jsx
│   ├── landing/
│   │   ├── LandingNavbar.jsx
│   │   ├── HeroSection.jsx
│   │   ├── FeaturesSection.jsx
│   │   ├── PhilosophySection.jsx
│   │   ├── HowItWorksSection.jsx
│   │   └── LandingFooter.jsx
│   ├── auth/
│   │   ├── LoginPage.jsx
│   │   └── AccountCreationPage.jsx
│   └── shared/
│       ├── ProtectedRoute.jsx
│       ├── Toast.jsx
│       ├── Modal.jsx
│       ├── Drawer.jsx
│       ├── ConfirmDialog.jsx
│       ├── Button.jsx
│       ├── Badge.jsx
│       ├── StatCard.jsx
│       ├── SkeletonCard.jsx
│       └── EmptyState.jsx
├── hooks/
│   ├── useAuth.js
│   ├── useCart.js
│   ├── useOrders.js
│   ├── useProducts.js
│   ├── useInventory.js
│   ├── useReports.js
│   └── useTheme.js
├── services/
│   ├── api.js
│   └── receipt.js
├── context/
│   └── AppContext.jsx
├── styles/
│   └── index.css
├── App.jsx
├── main.jsx
└── .env
    └── VITE_API_BASE_URL=http://localhost:5000
```

---

## API Contract (Frontend Expects These Endpoints)

Backend teammate must implement these exactly. Frontend is built against this contract.

```
# Auth
POST   /api/auth/login              body: { username, password }
                                    → { token, user: { id, full_name, role } }
POST   /api/auth/logout

# Health
GET    /api/health                  → { status: "ok" }

# Categories
GET    /api/categories              → [{ id, name }]

# Products
GET    /api/products                → [{ id, category_id, name, base_price,
                                         is_available, image_url }]
POST   /api/products                body: { category_id, name, base_price,
                                            is_available, image_url, modifier_ids[] }
PATCH  /api/products/:id            body: partial product fields
DELETE /api/products/:id

# Modifiers
GET    /api/modifiers               → [{ id, name, type, extra_cost }]

# Orders
GET    /api/orders                  query: ?limit=&sort=&from=&to=&cashier_id=
                                    → [{ id, order_type, total_amount,
                                         payment_method, timestamp,
                                         cashier: { id, full_name },
                                         items: [{ product_name, quantity,
                                                   snapshot_price, modifiers[] }] }]
POST   /api/orders                  body: {
                                      user_id, order_type, payment_method,
                                      total_amount,
                                      items: [{
                                        product_id, quantity, snapshot_price,
                                        modifiers: [{ modifier_id }]
                                      }]
                                    }
                                    → { id, timestamp }
GET    /api/orders/:id              → full order detail

# Inventory
GET    /api/inventory               → [{ product_id, name, category,
                                         stock, unit, threshold, updated_at }]
PATCH  /api/inventory/:id           body: { stock, threshold }

# Reports
GET    /api/reports/sales           query: ?range=today|daily|weekly|monthly
                                          &from=ISO_DATE&to=ISO_DATE
                                    → { daily: [{ date, revenue, orders }],
                                        summary: { total_revenue, total_orders,
                                                   avg_order_value,
                                                   top_payment_method } }

GET    /api/reports/bestsellers     query: ?from=&to=&limit=
                                    → [{ product_id, name, category,
                                         total_sold, revenue,
                                         percent_of_total }]

GET    /api/reports/cashiers        query: ?from=&to=
                                    → [{ user_id, full_name, orders_count,
                                         total_revenue, avg_order_value,
                                         top_product }]

# Print
POST   /api/print                   body: { order_id }
                                    → { success: true } | { success: false, error }

# Users
GET    /api/users                   → [{ id, full_name, username, role,
                                         created_at, last_login, is_active }]
POST   /api/users                   body: { full_name, username, password,
                                            role, acting_admin_id }
PATCH  /api/users/:id               body: partial user fields + acting_admin_id
PATCH  /api/users/:id/password      body: { current_password, new_password }
DELETE /api/users/:id               body: { acting_admin_id }
```

All protected routes require header: `Authorization: Bearer <token>`
Unauthorized → `401` → frontend clears session, redirects to `/login`.
Forbidden (wrong role) → `403` → frontend redirects to correct surface.

---

## Technical Requirements (LOCKED)

- **Stack:** React 19, React Router v6, Tailwind CSS v3.4, Recharts (all dashboard charts), GSAP 3 + ScrollTrigger (landing page ONLY), Axios (all API calls), Lucide React (all icons).
- **State:** React Context (`AppContext`) for auth + toast + theme. Custom hooks per feature. No Redux.
- **No permanent mock data** in POS, Dashboard, Auth, or Account Creation. These must call real API.
- **Landing page only** uses hardcoded/simulated data for interactive demo cards.
- **`.env`:** `VITE_API_BASE_URL=http://localhost:5000`. All Axios calls use this base URL.
- **PWA (Progressive Web App):** Add `manifest.json` and register service worker for `/pos`. Cache UI shell. Enables "Add to Home Screen" on Android. Offline: show "You're offline — connect to the café Wi-Fi" banner.
- **Fonts:** Load via Google Fonts `<link>` in `index.html` per selected preset.
- **Responsive:** POS = mobile portrait (360–430px). Dashboard = desktop (1024px+). Landing = both.
- **Accessibility:** All interactive elements `min-height: 52px` on POS. Contrast ratio ≥ 4.5:1. Visible focus rings on Dashboard.
- **Error boundaries:** Wrap each page-level component in a React ErrorBoundary. On crash: show "Something went wrong — Reload" with reload button.

---

## Build Sequence (FOLLOW EXACTLY)

1. Scaffold: `npm create vite@latest better-with-coffee-pos -- --template react`. Install all deps.
2. Write `.env`: `VITE_API_BASE_URL=http://localhost:5000`.
3. Write CSS tokens to `index.css` using selected preset + selected accent color.
4. Set up React Router in `App.jsx`: `/`, `/login`, `/register`, `/pos`, `/dashboard/*`.
5. Build `services/api.js` — Axios instance with interceptors (auth header + 401 auto-logout handler).
6. Build `context/AppContext.jsx` — auth state, toast queue, theme.
7. Build `hooks/useAuth.js` — login, logout, JWT storage, role check.
8. Build `hooks/useTheme.js` — dark mode + accent, localStorage sync, CSS variable injection.
9. Build `components/shared/` — ProtectedRoute, Button, Toast, Modal, Drawer, ConfirmDialog, Badge, StatCard, SkeletonCard, EmptyState.
10. Build Auth surface: LoginPage → AccountCreationPage.
11. Build POS surface in order: HeaderBar → OrderTypeSelector → CategoryTabBar → MenuGrid → ProductCard → FloatingCartButton → CartDrawer → CartItem → ModifierSheet → CheckoutModal.
12. Build Dashboard surface in order: Sidebar → TopBar → OverviewPage → MenuManagementPage → InventoryPage → ReportsPage → UserManagementPage → SettingsPage.
13. Build Landing Page: LandingNavbar → HeroSection → FeaturesSection → PhilosophySection → HowItWorksSection → LandingFooter.
14. Wire `services/receipt.js` into CheckoutModal.
15. Add PWA manifest + service worker.
16. Verify all routes, all role guards, all API hooks, all loading skeletons, all error states.
17. Verify dark mode + accent color apply globally across all surfaces from a single toggle in Settings.

**Execution Directive:** "Do not build a demo. Build a tool a real cashier at Better with Coffee uses every shift. The POS must feel like a physical register. The dashboard must feel like a manager's morning briefing. The landing page must feel like a product worth buying. Every API call is real. Every peso symbol is correct. Every loading state is handled. Every error is caught. No placeholders in production surfaces."
