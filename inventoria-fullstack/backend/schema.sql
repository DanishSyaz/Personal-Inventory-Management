-- ============================================
-- Inventoria Database Schema (SQL)
-- For PostgreSQL or MySQL
-- Alternative to MongoDB
-- ============================================

-- Enable UUID extension (PostgreSQL only)
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- Table: users
-- ============================================
CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_username (username),
    INDEX idx_email (email)
);

-- ============================================
-- Table: user_roles
-- ============================================
CREATE TABLE user_roles (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    role VARCHAR(50) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id)
);

-- ============================================
-- Table: inventory_items
-- ============================================
CREATE TABLE inventory_items (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    item_key VARCHAR(255) NOT NULL,
    balance INT NOT NULL DEFAULT 0,
    min_stock INT NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    image_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_item_key (item_key),
    INDEX idx_balance (balance),
    UNIQUE KEY unique_item_per_user (user_id, item_key)
);

-- ============================================
-- Table: trend_data
-- ============================================
CREATE TABLE trend_data (
    id VARCHAR(36) PRIMARY KEY,
    item_id VARCHAR(36) NOT NULL,
    year INT NOT NULL,
    month INT NOT NULL,
    value INT NOT NULL,
    FOREIGN KEY (item_id) REFERENCES inventory_items(id) ON DELETE CASCADE,
    INDEX idx_item_id (item_id),
    INDEX idx_year_month (year, month),
    UNIQUE KEY unique_item_year_month (item_id, year, month)
);

-- ============================================
-- Sample Data
-- ============================================

-- Insert sample user (password is 'password123' hashed with BCrypt)
INSERT INTO users (id, username, email, password, enabled) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'demo_user', 'demo@inventoria.com', 
 '$2a$10$slYQmyNdGzTn7ZLBXBChFOC9f6kFjAqPhccnP6DxlWXx2lPk1C3G6', TRUE);

-- Insert user role
INSERT INTO user_roles (id, user_id, role) VALUES
('660e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440000', 'USER');

-- Insert sample inventory items
INSERT INTO inventory_items (id, name, item_key, balance, min_stock, user_id) VALUES
('770e8400-e29b-41d4-a716-446655440001', 'Milk', 'milk', 5, 20, '550e8400-e29b-41d4-a716-446655440000'),
('770e8400-e29b-41d4-a716-446655440002', 'Cordial', 'cordial', 40, 30, '550e8400-e29b-41d4-a716-446655440000'),
('770e8400-e29b-41d4-a716-446655440003', 'Coffee Bean', 'coffeebean', 60, 5, '550e8400-e29b-41d4-a716-446655440000');

-- Insert sample trend data for Milk (2024)
INSERT INTO trend_data (id, item_id, year, month, value) VALUES
('880e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440001', 2024, 1, 42),
('880e8400-e29b-41d4-a716-446655440002', '770e8400-e29b-41d4-a716-446655440001', 2024, 2, 38),
('880e8400-e29b-41d4-a716-446655440003', '770e8400-e29b-41d4-a716-446655440001', 2024, 3, 45),
('880e8400-e29b-41d4-a716-446655440004', '770e8400-e29b-41d4-a716-446655440001', 2024, 4, 49),
('880e8400-e29b-41d4-a716-446655440005', '770e8400-e29b-41d4-a716-446655440001', 2024, 5, 43),
('880e8400-e29b-41d4-a716-446655440006', '770e8400-e29b-41d4-a716-446655440001', 2024, 6, 47);

-- ============================================
-- Queries for Common Operations
-- ============================================

-- Get all items for a user
-- SELECT * FROM inventory_items WHERE user_id = ?;

-- Get low stock items for a user
-- SELECT * FROM inventory_items WHERE user_id = ? AND balance <= min_stock;

-- Search items by name
-- SELECT * FROM inventory_items WHERE user_id = ? AND name LIKE CONCAT('%', ?, '%');

-- Get trend data for an item
-- SELECT year, month, value FROM trend_data WHERE item_id = ? ORDER BY year, month;

-- Update item balance
-- UPDATE inventory_items SET balance = balance + ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?;