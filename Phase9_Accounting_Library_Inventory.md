# UpsurgeERP - Phase 9: Accounting, Library & Inventory

**Duration:** Months 13-14
**Status:** Accounting, Library & Inventory Phase

---

## Overview

Phase 9 delivers complete Accounting, Library Management, and Inventory Management modules for UpsurgeERP. It handles financial accounting, book management, and asset tracking.

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│            ACCOUNTING, LIBRARY & INVENTORY SYSTEM                        │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                          MODULE COMPONENTS                               │
├──────────────┬──────────────┬────────────────────────────────────────────┤
│  Accounting  │   Library    │  Inventory                                 │
│  Management  │  Management  │  Management                                │
└──────┬───────┴──────┬───────┴──────┬─────────────────────────────────────┘
       │              │              │
       └──────────────┴──────────────┘
                      │
                      ▼
      ┌───────────────────────────────────┐
      │   Unified Data Processing Layer   │
      │   - Transaction Management        │
      │   - Barcode/QR Integration        │
      │   - Report Generation             │
      └───────────────┬───────────────────┘
                      │
      ┌───────────────┼───────────────┐
      │               │               │
      ▼               ▼               ▼
┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│ MySQL 8.0+  │ │  VPS Local  │ │   Redis     │
│  Database   │ │  (Files)    │ │  (Cache)    │
└─────────────┘ └─────────────┘ └─────────────┘
```

---

## Module 1: Accounting Management

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      ACCOUNTING MANAGEMENT                               │
└─────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│                      CHART OF ACCOUNTS                               │
├──────────────────────────────────────────────────────────────────────┤
│ Assets                                                               │
│  ├─ Current Assets (Cash, Bank, Receivables)                        │
│  └─ Fixed Assets (Building, Equipment, Furniture)                   │
│                                                                      │
│ Liabilities                                                          │
│  ├─ Current Liabilities (Payables, Short-term Loans)                │
│  └─ Long-term Liabilities (Loans, Mortgages)                        │
│                                                                      │
│ Income                                                               │
│  ├─ Fee Income (Tuition, Admission, Exam)                           │
│  └─ Other Income (Library Fine, Transport, Hostel)                  │
│                                                                      │
│ Expenses                                                             │
│  ├─ Operating Expenses (Salary, Rent, Utilities)                    │
│  └─ Administrative Expenses (Marketing, Office Supplies)            │
│                                                                      │
│ Equity                                                               │
│  └─ Owner's Equity, Retained Earnings                               │
└──────────────────────────────────────────────────────────────────────┘
```

### Accounting Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         ACCOUNTING FLOW                                  │
└─────────────────────────────────────────────────────────────────────────┘

  Create Transaction
          │
          ▼
  ┌───────────────────┐
  │  Select Type      │
  │  - Income         │
  │  - Expense        │
  │  - Transfer       │
  │  - Journal Entry  │
  └────────┬──────────┘
           │
           ▼
  ┌───────────────────┐
  │  Enter Details    │
  │  - Date           │
  │  - Amount         │
  │  - Account        │
  │  - Description    │
  │  - Attachment     │
  └────────┬──────────┘
           │
           ▼
  ┌───────────────────┐
  │  Double Entry     │
  │  Validation       │──── Debit = Credit
  └────────┬──────────┘
           │
           ▼
  ┌───────────────────┐
  │  Post to Ledger   │──── Update Account Balances
  └────────┬──────────┘
           │
           ▼
  ┌───────────────────┐
  │  Generate Reports │
  │  - Trial Balance  │
  │  - P&L Statement  │
  │  - Balance Sheet  │
  │  - Cash Flow      │
  └───────────────────┘
```

### Accounting Database Schema

```
┌──────────────────────────┐         ┌──────────────────────────┐
│    chart_of_accounts     │         │      transactions        │
├──────────────────────────┤         ├──────────────────────────┤
│ id (PK)                  │         │ id (PK)                  │
│ branch_id (FK)           │         │ branch_id (FK)           │
│ account_code             │         │ transaction_date         │
│ account_name             │         │ transaction_type         │
│ account_type             │         │ (Income/Expense/Transfer)│
│ (Asset/Liability/        │         │ reference_no             │
│  Income/Expense/Equity)  │         │ description              │
│ parent_account_id (FK)   │         │ total_amount             │
│ is_active                │         │ payment_mode             │
│ created_at               │         │ attachment_url           │
└──────────────────────────┘         │ created_by (FK→users)    │
                                     │ created_at               │
┌──────────────────────────┐         └──────────────────────────┘
│   transaction_entries    │
├──────────────────────────┤         ┌──────────────────────────┐
│ id (PK)                  │         │    expense_categories    │
│ transaction_id (FK)      │         ├──────────────────────────┤
│ account_id (FK)          │         │ id (PK)                  │
│ entry_type               │         │ category_name            │
│ (Debit/Credit)           │         │ description              │
│ amount                   │         │ is_active                │
│ description              │         │ created_at               │
└──────────────────────────┘         └──────────────────────────┘
```

---

## Module 2: Library Management

```
┌─────────────────────────────────────────────────────────────────────────┐
│                       LIBRARY MANAGEMENT                                 │
└─────────────────────────────────────────────────────────────────────────┘

