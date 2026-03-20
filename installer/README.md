# PulsePoint Installer Scripts

This directory contains the groundwork scripts that the main `.exe` installer will use.

- **`setup-db.js`**: A Node.js script that connects to MySQL, creates the `pos_db` database if it doesn't exist, automatically synchronizes all Sequelize models to build the tables, and seeds the master user and default categories.
- **`start.bat`**: A Windows batch file that provides a one-click launch experience. It boots the Express server in the background and automatically opens the user's default browser to `http://localhost:5000`.

When the final Inno Setup `.exe` is built, it will bundle these files and call them automatically during or immediately after installation.
