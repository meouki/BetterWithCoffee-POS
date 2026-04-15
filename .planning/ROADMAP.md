# Roadmap — PulsePoint POS

## Milestone 1: Quality & Stability
**Goal**: Establish a baseline of automated verification and improve the primary user interface.

### Phase 1: Automated Testing Foundation
- **Goal**: Standardize on Vitest and cover the most business-critical transaction logic.
- **Requirements**: REQ-1.1, REQ-1.2, REQ-1.3, REQ-1.4
- **Success Criteria**:
    - `npm run test` exists in both frontend and backend.
    - Sales logic tests pass and cover multiple edge cases (modifiers, stock limits).
- **Status**: Not Started

### Phase 2: POS Interface Overhaul
- **Goal**: Redesign the POS UI for better ergonomics and aesthetic appeal.
- **Requirements**: REQ-2.1, REQ-2.2, REQ-2.3
- **Success Criteria**:
    - New layout implemented in `POSInterface.jsx`.
    - Improved touch-responsiveness and visual consistency.
- **Status**: Not Started

### Phase 3: Schema Migrations & Reporting Fix
- **Goal**: Replace `sequelize.sync()` with a safe, production-grade Sequelize Migrations system, and fix 0-value reporting bugs.
- **Requirements**: REQ-3.1, REQ-3.2
- **Success Criteria**:
    - `sequelize.sync()` is replaced with `sequelize-cli` migration system.
    - `npm run migrate` applies schema changes without data loss.
    - KPI cards in Dashboard show accurate, non-zero data for historical periods.
- **Status**: Not Started

---
## Milestone 2: Production Readiness
- **Goal**: Security, migrations, and final installer polish.
- **Status**: Future
