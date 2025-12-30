# Secure Jewellery Management System - Custom Orders Module

## Overview

This module implements a comprehensive custom jewellery order management system with customer order submission, manager approval workflow, and order tracking capabilities.

## Features Implemented

### 1. Customer Custom Order Form
- **Location**: `/custom-order.html`
- **Features**:
  - Multi-field order form with jewellery type, material, budget, description, and required date
  - File upload for design references (JPG, PNG, PDF up to 5MB)
  - Client-side validation for all required fields
  - Image preview for uploaded designs
  - Budget validation (minimum $100)
  - Required date validation (must be future date)

### 2. Manager Approval Dashboard
- **Location**: `/manager-dashboard.html`
- **Features**:
  - View all pending custom order requests
  - Display complete order details including customer requirements and uploaded designs
  - Approve or reject orders with manager comments
  - Modal-based review interface for detailed order examination
  - Role-based access control (managers only)

### 3. Order Tracking System
- **Location**: `/order-tracking.html`
- **Features**:
  - Visual timeline showing order progression
  - Status badges with color coding
  - Manager feedback display
  - Complete order details view
  - Status stages: Requested → Approved → In Production → Completed (or Rejected)

### 4. Customer Dashboard
- **Location**: `/dashboard.html`
- **Features**:
  - List all customer's orders
  - Quick status overview
  - Direct access to order tracking
  - Create new custom order button

## Database Schema

### Table: `custom_jewellery_orders`

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| user_id | uuid | Foreign key to auth.users |
| jewellery_type | text | Type of jewellery (Ring, Necklace, etc.) |
| material | text | Preferred material (Gold, Silver, etc.) |
| budget | numeric | Customer's budget |
| description | text | Detailed requirements |
| required_date | date | When customer needs the order |
| design_file_path | text | Path to uploaded design file |
| design_file_name | text | Original filename |
| status | text | Order status (requested, approved, in_production, completed, rejected) |
| manager_comment | text | Manager's feedback |
| manager_id | uuid | Manager who processed the order |
| created_at | timestamptz | Order creation timestamp |
| updated_at | timestamptz | Last update timestamp |

### Row Level Security (RLS) Policies

1. **Customers can view their own orders**
2. **Customers can create their own orders**
3. **Customers can update their own pending orders**
4. **Managers can view all orders**
5. **Managers can update any order**

## File Structure

```
project/
├── index.html                      # Login page
├── dashboard.html                  # Customer dashboard
├── custom-order.html              # Custom order form
├── manager-dashboard.html         # Manager approval interface
├── order-tracking.html            # Order tracking page
├── src/
│   ├── styles.css                 # Shared styling
│   ├── supabaseClient.js         # Supabase initialization
│   ├── auth.js                    # Authentication functions
│   ├── orders.js                  # Order management functions
│   ├── utils.js                   # Utility functions
│   ├── login.js                   # Login page logic
│   ├── dashboard.js               # Customer dashboard logic
│   ├── custom-order.js            # Custom order form logic
│   ├── manager-dashboard.js       # Manager dashboard logic
│   └── order-tracking.js          # Order tracking logic
├── package.json                   # Project dependencies
├── vite.config.js                 # Vite configuration
└── .env                           # Environment variables
```

## Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6 modules)
- **Build Tool**: Vite
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Authentication**: Supabase Auth with email/password
- **File Storage**: Supabase Storage

## Setup Instructions

### 1. Database Setup
The database schema and RLS policies are already configured via Supabase migrations.

### 2. Storage Bucket
A public storage bucket `jewellery-designs` has been created for design file uploads.

### 3. User Roles
To create a manager user, update the user's metadata in Supabase:
```sql
UPDATE auth.users
SET raw_app_meta_data = raw_app_meta_data || '{"role": "manager"}'::jsonb
WHERE email = 'manager@example.com';
```

### 4. Run the Application
```bash
# Install dependencies
npm install

# Start development server (handled automatically)
npm run dev

# Build for production
npm run build
```

## Security Features

1. **Row Level Security (RLS)**: All database operations are restricted by RLS policies
2. **Authentication Required**: All pages require user authentication
3. **Role-Based Access**: Manager dashboard restricted to users with manager role
4. **Input Validation**: Client-side and server-side validation for all forms
5. **File Upload Validation**: Type and size restrictions on uploaded files
6. **SQL Injection Prevention**: Using Supabase parameterized queries

## User Workflows

### Customer Workflow
1. Login at `/index.html`
2. View orders at `/dashboard.html`
3. Create new order at `/custom-order.html`
4. Track order status at `/order-tracking.html`

### Manager Workflow
1. Login at `/index.html` (with manager role)
2. Redirected to `/manager-dashboard.html`
3. Review pending orders
4. Approve/reject orders with comments

## Status Flow

```
Requested → Approved → In Production → Completed
    ↓
  Rejected
```

## API Functions

### Authentication (`src/auth.js`)
- `signIn(email, password)` - User login
- `signUp(email, password, metadata)` - User registration
- `signOut()` - User logout
- `getCurrentUser()` - Get current user
- `isManager(user)` - Check if user is manager

### Orders (`src/orders.js`)
- `createCustomOrder(orderData)` - Create new order
- `getMyOrders()` - Get customer's orders
- `getOrderById(orderId)` - Get specific order
- `getAllOrders()` - Get all orders (managers)
- `getPendingOrders()` - Get pending orders (managers)
- `updateOrderStatus(orderId, status, comment, managerId)` - Update order
- `uploadDesignFile(file)` - Upload design file

### Utilities (`src/utils.js`)
- `formatDate(dateString)` - Format date
- `formatDateTime(dateString)` - Format date and time
- `formatCurrency(amount)` - Format currency
- `getStatusColor(status)` - Get status badge color
- `getStatusLabel(status)` - Get status display label
- `showNotification(message, type)` - Show toast notification
- `validateFile(file, maxSizeMB)` - Validate file upload

## Design Consistency

The UI maintains the existing dark theme with gold accents:
- Background: Dark gray (#1a1a1a)
- Cards: Medium gray (#2c2c2c)
- Accent: Gold (#d4af37)
- Text: White with gray variants

## Notes

- All pages use the existing styling conventions from `index.html`
- Authentication state is managed consistently across all pages
- File uploads are stored in Supabase Storage with public access
- Manager role is stored in `app_metadata` for security
- All timestamps are stored in UTC and formatted for display
- The system is fully responsive and works on mobile devices