Features:
✓ Book Catalog Management
✓ ISBN/Barcode Integration
✓ Book Issue/Return
✓ Fine Calculation (Auto)
✓ Book Reservation
✓ Digital Library (e-Books)
✓ Reading History
✓ Overdue Alerts
```

### Library Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         LIBRARY FLOW                                     │
└─────────────────────────────────────────────────────────────────────────┘

  Student Requests Book
          │
          ▼
  ┌───────────────────┐
  │  Search Book      │
  │  - By Title       │
  │  - By Author      │
  │  - By ISBN        │
  │  - By Category    │
  └────────┬──────────┘
           │
           ▼
  ┌───────────────────┐
  │  Check            │
  │  Availability     │──── Available / Issued / Reserved
  └────────┬──────────┘
           │
           ▼
  ┌───────────────────┐
  │  Issue Book       │
  │  - Scan Barcode   │
  │  - Student ID     │
  │  - Due Date       │
  │  (15 days)        │
  └────────┬──────────┘
           │
           ▼
  ┌───────────────────┐        ┌──────────────────────────┐
  │  Book Issued      │───────►│  Student Notified        │
  │                   │        │  (SMS/Email)             │
  └────────┬──────────┘        └──────────────────────────┘
           │
           ▼
  ┌───────────────────┐
  │  Return Book      │
  │  - Scan Barcode   │
  │  - Check Condition│
  └────────┬──────────┘
           │
           ▼
  ┌───────────────────┐
  │  Calculate Fine   │──── If overdue: ₹5/day
  │  (If Overdue)     │
  └────────┬──────────┘
           │
           ▼
  ┌───────────────────┐        ┌──────────────────────────┐
  │  Book Returned    │───────►│  Fine Payment            │
  │  Status Updated   │        │  (If applicable)         │
  └───────────────────┘        └──────────────────────────┘
```

### Library Database Schema

```
┌──────────────────────────┐         ┌──────────────────────────┐
│        books             │         │    book_transactions     │
├──────────────────────────┤         ├──────────────────────────┤
│ id (PK)                  │         │ id (PK)                  │
│ branch_id (FK)           │         │ book_id (FK)             │
│ isbn                     │         │ student_id (FK)          │
│ barcode                  │         │ transaction_type         │
│ title                    │         │ (Issue/Return/Reserve)   │
│ author                   │         │ issue_date               │
│ publisher                │         │ due_date                 │
│ category                 │         │ return_date              │
│ edition                  │         │ fine_amount              │
│ total_copies             │         │ fine_paid                │
│ available_copies         │         │ book_condition           │
│ rack_location            │         │ issued_by (FK→users)     │
│ price                    │         │ created_at               │
│ purchase_date            │         └──────────────────────────┘
│ cover_image_url          │
│ is_active                │         ┌──────────────────────────┐
│ created_at               │         │    library_fines         │
└──────────────────────────┘         ├──────────────────────────┤
                                     │ id (PK)                  │
┌──────────────────────────┐         │ transaction_id (FK)      │
│    book_categories       │         │ student_id (FK)          │
├──────────────────────────┤         │ fine_amount              │
│ id (PK)                  │         │ paid_amount              │
│ category_name            │         │ payment_date             │
│ description              │         │ payment_mode             │
│ is_active                │         │ status                   │
└──────────────────────────┘         │ (Pending/Paid/Waived)    │
                                     │ created_at               │
                                     └──────────────────────────┘
```

---

## Module 3: Inventory Management

```
┌─────────────────────────────────────────────────────────────────────────┐
│                       INVENTORY MANAGEMENT                               │
└─────────────────────────────────────────────────────────────────────────┘

Features:
✓ Asset Management (Computers, Furniture, Equipment)
✓ Consumables Management (Stationery, Supplies)
✓ Stock In/Out Tracking
✓ Low Stock Alerts
✓ Vendor Management
✓ Purchase Orders
✓ Asset Depreciation
✓ Barcode/QR Scanning
```

### Inventory Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         INVENTORY FLOW                                   │
└─────────────────────────────────────────────────────────────────────────┘

  Purchase Request
          │
          ▼
  ┌───────────────────┐
  │  Create Purchase  │
  │  Order            │
  │  - Item Details   │
  │  - Quantity       │
  │  - Vendor         │
  │  - Price          │
  └────────┬──────────┘
           │
           ▼
  ┌───────────────────┐
  │  Approval         │──── HOD/Admin Approval
  │  Workflow         │
  └────────┬──────────┘
           │
           ▼
  ┌───────────────────┐
  │  Order Placed     │──── Vendor Notified
  └────────┬──────────┘
           │
           ▼
  ┌───────────────────┐
  │  Goods Received   │
  │  - Verify Items   │
  │  - Generate GRN   │
  │  - Update Stock   │
  └────────┬──────────┘
           │
           ▼
  ┌───────────────────┐
  │  Stock Updated    │──── Inventory Count Increased
  │  - Assign Barcode │
  │  - Set Location   │
  └────────┬──────────┘
           │
           ▼
  ┌───────────────────┐
  │  Item Allocation  │
  │  - Department     │
  │  - User           │
  │  - Purpose        │
  └────────┬──────────┘
           │
           ▼
  ┌───────────────────┐        ┌──────────────────────────┐
  │  Stock Out        │───────►│  Low Stock Alert         │
  │  Recorded         │        │  (If quantity < min)     │
  └───────────────────┘        └──────────────────────────┘
