# Technical Concerns

This document tracks known issues, technical debt, and potential risks within the PulsePoint codebase.

## Technical Debt
- **Testing Coverage**: Zero automated tests. Features must be manually verified, which is error-prone and slows down development.
- **Database Schema Management**: Uses `sequelize.sync()` instead of a formal migration system (like Sequelize-CLI). This makes schema updates risky in production.
- **Backend Architecture**: The backend uses CommonJS (`require`), while the frontend uses ES Modules. This discrepancy can cause confusion when sharing logic or types.
- **Reporting Engine**: The current reporting logic in `routes/system.js` or `reports.js` (if applicable) has been reported to return 0 or N/A values in some cases, suggesting issues with date filtering or aggregation.

## Security
- **Authentication**: Uses a simple custom session-id header logic. While it works, it may not be as robust as standard JWT or session-store implementations.
- **File Permissions**: Image uploads to `C:\Program Files\PulsePoint` on Windows have faced permission errors during installation.
- **Admin Security**: The "Master" user is protected from role changes via UI-level and some backend checks, but a comprehensive audit for Insecure Direct Object Reference (IDOR) is needed.

## Performance
- **Large Lists**: The UI might experience lag when displaying hundreds of products or order history items without virtualization.
- **SQLite Concurrency**: As a file-based database, SQLite may face lock contention issues if multiple users are heavily writing to the database simultaneously (not a major concern for small retail/cafes, but a scaling limit).

## Fragility
- **Asset Serving**: `server.js` expects the frontend `dist/` directory to exist. If the build process fails or is skipped, the application will show a custom error page instead of the POS.
- **Environment Context**: The project heavily relies on specific relative paths (`../../pos_data.sqlite`), which may break if directory structures are shifted.
- **Cloudflare Dependency**: The `tunnelManager.js` depends on `cloudflared` being installed globally or at a specific path. If not found, remote access fails silently with only a console log.
