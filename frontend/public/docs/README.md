<!-- GSD:docs-update -->
# PulsePoint — Better With Coffee ☕

A production-grade, modular Point of Sale (POS) system designed specifically for specialty café operations. PulsePoint focuses on speed, tactile feedback, and premium aesthetics to streamline daily café flows.

---

## ✨ Core Features

### 1. The Cashier's Instrument (POS Interface)
*   **Touch-First Design**: Optimized for tablet and mobile devices with high-tap targets and smooth animations.
*   **Dynamic Menu**: Fluid category-based product grid with "Fly-to-Cart" visual feedback.
*   **Advanced Modifier System**: Comprehensive customization options for sugar levels (0-100%), milk alternatives, and add-ons with real-time price calculation.
*   **Checkout**: Support for multiple payment methods (Cash, Card, GCash) with cash tendering and change calculation.

### 2. The Manager's Cockpit (Admin Dashboard)
*   **Live KPI Insights**: Real-time sales tracking including today's revenue, order counts, and top-selling items.
*   **Advanced Analytics**: Dedicated reports for Sales trends, Best Sellers, and Cashier Performance with full CSV export capabilities.
*   **Menu & Inventory Management**:
    *   **Menu**: Full CRUD for products and categories with image uploads and availability toggles.
    *   **Inventory**: Stock level tracking with low-stock thresholds, recipe-based deduction on sales, and categorized inventory logs.
*   **Staff Management**: Comprehensive user roles (Master, Admin, Cashier) with active/inactive status toggles and secure account management.

### 3. Integrated Attendance & Performance
*   **Live DTR Logic**: A built-in Daily Time Record system featuring:
    *   **Visual Status Indicators**: Real-time feedback in the TopBar (Glowing 🔴 Red: Not Clocked In | Spinning 🔵 Blue: Working | Glowing 🟢 Green: Shift Completed).
    *   **Personal DTR Calendar**: Monthly logs with Clock-in/out times, Day Off markers, and performance stats.
    *   **DTR Exports**: Staff can export their own attendance logs to CSV for payroll accuracy.

### 4. System & Cloud Intelligence
*   **Cloud Access**: Native integration with **Cloudflare Tunnels**, allowing you to access your POS from anywhere in the world with a secure link.
*   **Smart Activity Logs**: A centralized notification system that logs every sale, menu change, and administrative action for full transparency.
*   **Theming & Personalization**: Five premium accent presets (Caramel, Sage, Dusty Rose, Slate Blue, Amber), a high-contrast Dark Mode, and a toggleable ambient background effect.

---

## 🛠 Prerequisites

Before installing PulsePoint, please ensure the following tools are set up on your machine to avoid any installation issues:

1.  **Node.js (v18.x or higher)**: The core engine for the backend and frontend. [Download here](https://nodejs.org/).
2.  **Cloudflare Tunnel (`cloudflared`)**: Required for the **Cloud Access** feature. [Installation Guide](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/get-started/setup/).
    *   *Tip: On Windows, you can install it quickly via Terminal as Administrator:* `winget install cloudflare.cloudflared`

---

## 📦 Getting Started

### Method A: One-Click Installer (Windows)
If you have the installation package, simply run `PulsePoint-Setup.exe`. The installer will automatically:
*   Configure the database.
*   Set up terminal dependencies.
*   Create a Desktop shortcut for immediate use.

### Method B: Manual Development Setup
1.  Clone the repository.
2.  **Environment Configuration**:
    Manage secret keys and local settings by setting up environment files:

    *   **Backend**: Copy `backend_rewrite/.env.example` to `backend_rewrite/.env`.
    *   **Frontend**: Copy `frontend/.env.example` to `frontend/.env`.

    *Check these files to adjust your `PORT`, `FINANCIAL_BACKDOOR_KEY`, and `VITE_API_URL` values.*

3.  Install dependencies for both folders:
    ```bash
    cd backend_rewrite && npm install
    cd ../frontend && npm install
    ```
4.  Build the frontend:
    ```bash
    cd frontend && npm run build
    ```
5.  Start the system:
    ```bash
    cd backend_rewrite && node server.js
    ```

---

## 🛡 Security & Backup
PulsePoint uses a local-first **SQLite** database for lightning-fast operations and zero-latency in-store. The Settings page includes a full **Export/Import** backup system for the raw SQLite database file, and a **Factory Reset** option (Master password required). For extra safety, periodically copy the `pos_data.sqlite` file in the root directory to a secure location.

---

### Developed by **Better With Coffee**
*Fueling productivity, one cup at a time.*
