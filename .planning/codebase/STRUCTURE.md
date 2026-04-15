# Directory Structure

The project is divided into two main parts: the React frontend and the Express backend.

## Root Directory
- `frontend/`: React application source and build configuration.
- `backend_rewrite/`: Node.js/Express server and database logic.
- `docs/`: Historical documentation and design specs.
- `installer/`: Scripts and assets for creating the application installer.
- `SRS.md`: Software Requirements Specification.
- `pos_data.sqlite`: The active production database file.

## Frontend (`frontend/`)
- `src/components/`: Reusable UI elements (Buttons, Modals, Cards).
- `src/pages/`: Main application views (POS, Dashboard, Reports, Inventory).
- `src/layouts/`: Shared page wrappers (e.g., AuthLayout, DashboardLayout).
- `src/context/`: React Context providers for global state.
- `src/api/`: Axios client and API service modules.
- `public/`: Static assets (logos, manifest).

## Backend (`backend_rewrite/`)
- `routes/`: Express route definitions for each entity (Orders, Products, etc.).
- `models/`: Sequelize model definitions.
- `middleware/`: Custom Express middleware (Authentication, Error handling).
- `utils/`: Helper utilities (Cloudflare Tunnel manager, file helpers).
- `public/uploads/`: Storage location for uploaded product images.
- `config/`: Configuration files for database and environment.
- `server.js`: Main entry point and process orchestrator.

## Key Locations
- **API Base URL**: Configured in `frontend/src/api/apiClient.js`.
- **Database Schema**: Defined in `backend_rewrite/models/index.js` and individual models.
- **Static Assets**: Product images are uploaded to and served from `backend_rewrite/public/uploads/`.
