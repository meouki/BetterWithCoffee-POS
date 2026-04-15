# Project: PulsePoint POS

PulsePoint is an alpha-stage Point of Sale (POS) system designed for retail and hospitality, featuring local persistence, high availability through process management, and remote access via Cloudflare Tunnels.

## Core Value
To provide a robust, resilient, and easy-to-use POS system that can run locally on low-cost hardware while offering cloud-like accessibility and data safety.

## Context
The project is currently in **Alpha**. The core functionality (Orders, Products, Inventory) is implemented but lacks automated verification and a formal data migration strategy. The UI is functional but requires aesthetic and usability improvements.

## Requirements

### Validated
- ✓ **Backend Core**: Express server with Sequelize ORM and SQLite. — existing
- ✓ **Frontend Core**: React 19 / Vite 7 application with Tailwind CSS. — existing
- ✓ **Order Management**: End-to-end flow for creating and viewing orders. — existing
- ✓ **Inventory Engine**: Automatic stock deduction based on recipes. — existing
- ✓ **Remote Access**: Cloudflare Tunnel integration for internet access. — existing
- ✓ **Resiliency**: Process manager (cluster module) for automatic restarts. — existing

### Active
- [ ] **Automated Testing**: Implement Vitest suite for transaction and sales logic verification.
- [ ] **POS UI Overhaul**: redesign the `POSInterface.jsx` for improved ergonomics and visual appeal.
- [ ] **Schema Management**: Implement a migration-based database management system to replace `sequelize.sync()`.
- [ ] **Report Accuracy**: Fix issues causing 0 or N/A values in sales and performance reports.

### Out of Scope
- **Multi-tenant Cloud**: Currently strictly local-first with optional tunnel access.
- **Hardware Drivers**: Native receipt printer drivers (uses standard print dialog/PDF for now).

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| **Standardize on Vitest** | Fast, unified test runner for both Frontend and Backend environments. | — Pending |
| **Sequelize ORM** | Balance between ease of use and abstraction for SQLite. | — Existing |
| **Local-First Architecture** | Ensure operation without internet; use Tunnels for optional remote view. | — Existing |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition**:
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone**:
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-04-15 after initialization*
