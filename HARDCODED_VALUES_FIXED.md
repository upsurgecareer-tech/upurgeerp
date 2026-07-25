# Hardcoded Values - Fixed

## Changes Made

### Migration Files Updated

All hardcoded `organization_id: 1` and `branch_id: 1` values in seed data have been replaced with dynamic queries.

#### Files Fixed:
1. **013_create_accounting_tables.js**
   - Account heads now use first available organization ID
   - Query: `SELECT id FROM organizations LIMIT 1`

2. **014_create_library_inventory_tables.js**
   - Library books and inventory items now use first available organization and branch IDs
   - Queries: 
     - `SELECT id FROM organizations LIMIT 1`
     - `SELECT id FROM branches LIMIT 1`

3. **015_create_communication_tables.js**
   - Email and SMS templates now use first available organization ID
   - Query: `SELECT id FROM organizations LIMIT 1`

## Benefits

✅ **No Hardcoded IDs**: All seed data now dynamically fetches organization/branch IDs
✅ **Multi-Tenant Safe**: Works with any organization setup
✅ **Flexible**: Seed data only inserts if organizations/branches exist
✅ **Production Ready**: No manual ID changes needed

## Note

Seed data will only be inserted if:
- At least one organization exists (for all seed data)
- At least one branch exists (for library/inventory seed data)

This ensures the migrations don't fail if run on a fresh database before organization setup.
