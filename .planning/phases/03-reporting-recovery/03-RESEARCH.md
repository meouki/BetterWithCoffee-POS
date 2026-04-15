# Phase 3: Schema Migrations & Reporting Fix - Research

## Root Cause Analysis: Reporting Bug

### The Bug
`fetchAnalytics` in `OrderContext.jsx` calls `ordersApi.getRaw(startDate, endDate)`, which hits:
```
GET /api/orders?from=<ISO>&to=<ISO>&limit=1000
```

`getRaw` passes `limit=1000` but **does NOT pass `page`**. Looking at `routes/orders.js`:
```js
const page = parseInt(req.query.page) || 1;   // defaults to 1 — OK
const limit = parseInt(req.query.limit) || 50; // will be 1000
```

The date filter uses `Op.gte` and `Op.lte` on the `timestamp` column. This should work.

**Most likely cause**: The `getRaw` call on the frontend doesn't include auth headers (`x-user-id`, `x-session-id`), because it goes through `apiClient`. Since `sessionAuth` is applied to `/api/orders`, unauthenticated requests get **401**. The `getRaw` function catches all errors and returns `[]`.

```js
// orders.js frontend:
getRaw: async (startDate, endDate) => {
    try {
        const response = await apiClient.get(...);  // Does apiClient include auth headers?
        const data = await response.json();
        return data.orders || [];
    } catch (error) {
        return [];   // <-- silently returns empty on 401!
    }
}
```

**Fix**: Verify that `apiClient` correctly injects auth headers. If it does, verify the backend query returns records with the correct date range. Add a `console.warn` to expose 4xx failures transparently.

## Sequelize Migrations Research

### Why `sequelize.sync()` is Dangerous in Production
- `sync()` with no options: works on fresh DB, but has no effect if schema already exists (won't add new columns).
- `sync({ force: true })`: drops and recreates — destroys all data.
- `sync({ alter: true })`: attempts to diff and alter, but is buggy and cannot handle all edge cases (e.g., renaming columns, adding non-nullable columns with no defaults).

### Recommended Approach: `sequelize-cli` + `umzug`

**sequelize-cli** generates time-stamped migration files. Each file has an `up()` and `down()` function.

**umzug** is the underlying migration runner Sequelize CLI uses. It tracks which migrations have run in a `SequelizeMeta` table and can be called programmatically:

```js
const { Umzug, SequelizeStorage } = require('umzug');
const umzug = new Umzug({
  migrations: { glob: 'migrations/*.js' },
  context: sequelize.getQueryInterface(),
  storage: new SequelizeStorage({ sequelize }),
  logger: console,
});
await umzug.up(); // Run all pending migrations on startup
```

### Migration Strategy for Existing DB

Since there's already live data, we write an "initial" migration that creates tables only if they don't exist (`CREATE TABLE IF NOT EXISTS`). Future schema changes get their own migration files.

### Migration File Example
```js
// migrations/20240101000000-init-schema.js
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('users', { ... }, { ifNotExists: true });
    // ... all tables
  },
  async down(queryInterface) {
    await queryInterface.dropTable('users');
    // ... reverse order
  }
};
```

### Startup Integration
Replace in `server.js`:
```js
// Before:
sequelize.sync().then(...)

// After:
const { Umzug, SequelizeStorage } = require('umzug');
const umzug = new Umzug({...});
umzug.up().then(async () => {
  await seedDatabase();
  app.listen(PORT, ...);
});
```
