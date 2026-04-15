# Phase 1: Automated Testing Foundation - Validation

## Dimension 1: Technical Fidelity
- [ ] Backend `vitest.config.js` exists and is correctly configured for CommonJS/Node.
- [ ] Frontend `vite.config.js` includes `test` block with `jsdom`.
- [ ] `supertest` is used correctly without port binding.

## Dimension 2: Dependency Accuracy
- [ ] `vitest`, `supertest`, and `jsdom` are in `devDependencies` of their respective `package.json` files.

## Dimension 3: Procedural Integrity
- [ ] All tests pass with `npm test`.
- [ ] Test suites are located in `tests/` directories or colocated with `.test.js` suffix.

## Dimension 4: Logic Verification (Transaction)
- [ ] Test covers multiple items in a single order.
- [ ] Test covers modifiers with additional costs.
- [ ] Test covers quantity multipliers.

## Dimension 5: State Continuity (Inventory)
- [ ] Inventory balance matches expected math after a simulated sale.
- [ ] `StockLog` table contains a new entry for the sale.
- [ ] Test database file is deleted or cleared after test run.
