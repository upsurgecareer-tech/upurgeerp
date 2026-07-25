-- UpsurgeERP Database Setup Script
-- Run this script with: mysql -u root -proot < setup_database.sql

-- Create database
DROP DATABASE IF EXISTS upsurgeerp;
CREATE DATABASE upsurgeerp CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Use database
USE upsurgeerp;

-- Show success message
SELECT 'Database upsurgeerp created successfully!' AS Status;
SELECT DATABASE() AS 'Current Database';
