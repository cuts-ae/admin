# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Admin management portal for the Cuts.ae food delivery platform built with Next.js 15 (App Router), React 19, TypeScript, and Tailwind CSS v4.

## Development Commands

### Local Development
```bash
npm install                    # Install dependencies
npm run dev                    # Start dev server on port 45003 with Turbopack
npm run build                  # Build for production with Turbopack
npm start                      # Start production server on port 45003
npm run lint                   # Run ESLint
```

The admin portal runs at `http://localhost:45003` in development.

## Architecture

### Authentication Flow
1. User authenticates via `/login` page
2. API validates credentials and checks for `role = 'admin'` in database
3. JWT token and user data stored in localStorage as `admin_token` and `admin_user`
4. `AdminLayout` component enforces auth check and role verification on mount
5. All API requests include token in `Authorization: Bearer {token}` header
6. If auth fails or role is not admin, user is redirected to `/login`

### API Integration
The portal communicates with a separate backend API. Environment variable `NEXT_PUBLIC_API_URL` controls the API base URL:
- Development: `http://localhost:45000` (default)
- Production: `http://34.130.93.201`

API client is centralized in `lib/api.ts` with typed response wrapper `ApiResponse<T>`. All endpoints are admin-scoped at `/api/v1/admin/*`.

### State Management
No global state management library used. Components manage local state with `useState` and fetch data directly via the `api` object from `lib/api.ts`. Dashboard pages use polling for real-time updates.

### Routing Structure
Using Next.js App Router with the following layout:
- `/` - Redirects to login
- `/login` - Authentication page (no layout)
- `/dashboard/*` - All admin pages wrapped in `AdminLayout`
  - `/dashboard` - Analytics and KPIs
  - `/dashboard/restaurants` - Restaurant management
  - `/dashboard/invoices` - Invoice generation and tracking
  - `/dashboard/users` - User management across all roles
  - `/dashboard/drivers` - Driver approvals (stub)
  - `/dashboard/orders` - Order management (stub)
  - `/dashboard/settings` - Platform settings (stub)

### Component Architecture
- **Server Components**: Used by default for better performance
- **Client Components**: Used only where needed (forms, interactive elements, auth)
- `AdminLayout` wraps all dashboard pages and handles:
  - Auth/role verification
  - Sidebar navigation with active state
  - Mobile responsive sidebar with backdrop
  - User info display and logout

### Styling System
Tailwind CSS v4 with custom theme defined in `app/globals.css` using the `@theme` directive:
- CSS variables for colors follow shadcn/ui naming convention
- Light mode only (dark mode variables defined but not implemented)
- Custom animations: `animate-in`, `animate-out`, `fade-in`, slide variations
- Radial gradient background with dot pattern for visual depth
- Responsive design with mobile-first approach

### UI Components
Minimal component library in `components/ui/`:
- `button.tsx` - Button with variants (default, destructive, outline, ghost)
- `card.tsx` - Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter
- `input.tsx` - Standard input with consistent styling

Utility components:
- `invoice-pdf.tsx` - PDF generation with jsPDF
- `user-detail-modal.tsx` - Modal for user details and order history
- `restaurant-map.tsx` - Location map display (stub)

### TypeScript Configuration
- Path aliases: `@/*` maps to project root
- Strict mode enabled
- Target: ES2017
- Module resolution: bundler

## Key Technical Details

### Demo Credentials
```
Email: admin@cuts.ae
Password: TabsTriggerIsnt2026*$
```

### Port Assignments
- Admin Portal: 45003
- Backend API: 45000

### Admin API Endpoints
All require admin authentication:
- `GET /api/v1/admin/analytics` - Platform KPIs
- `GET /api/v1/admin/restaurants` - List restaurants
- `POST /api/v1/admin/restaurants/:id/approve` - Approve restaurant
- `GET /api/v1/admin/users` - List users
- `GET /api/v1/admin/users/:id` - User details
- `PUT /api/v1/admin/users/:id` - Update user
- `GET /api/v1/admin/users/:id/orders` - User order history
- `PUT /api/v1/admin/users/:id/status` - Update user status
- `GET /api/v1/admin/orders` - List orders
- `GET /api/v1/admin/orders/:id` - Order details
- `PUT /api/v1/admin/orders/:id` - Update order
- `GET /api/v1/admin/invoices` - List invoices
- `GET /api/v1/admin/invoices/:id` - Invoice details
- `POST /api/v1/admin/invoices/generate` - Generate invoice
- `GET /api/v1/admin/drivers` - List drivers
- `POST /api/v1/admin/drivers/:id/approve` - Approve driver

### Build Configuration
- ESLint errors ignored during builds (`ignoreDuringBuilds: true`)
- TypeScript errors NOT ignored (`ignoreBuildErrors: false`)
- Turbopack enabled for faster builds
