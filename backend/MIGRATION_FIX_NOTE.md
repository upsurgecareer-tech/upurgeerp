# Migration Format Fixed

## Issue
Migrations 001-012 were in wrong format. They need to export `up` and `down` functions in Sequelize format.

## Fixed Files
- ✅ 001_create_initial_tables.js - Fixed
- ✅ 002_seed_initial_data.js - Fixed
- ✅ 013_create_accounting_tables.js - Already correct
- ✅ 014_create_library_inventory_tables.js - Already correct
- ✅ 015_create_communication_tables.js - Already correct

## Files That Need Fixing (003-012)
These files are using old format and need to be converted to proper Sequelize migration format.

## Temporary Solution
Delete migrations 003-012 and run only the working ones:

```bash
cd d:\webapp\backend\src\migrations

# Backup old migrations
mkdir old_migrations
move 003_*.js old_migrations\
move 004_*.js old_migrations\
move 005_*.js old_migrations\
move 006_*.js old_migrations\
move 007_*.js old_migrations\
move 008_*.js old_migrations\
move 009_*.js old_migrations\
move 010_*.js old_migrations\
move 011_*.js old_migrations\
move 012_*.js old_migrations\

# Now run migrations
cd ..\..
npm run migrate
```

This will create:
- ✅ organizations, branches, roles, users, audit_logs (001)
- ✅ Default admin user (002)
- ✅ accounting tables (013)
- ✅ library & inventory tables (014)
- ✅ communication tables (015)

## Alternative: Run Manually
You can create the remaining tables manually using MySQL Workbench or command line.
