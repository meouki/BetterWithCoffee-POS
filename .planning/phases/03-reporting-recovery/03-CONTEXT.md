# Phase 3: Schema Migrations & Reporting Fix - Context

**Gathered:** 2026-04-16
**Status:** Ready for planning

<domain>
## Phase Boundary

This phase addresses the two most critical backend stability gaps in PulsePoint:

1. **Schema Migrations**: Replace `sequelize.sync()` with `sequelize-cli` migration files so schema changes can be applied safely in production without dropping data.
2. **Reporting Fix**: Debug and resolve why the Dashboard KPI cards (Sales, Revenue, Cashier performance) return 0 or N/A values.

**Out of scope**: Changing the database engine (SQLite stays), or modifying the import/export backup system (it still writes raw `.sqlite` files).
</domain>

<decisions>
## Implementation Decisions

### Migration Tool Choice
- **Use `sequelize-cli`** — the standard CLI for Sequelize migrations. Already familiar with Sequelize ORM, minimal new learning curve.
- **Migration files live in**: `backend_rewrite/migrations/` (one file per schema change, named by timestamp).
- **Sequelize config file**: `backend_rewrite/.sequelizerc` (tells the CLI where to find models, migrations, and db config).
- **Important**: The `/api/system/wipe` route uses `sequelize.sync({ force: true })`. This must remain intact for factory resets — it's intentional destructive behavior, not an accident.

### Migration Strategy for Existing Data
- **Existing live database is already deployed** — we cannot use `--force` migrations in production.
- **Approach**: Write migrations that describe the current schema AS-IS (initial state). These become the "baseline" that future migrations build on.
- **`sequelize.sync()` in `server.js`**: Replace with a call to run pending migrations programmatically at startup via `sequelize-cli`'s `Umzug` runner, OR keep `sync()` for now during dev and produce the migration files as the deliverable.
- **Decision**: Generate the migration files AND update the startup to run `umzug` for pending migrations on boot. This gives production-safety without manual CLI steps.

### Reporting Bugs
- Reports use the `Order` model with `sequelize.fn` aggregates — need to confirm the timestamp column/query format is correct.
- The bug is likely date-range filtering returning no rows (wrong column name, wrong format, or timezone offset mismatch).
- The fix must not break the existing `/api/orders` date filter on the Orders page which works correctly.
</decisions>

<canonical_refs>
## Canonical References
- `backend_rewrite/config/db.js` — Sequelize instance, must be updated to support migration runner.
- `backend_rewrite/server.js` — Startup sequence; `sequelize.sync()` lives here.
- `backend_rewrite/models/index.js` — All 11 models and associations.
- `backend_rewrite/routes/system.js` — Contains `sequelize.sync({ force: true })` for wipe (keep as-is).
- `backend_rewrite/models/Order.js` — Core model for reporting queries.
- `.planning/codebase/CONCERNS.md` — Documents the `sync()` risk.
</canonical_refs>

<specifics>
## Specific Implementation Notes

### Tables to Migrate (11 total)
From `models/index.js`:
`products`, `orders`, `order_items`, `inventory`, `notifications`, `users`, `attendance`, `categories`, `product_sizes`, `recipes`, `stock_logs`

### Sequelize CLI Setup
```bash
npm install -D sequelize-cli
npm install umzug
```

`.sequelizerc`:
```js
const path = require('path');
module.exports = {
  'config': path.resolve('config', 'database.json'),
  'models-path': path.resolve('models'),
  'seeders-path': path.resolve('seeders'),
  'migrations-path': path.resolve('migrations'),
};
```

### Startup Migration on Boot
Replace `sequelize.sync()` in `server.js` with:
```js
const { Umzug, SequelizeStorage } = require('umzug');
const umzug = new Umzug({
  migrations: { glob: 'migrations/*.js' },
  context: sequelize.getQueryInterface(),
  storage: new SequelizeStorage({ sequelize }),
  logger: console,
});
await umzug.up(); // Runs all pending migrations on boot
```
</specifics>

<deferred>
## Deferred Ideas
- Full seeds/fixtures system for populating demo data.
- Rollback (down) migration automation — down migrations are written but not auto-run.
</deferred>

---
*Phase: 03-schema-migrations-reporting-fix*
*Context gathered: via conversation 2026-04-16*
