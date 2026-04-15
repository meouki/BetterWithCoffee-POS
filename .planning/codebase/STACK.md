# Technology Stack

PulsePoint is a modern Point of Sale (POS) system built with a React frontend and a Node.js/Express backend, using SQLite for data persistence.

## Frontend
- **Core**: [React 19](https://react.dev/)
- **Build Tool**: [Vite 7](https://vitejs.dev/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/) with PostCSS
- **Routing**: [React Router 7](https://reactrouter.com/)
- **State Management**: React Context API
- **Icons**: [Lucide React](https://lucide.dev/)
- **Charts**: [Recharts](https://recharts.org/)
- **Notifications**: [React Hot Toast](https://reacthottoast.com/)

## Backend
- **Runtime**: [Node.js](https://nodejs.org/)
- **Framework**: [Express 4](https://expressjs.com/)
- **Database**: [SQLite](https://www.sqlite.org/) via `sqlite3`
- **ORM**: [Sequelize 6](https://sequelize.org/)
- **Image Processing**: [Sharp](https://sharp.pixelplumbing.com/)
- **File Uploads**: [Multer](https://github.com/expressjs/multer)
- **Security**: [Bcryptjs](https://github.com/dcodeIO/bcrypt.js) for password hashing

## Infrastructure
- **Process Management**: Node.js `cluster` module for automatic restarts.
- **Networking**: Cloudflare Tunnel integration for remote access.
- **Installer**: Custom installer logic (located in `installer/`).
