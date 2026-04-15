# Requirements — PulsePoint POS

## Milestone 1: Quality & Stability (Current)
*Focus: Strengthening the alpha foundation with automated testing and UI refinement.*

### Automated Testing (VITEST)
- [ ] **REQ-1.1**: Setup Vitest environment for Backend (Node.js).
- [ ] **REQ-1.2**: Setup Vitest environment for Frontend (React).
- [ ] **REQ-1.3**: Implement unit tests for transaction logic (order total calculation, modifier prices).
- [ ] **REQ-1.4**: Implement unit tests for sales logic (inventory deduction, stock level validation).

### POS UI Overhaul
- [ ] **REQ-2.1**: Audit current `POSInterface.jsx` for usability bottlenecks.
- [ ] **REQ-2.2**: Implement a more ergonomic product grid and sidebar layout.
- [ ] **REQ-2.3**: Improve visual feedback for cart additions and modifier selection.

### Technical Debt & Reliability
- [ ] **REQ-3.1**: Debug and fix "0 values" issue in Dashboard Reports.
- [ ] **REQ-3.2**: Investigate and plan data migration system implementation.

---

## Milestone 2: Production Readiness
*Focus: Security, migrations, and deployment.*

- [ ] **REQ-4.1**: Implement Sequelize Migrations for schema management.
- [ ] **REQ-4.2**: Security audit for IDOR and session management.
- [ ] **REQ-4.3**: Production build optimization and installer testing.
