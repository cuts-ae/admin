# Admin Portal - Cuts.ae

Admin management portal for the Cuts.ae food delivery platform.

## Tech Stack

- Next.js 15.5.6 (App Router)
- React 19
- TypeScript
- Tailwind CSS
- Lucide React (icons)
- Recharts (analytics charts)

## Quick Start

### Development

```bash
npm install
npm run dev
```

Admin portal runs at `http://localhost:45002`

### Production

```bash
npm run build
npm start
```

## Demo Credentials

```
Email: admin@cuts.ae
Password: TabsTriggerIsnt2026*$
```

Note: User must have `role = 'admin'` in the database to access the portal.

## Features

### Dashboard
- Platform-wide analytics and KPIs
- Total revenue, active orders, users, and restaurants
- Recent orders list
- Top performing restaurants
- Real-time metrics

### Restaurants Management
- View all registered restaurants
- Filter by status (active, pending, suspended)
- Search by name or email
- Approve pending restaurants
- View restaurant details
- Edit restaurant information
- Suspend/activate restaurants
- Commission rate management

### Invoices Management
- View all restaurant invoices
- Generate new invoices
- Download invoice PDFs
- Track payment status
- Filter by period and restaurant
- Revenue summaries

### Users Management
- View all platform users
- Filter by role (customer, restaurant owner, driver, admin)
- Search by name or email
- Ban/suspend users
- Activate users
- View user activity
- User statistics by role

### Additional Modules (Coming Soon)
- Drivers management
- Orders management
- Platform settings
- Support tickets
- Reports and analytics

## API Integration

The admin portal connects to the backend API at:
- Development: `http://localhost:45000/api/v1`
- Production: `http://34.130.93.201/api/v1`

### Admin API Endpoints

All admin endpoints require authentication with admin role:

```
GET  /api/v1/admin/analytics          - Platform analytics
GET  /api/v1/admin/restaurants        - List all restaurants
POST /api/v1/admin/restaurants/:id/approve - Approve restaurant
GET  /api/v1/admin/drivers            - List all drivers
POST /api/v1/admin/drivers/:id/approve - Approve driver
GET  /api/v1/admin/invoices           - List all invoices
POST /api/v1/admin/invoices/generate  - Generate invoice
GET  /api/v1/admin/users              - List all users
GET  /api/v1/admin/orders             - List all orders
```

## Project Structure

```
admin/
├── app/
│   ├── dashboard/
│   │   ├── page.tsx              - Main dashboard
│   │   ├── restaurants/
│   │   │   └── page.tsx          - Restaurants management
│   │   ├── invoices/
│   │   │   └── page.tsx          - Invoices management
│   │   ├── users/
│   │   │   └── page.tsx          - Users management
│   │   ├── drivers/
│   │   │   └── page.tsx          - Drivers management
│   │   ├── orders/
│   │   │   └── page.tsx          - Orders management
│   │   └── settings/
│   │       └── page.tsx          - Platform settings
│   ├── login/
│   │   └── page.tsx              - Login page
│   ├── layout.tsx                - Root layout
│   ├── page.tsx                  - Home (redirects to login)
│   └── globals.css               - Global styles
├── components/
│   └── admin-layout.tsx          - Main admin layout with sidebar
├── lib/
│   ├── api.ts                    - API client functions
│   └── utils.ts                  - Utility functions
└── public/                       - Static assets
```

## Authentication Flow

1. User enters credentials on login page
2. API validates credentials and checks role
3. If user has `role = 'admin'`, JWT token is issued
4. Token stored in localStorage
5. All subsequent requests include token in Authorization header
6. Middleware on admin routes verifies token and admin role

## Design System

The admin portal uses a clean, professional design inspired by Next.js/Vercel:
- Light mode by default
- Subtle gradients and backgrounds
- Consistent spacing and typography
- Responsive design for mobile and desktop
- Accessible components with proper ARIA labels

## Development Notes

- Server Components used for better performance
- Client Components only where needed (forms, interactive elements)
- Real-time data fetching with polling
- Optimistic UI updates for better UX
- Error handling with user-friendly messages

## Related Projects

- **Restaurant Portal**: `/restaurant` - Restaurant owner interface
- **API Backend**: `/api` - Node.js + Express + PostgreSQL API
- **Customer App**: Coming soon
- **Driver App**: Coming soon
