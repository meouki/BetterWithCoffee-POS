<!-- GSD:docs-update -->
# Development Guide — PulsePoint POS

This guide covers running PulsePoint in development mode with hot reload, the folder structure, and typical development workflows.

---

## Development Mode (Hot Reload)

PulsePoint has two separate dev servers — the Vite frontend and the Node.js backend. Run them simultaneously in two terminals:

### Terminal 1 — Backend
```bash
cd backend_rewrite
npm install       # first time only
node server.js
```
The backend starts on `http://localhost:5000`. It serves the API and watches for file changes using Node's native module caching (no nodemon needed, but you can add it).

> For auto-restart on file changes during development:
> ```bash
> npx nodemon server.js
> ```

### Terminal 2 — Frontend (Vite Dev Server)
```bash
cd frontend
npm install       # first time only
npm run dev
```
Vite starts on `http://localhost:5173` (or next available port) with HMR. Make sure `frontend/.env` has:
```
VITE_API_URL=http://localhost:5000
```

Vite proxies API calls to the backend, so the frontend always talks to `localhost:5000`.

---

## Project Structure

```
POS-PulsePoint/
│
├── backend_rewrite/
│   ├── config/
│   │   └── db.js               # Sequelize instance (points to pos_data.sqlite)
│   ├── middleware/
│   │   └── auth.js             # Session auth middleware
│   ├── models/
│   │   ├── index.js            # Model registry + associations
│   │   ├── User.js
│   │   ├── Product.js
│   │   ├── Category.js
│   │   ├── Order.js
│   │   ├── OrderItem.js
│   │   ├── Inventory.js
│   │   ├── Recipe.js
│   │   ├── ProductSize.js
│   │   ├── StockLog.js
│   │   ├── Notification.js
│   │   └── Attendance.js
│   ├── routes/
│   │   ├── users.js
│   │   ├── products.js
│   │   ├── categories.js
│   │   ├── orders.js
│   │   ├── inventory.js
│   │   ├── product-sizes.js
│   │   ├── recipes.js
│   │   ├── attendance.js
│   │   ├── notifications.js
│   │   └── system.js
│   ├── utils/
│   │   └── tunnelManager.js    # Cloudflare tunnel process manager
│   ├── uploads/                # Product images (WebP, auto-created)
│   ├── server.js               # Entry point
│   └── emergency-reset.js      # Master password reset CLI
│
├── frontend/
│   └── src/
│       ├── api/                # Fetch wrapper + per-resource API modules
│       ├── components/
│       │   ├── shared/         # ProtectedRoute, ProfilePanel, AmbientBackground, Loader, Skeleton
│       │   ├── dashboard/      # TopBar, Sidebar, ProductDrawer, UserDrawer, RecipeBuilder, ...
│       │   └── pos/            # HeaderBar, CategoryTabBar, MenuGrid, CartDrawer, CheckoutModal, ...
│       ├── context/            # AuthContext, ProductContext, OrderContext, NotificationContext
│       ├── layouts/            # DashboardLayout, POSLayout, PublicLayout
│       ├── pages/
│       │   ├── dashboard/      # OverviewPage, OrdersPage, MenuManagementPage, InventoryPage, ...
│       │   └── public/         # LandingPage, LoginPage, AccountCreationPage
│       ├── App.jsx             # Root: providers, router, theme init
│       └── index.css           # Global design tokens (CSS custom properties)
│
├── installer/
│   ├── pulsepoint.iss          # Inno Setup script
│   ├── setup-db.js             # First-run DB seeding script
│   ├── setup-cloud.ps1         # Cloudflare tunnel setup helper
│   └── start.bat               # Windows batch launcher
│
├── docs/                       # Project documentation (you are here)
└── pos_data.sqlite             # SQLite database file
```

---

## Adding a New API Route

1. **Create the route file** in `backend_rewrite/routes/your-feature.js`:
   ```js
   const express = require('express');
   const router = express.Router();
   const { YourModel } = require('../models');

   router.get('/', async (req, res) => {
     const items = await YourModel.findAll();
     res.json(items);
   });

   module.exports = router;
   ```

2. **Register the route** in `backend_rewrite/server.js`:
   ```js
   const yourFeatureRoutes = require('./routes/your-feature');
   app.use('/api/your-feature', sessionAuth, yourFeatureRoutes);
   ```

3. **Add the Sequelize model** in `backend_rewrite/models/YourModel.js` and register it in `models/index.js`.

4. **Add the frontend API client** in `frontend/src/api/your-feature.js`:
   ```js
   import apiClient from './apiClient';
   export const yourFeatureApi = {
     getAll: () => apiClient.get('/your-feature'),
     create: (data) => apiClient.post('/your-feature', data),
   };
   ```

---

## Adding a New Frontend Page

1. **Create the page** in `frontend/src/pages/dashboard/YourPage.jsx` + `YourPage.module.css`
2. **Register the route** in `frontend/src/App.jsx` under the appropriate layout:
   ```jsx
   <Route path="your-page" element={<YourPage />} />
   ```
3. **Add a Sidebar link** in `frontend/src/components/dashboard/Sidebar.jsx`

---

## Theming & Design Tokens

All CSS custom properties are defined in `frontend/src/index.css`:
- `--accent` — currently selected accent color
- `--bg`, `--surface`, `--border` — background and surface colors (light/dark aware)
- `--text`, `--text-muted` — typography colors
- `--radius`, `--radius-sm`, `--radius-lg` — border radius scale
- `--transition` — default transition timing

Dark mode is toggled by adding `data-theme="dark"` to the `<html>` element.
Accent color changes by updating the `--accent` custom property on `:root`.

---

## Building for Production

```bash
# Build frontend
cd frontend
npm run build
# Output: frontend/dist/

# Start server (serves the built frontend + API)
cd ../backend_rewrite
node server.js
```

The backend's catch-all route serves `frontend/dist/index.html` for all non-API routes, enabling React Router client-side navigation.

---

## Common Development Tasks

| Task | Command |
|------|---------|
| Reset master password | `cd backend_rewrite && node emergency-reset.js` |
| Clear the database | Dashboard → Settings → Danger Zone → Factory Reset |
| Export database backup | Dashboard → Settings → Data Management → Export |
| View stock movement logs | Dashboard → Inventory → Stock Logs tab |
| Check cloudflare status | Dashboard → Top bar → Cloud button |