```

### Inventory Database Schema

```
┌──────────────────────────┐         ┌──────────────────────────┐
│    inventory_items       │         │   inventory_transactions │
├──────────────────────────┤         ├──────────────────────────┤
│ id (PK)                  │         │ id (PK)                  │
│ branch_id (FK)           │         │ item_id (FK)             │
│ item_code                │         │ transaction_type         │
│ barcode                  │         │ (Stock In/Stock Out)     │
│ item_name                │         │ quantity                 │
│ category                 │         │ transaction_date         │
│ (Asset/Consumable)       │         │ reference_no             │
│ description              │         │ vendor_id (FK)           │
│ unit_of_measure          │         │ allocated_to             │
│ current_stock            │         │ (Department/User)        │
│ min_stock_level          │         │ purpose                  │
│ max_stock_level          │         │ created_by (FK→users)    │
│ unit_price               │         │ created_at               │
│ location                 │         └──────────────────────────┘
│ purchase_date            │
│ warranty_expiry          │         ┌──────────────────────────┐
│ is_active                │         │    purchase_orders       │
│ created_at               │         ├──────────────────────────┤
└──────────────────────────┘         │ id (PK)                  │
                                     │ branch_id (FK)           │
┌──────────────────────────┐         │ po_number                │
│        vendors           │         │ vendor_id (FK)           │
├──────────────────────────┤         │ order_date               │
│ id (PK)                  │         │ expected_delivery        │
│ vendor_name              │         │ total_amount             │
│ contact_person           │         │ status                   │
│ phone                    │         │ (Pending/Approved/       │
│ email                    │         │  Received/Cancelled)     │
│ address                  │         │ approved_by (FK→users)   │
│ gst_number               │         │ created_by (FK→users)    │
│ is_active                │         │ created_at               │
│ created_at               │         └──────────────────────────┘
└──────────────────────────┘
```



---

## API Endpoints

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           API ENDPOINTS                                  │
└─────────────────────────────────────────────────────────────────────────┘

Accounting:
GET    /api/accounting/accounts
POST   /api/accounting/accounts/create
GET    /api/accounting/transactions
POST   /api/accounting/transactions/create
GET    /api/accounting/reports/trial-balance
GET    /api/accounting/reports/profit-loss
GET    /api/accounting/reports/balance-sheet

Library:
GET    /api/library/books
POST   /api/library/books/create
POST   /api/library/books/issue
POST   /api/library/books/return
GET    /api/library/transactions
GET    /api/library/fines
POST   /api/library/fines/pay

Inventory:
GET    /api/inventory/items
POST   /api/inventory/items/create
POST   /api/inventory/stock-in
POST   /api/inventory/stock-out
GET    /api/inventory/purchase-orders
POST   /api/inventory/purchase-orders/create
GET    /api/inventory/vendors
```

---

## Tech Stack

```
┌─────────────────────────────────────────────────────────────────────────┐
│                            TECH STACK                                    │
└─────────────────────────────────────────────────────────────────────────┘

Backend:
- API: Node.js (Express) / Django
- Database: MySQL 8.0+
- Cache: Redis
- File Storage: Hostinger VPS Local Storage

Frontend:
- Framework: React.js
- UI Library: Material-UI / Ant Design
- Charts: Chart.js

Integrations:
- Barcode: QuaggaJS / ZXing
- PDF Generation: PDFKit / jsPDF
- Excel Export: ExcelJS / SheetJS

Hardware:
- Barcode Scanner
- RFID Readers (Optional)
```

---

## Implementation Checklist

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      IMPLEMENTATION CHECKLIST                            │
└─────────────────────────────────────────────────────────────────────────┘

Week 1-2: Accounting Module
□ Chart of accounts setup
□ Transaction entry system
□ Double-entry validation
□ Ledger management
□ Financial reports

Week 3-4: Library Module
□ Book catalog management
□ Barcode integration
□ Issue/Return system
□ Fine calculation
□ Overdue alerts

Week 5-6: Inventory Module
□ Item management
□ Stock in/out tracking
□ Purchase order system
□ Vendor management
□ Low stock alerts

Week 7-8: Integration & Testing
□ Module integration
□ API testing
□ Performance testing
□ Security audit
□ User acceptance testing

Week 9-10: Documentation & Training
□ User manuals
□ API documentation
□ Admin training
□ Video tutorials
```

---

## Success Metrics

- Transaction processing time: <2 seconds
- Book issue/return time: <30 seconds
- Inventory accuracy: >99%
- Report generation time: <5 seconds

---

**Phase 9 Complete: Accounting, Library & Inventory Ready**
