# Phase 1: Automated Testing Foundation - Research

## Testing Ecosystem (2026)

### Vitest + React 19 (Frontend)
- **Standard Stack**: `vitest`, `@testing-library/react`, `jsdom`, and `@testing-library/jest-dom`.
- **Vite 7 Integration**: Vitest utilizes existing Vite plugins (`@vitejs/plugin-react`) automatically. 
- **Setup**: Requires a `setup.ts` to extend `jest-dom` matchers.
- **Environment**: Must set `environment: 'jsdom'` in `vite.config.js`.

### Vitest + Express (Backend)
- **Architecture**: Decouple the Express `app` instance from the `listen` call. Export `app` from `backend_rewrite/app.js` and import into `server.js` AND tests.
- **Integration**: Use `supertest` for hitting endpoints without a live port.
- **State Isolation**: Use `vi.clearAllMocks()` in `beforeEach`.
- **Database**: Since we use SQLite, we can use an in-memory database (`:memory:`) or a temporary test file (`test_pos_data.sqlite`) to isolate test side-effects from production data.

## Implementation Guide

### Phase 1.1: Backend Setup
1. Refactor `backend_rewrite/server.js` to separate the app configuration.
2. Install `vitest` and `supertest` in `backend_rewrite/`.
3. Configure `vitest.config.js` for the backend.

### Phase 1.2: Frontend Setup
1. Install `vitest`, `jsdom`, and `@testing-library/react` in `frontend/`.
2. Update `frontend/vite.config.js` with `test` configuration.
3. Create `frontend/src/test/setup.js`.

### Phase 1.3: Transaction Logic
- Target: `backend_rewrite/routes/orders.js`.
- Mock: `Sequelize` models or use a separate test SQLite instance.
- Verify: Pricing calculations (price * qty), modifier additions.

### Phase 1.4: Sales & Inventory
- Target: `backend_rewrite/routes/inventory.js` and model hooks.
- Logic: Deducting stock on sale.
- Verification: Assert `Inventory` balance decreases AND `StockLog` entry is created with reason 'sale'.

## Pitfalls to Avoid
- **Port Conflicts**: Ensure `supertest` doesn't actually bind to 5000 if a server is running.
- **Test Pollution**: SQLite file persistence means tests might leave records behind. Always use a clean database state per test suite.
- **ESM/CJS**: The backend is CommonJS. Vitest handles CJS but we must ensure `require` works smoothly in the test environment.
