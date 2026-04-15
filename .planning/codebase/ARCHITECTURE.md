# Architecture Overview

PulsePoint follows a decoupled Client-Server architecture with a clean separation between the user interface and the business logic.

## System Components

### 1. Frontend (React)
- **State Management**: Uses the React Context API for global state (Auth, Cart, Inventory) to avoid prop drilling.
- **Routing**: Client-side routing managed by React Router.
- **API Layer**: Centralized `apiClient.js` using Axios for all HTTP requests to the backend.

### 2. Backend (Express)
- **Process Management**: A primary process manages worker processes. This handles automatic restarts and graceful shutdowns.
- **Routing**: Modular route handlers in `backend_rewrite/routes/` map HTTP endpoints to controller logic.
- **Security**: JWT-based or Session-based authentication implemented as middleware.
- **Data Persistence**: Sequelize ORM interacts with a local SQLite database file.

### 3. Data Flow
1. **Request**: Frontend UI triggers an action (e.g., placing an order) via an API call.
2. **Middleware**: Backend receives request, validates authentication, and parses the body.
3. **Logic**: The route handler processes the business logic (e.g., checking stock, calculating totals).
4. **Persistence**: The handler uses Sequelize models to update the SQLite database.
5. **Response**: Backend returns a JSON response; Frontend updates the local state and UI accordingly.

## Key Abstractions
- **Context Providers**: `src/context/` wraps the application to provide reactive data.
- **Sequelize Models**: Defined in `backend_rewrite/models/`, providing a structured schema for the SQLite database.
- **Custom Middleware**: `backend_rewrite/middleware/auth.js` secures sensitive API endpoints.
