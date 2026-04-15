# Phase 1: Automated Testing Foundation - Context

**Gathered:** 2026-04-15
**Status:** Ready for planning

<domain>
## Phase Boundary
This phase focuses on setting up the testing infrastructure for the PulsePoint POS and implementing unit tests for the core backend business logic.

- **Frontend**: Vitest setup for component isolation.
- **Backend**: Vitest setup for API and logic verification.
- **Critical Logic**: Transaction totals, modifier pricing, and inventory deduction.
</domain>

<decisions>
## Implementation Decisions

### Testing Strategy
- **Framework**: Standardize on **Vitest** for both the React frontend and Node.js backend to maintain a consistent developer experience and fast execution.
- **Priority**: Focus heavily on the **Backend** transactions/sales logic, as the frontend is primarily a data consumer/fetcher.

### Backend Logic
- **Business Rules**: Currently simple (Price * Qty); no complex discounting or tax management is implemented yet.
- **Inventory Verification**: Tests must verify both the `Inventory` stock updates AND the creation of corresponding entries in `stock_logs`.

### frontend/src/api
- Tests should verify that API calls are correctly structured, but full logic tests belong in the backend.

</decisions>

<canonical_refs>
## Canonical References
- `backend_rewrite/routes/orders.js` — Order creation logic.
- `backend_rewrite/routes/inventory.js` — Stock adjustment logic.
- `backend_rewrite/models/` — Data schema and hooks.
- `.planning/codebase/STACK.md` — Technology context.
</canonical_refs>

<specifics>
## Specific Ideas
- Use `supertest` or Vitest's local server capability to hit routes if unit testing models alone is insufficient.
- Mock the database or use a separate `test_pos_data.sqlite` for clean state isolation.
</specifics>

<deferred>
## Deferred Ideas
- Integration testing with the Cloudflare Tunnel.
- End-to-end (E2E) browser flows with Playwright.
</deferred>

---
*Phase: 01-automated-testing-foundation*
*Context gathered: via conversation*
