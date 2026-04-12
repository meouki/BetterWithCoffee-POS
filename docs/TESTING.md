<!-- GSD:docs-update -->
# Testing Guide — PulsePoint POS

PulsePoint does not yet have an automated test suite. This document describes the current manual testing approach and recommendations for adding automated tests in the future.

---

## Current Testing Approach

All feature verification is done **manually** via the browser UI and direct API calls.

### Backend — Manual API Testing

You can use any REST client (curl, Postman, Bruno, Thunder Client) to test the API endpoints directly.

**Get a session token (login):**
```bash
curl -X POST http://localhost:5000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"username": "master", "password": "master123"}'
```

Response:
```json
{
  "user": { "id": 1, "username": "master", "role": "Master" },
  "session_id": "<UUID>"
}
```

**Use the session for authenticated requests:**
```bash
curl http://localhost:5000/api/products \
  -H "x-user-id: 1" \
  -H "x-session-id: <UUID>"
```

---

## Key Flows to Test Manually

### 1. POS Order Flow
1. Log in as Cashier → navigate to `/pos`
2. Select an order type (Dine In / Take Out)
3. Add a product to cart — verify modifier sheet appears for products with modifiers
4. Adjust quantity, size, sugar level, milk type, addons
5. Proceed to Checkout → select payment method
6. Complete the order — verify it appears in Dashboard → Orders

### 2. Inventory Deduction
1. Ensure a product has a Recipe configured (Dashboard → Menu → Edit Product → Recipe Builder)
2. Create an order with that product
3. Go to Dashboard → Inventory
4. Verify the ingredient's stock has decreased by the recipe-specified quantity
5. Check Dashboard → Inventory → Stock Logs for the `sale` reason entry

### 3. User Session Invalidation
1. Log in as a test user on Browser A
2. Log in as the same user on Browser B
3. Try to make an API call from Browser A → should receive `401 Unauthorized`
4. Browser A should redirect to `/login`

### 4. Root Master Protection
1. Log in as Master
2. Go to Dashboard → User Management
3. Try to edit User #1 (master) — role and status toggles should be greyed out
4. Verify no API call can change the role or status of `id=1`

### 5. Database Import/Export
1. Dashboard → Settings → Data Management → Export → verify SQLite file downloads
2. Import a previously exported file → verify Master password prompt → verify warning step
3. After import: server restarts automatically → redirected to `/login` after ~4 seconds
4. Verify data was restored correctly

### 6. Factory Reset (Danger Zone)
1. Dashboard → Settings → Danger Zone → Factory Reset
2. Complete 3-step confirmation flow including Master password
3. Verify all data is wiped and only seed data remains (master account + default categories)

---

## Recommended Test Setup (Future)

When automated testing is added, the recommended stack is:

### Backend — Unit & Integration Tests
```bash
npm install --save-dev jest supertest
```

- **Unit tests:** Test individual model methods (e.g., `User.validatePassword`)
- **Integration tests:** Use `supertest` to hit Express routes with an in-memory or temporary SQLite DB

Example test structure:
```
backend_rewrite/
└── tests/
    ├── auth.test.js
    ├── orders.test.js
    ├── inventory.test.js
    └── system.test.js
```

### Frontend — Component & E2E Tests
```bash
# Component tests
npm install --save-dev @testing-library/react @testing-library/user-event vitest

# E2E tests
npm install --save-dev playwright
```

- **Component tests:** Test individual React components in isolation (modals, drawers, forms)
- **E2E tests:** Full browser flows using Playwright (order creation, login, settings)

---

## Smoke Test Checklist

Run through this checklist after any major change to verify nothing is broken:

- [ ] Server starts without errors on `node server.js`
- [ ] `http://localhost:5000` opens the landing page
- [ ] Login with master/master123 succeeds
- [ ] Dashboard overview loads with KPI cards
- [ ] POS page loads with product grid
- [ ] Creating an order completes without error
- [ ] Dashboard → Orders shows the new order
- [ ] Dashboard → Inventory stock levels update after sale (if recipe configured)
- [ ] Settings → Export downloads a `.sqlite` file
- [ ] Cloudflare tunnel toggle works (if `cloudflared` installed)
