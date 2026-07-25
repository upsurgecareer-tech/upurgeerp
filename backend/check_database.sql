-- Check what's in the database
USE upsurgeerp;

-- Show all tables
SHOW TABLES;

-- Check if data exists
SELECT * FROM organizations;
SELECT * FROM branches;
SELECT * FROM roles;
SELECT * FROM users;

-- If you see data, run this to clean:
-- DELETE FROM users;
-- DELETE FROM roles;
-- DELETE FROM branches;
-- DELETE FROM organizations;
