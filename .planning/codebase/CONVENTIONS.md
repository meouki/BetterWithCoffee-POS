# Coding Conventions

The PulsePoint codebase follows a set of informal but consistent conventions to maintain readability and modularity.

## General
- **Naming**: `camelCase` for variables and functions, `PascalCase` for React components and Sequelize models, `UPPER_SNAKE_CASE` for constants.
- **Indentation**: 4 spaces (or 2 spaces depending on the file, consistency within the file is key).
- **Quotes**: Double quotes for strings in JSX/HTML; single quotes for backend JS logic.

## Frontend (React)
- **Functional Components**: All new components should be functional components using React hooks (`useState`, `useEffect`, `useContext`).
- **Component Structure**:
    - `index.css`: Global styles.
    - `src/components/`: Reusable UI elements.
    - `src/pages/`: Full views connected to routes.
- **State Management**: Prefer `useContext` for global application state (Auth, Cart) rather than passing props through many layers.
- **API Calls**: Wrap all API calls in `try/catch` and use `react-hot-toast` to provide user feedback on error.

## Backend (Express)
- **Module System**: Uses CommonJS (`require`).
- **Route Handlers**: Keep route logic modular in `routes/[entity].js`. Avoid putting heavy business logic directly in `server.js`.
- **Database Logic**: Use Sequelize methods for queries (`User.findOne`, `Category.findAll`). Avoid raw SQL queries unless strictly necessary for performance.
- **Error Handling**: Use Express middleware for centralized error handling. Ensure every route handler has a `try/catch` block that returns an appropriate status code (400, 401, 403, 500).

## Database
- **Migrations**: Since it's a local SQLite project, `sequelize.sync()` is currently used for schema management.
- **Relationships**: Define model associations in `models/index.js` to ensure consistency.
