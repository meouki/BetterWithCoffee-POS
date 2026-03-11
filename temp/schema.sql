-- POS System Database Schema
-- Perfectly aligned with Frontend naming conventions

CREATE DATABASE IF NOT EXISTS pos_db;
USE pos_db;

-- 1. Products Table
CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    base_price FLOAT NOT NULL,
    is_available BOOLEAN DEFAULT TRUE,
    modifiers BOOLEAN DEFAULT FALSE,
    image_url VARCHAR(500) DEFAULT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. Orders Table
CREATE TABLE IF NOT EXISTS orders (
    id VARCHAR(50) PRIMARY KEY, -- Using ORD-XXXXXX format from frontend
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    subtotal FLOAT NOT NULL,
    vat FLOAT NOT NULL,
    total FLOAT NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    order_type VARCHAR(50) NOT NULL,
    cashier VARCHAR(100) NOT NULL,
    amount_tendered FLOAT DEFAULT NULL,
    `change` FLOAT DEFAULT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 3. Order Items Table
CREATE TABLE IF NOT EXISTS order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id VARCHAR(50) NOT NULL,
    product_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    quantity INT NOT NULL,
    price FLOAT NOT NULL, -- Snapshot price at time of order
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- 4. Inventory Table
CREATE TABLE IF NOT EXISTS inventory (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    stock FLOAT DEFAULT 0,
    unit VARCHAR(20) NOT NULL,
    threshold FLOAT DEFAULT 0,
    last_updated DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 5. Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    type VARCHAR(50) NOT NULL, -- 'SALE', 'MENU_EDIT', 'ALERT'
    message TEXT NOT NULL,
    details TEXT,
    cashier VARCHAR(100),
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Initial Data for Testing
INSERT INTO products (name, category, base_price, is_available, modifiers) VALUES 
('Caramel Macchiato', 'Hot Drinks', 180, 1, 1),
('Spanish Latte', 'Hot Drinks', 190, 1, 1),
('Matcha Frappe', 'Frappe Drinks', 220, 1, 1),
('Blueberry Cheesecake', 'Pastries', 250, 1, 0);
