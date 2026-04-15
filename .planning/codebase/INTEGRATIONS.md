# External Integrations

PulsePoint connects to several external services and local system integrations to provide a full POS experience.

## Database
- **SQLite**: Local file-based database (`pos_data.sqlite`). Managed via Sequelize ORM in the backend.
- **Auto-Backup/Import**: The system supports importing database files, which triggers a backend worker restart via the `cluster` module.

## Networking & Cloud
- **Cloudflare Tunnel**: Integrated via `backend_rewrite/utils/tunnelManager.js`. Allows the POS to be accessible over the internet without port forwarding when `ENABLE_CLOUD=true` in `.env`.

## Hardware & System
- **Static Assets**: Serves product images from `backend_rewrite/public/uploads`.
- **Process Manager**: Uses Node.js `cluster` to manage worker processes, ensuring high availability and automatic recovery from crashes.

## API Architecture
- **Internal REST API**: The frontend communicates with the backend via a series of REST endpoints under `/api/*`.
- **Public Endpoints**: `/api/notifications` is partially public to allow for health and cloud connectivity checks.
