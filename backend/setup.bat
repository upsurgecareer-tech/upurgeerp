@echo off
echo ========================================
echo UpsurgeERP Database Setup
echo ========================================
echo.

echo Checking MySQL installation...
where mysql >nul 2>nul
if %errorlevel% neq 0 (
    echo.
    echo WARNING: MySQL command not found in PATH
    echo.
    echo Please choose an option:
    echo.
    echo Option 1: Add MySQL to PATH
    echo   - Find your MySQL installation folder
    echo   - Common locations:
    echo     C:\Program Files\MySQL\MySQL Server 8.0\bin
    echo     C:\xampp\mysql\bin
    echo     C:\wamp64\bin\mysql\mysql8.0.x\bin
    echo.
    echo Option 2: Use MySQL Workbench
    echo   1. Open MySQL Workbench
    echo   2. Connect to localhost
    echo   3. Run this query:
    echo      DROP DATABASE IF EXISTS upsurgeerp;
    echo      CREATE DATABASE upsurgeerp CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
    echo.
    echo Option 3: Use Command Prompt with full path
    echo   Example:
    echo   "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -proot ^< setup_database.sql
    echo.
    echo After creating database, run: npm install
    echo Then run: npm run migrate
    echo.
    pause
    exit /b 1
)

echo MySQL found! Proceeding with setup...
echo.

echo Step 1: Creating database...
mysql -u root -proot < setup_database.sql
if %errorlevel% neq 0 (
    echo ERROR: Failed to create database
    echo.
    echo Possible reasons:
    echo 1. MySQL service is not running
    echo 2. Username/password is incorrect
    echo 3. MySQL server is not accessible
    echo.
    echo To start MySQL service:
    echo   net start MySQL80
    echo.
    pause
    exit /b 1
)
echo Database created successfully!
echo.

echo Step 2: Installing dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)
echo Dependencies installed!
echo.

echo Step 3: Running migrations...
call npm run migrate
if %errorlevel% neq 0 (
    echo ERROR: Failed to run migrations
    pause
    exit /b 1
)
echo Migrations completed!
echo.

echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo You can now start the server with:
echo npm run dev
echo.
pause
