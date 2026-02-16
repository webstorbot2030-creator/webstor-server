# Overview

**ويب ستور (Web Store)** is an Arabic-language digital services marketplace where users can purchase game credits, app top-ups, and digital subscriptions. The platform targets a Yemeni market (prices in Yemeni Riyal) and offers services like PUBG Mobile UC, Lama Ludo gems, and Shahid VIP subscriptions.

The app features:
- User registration/login via full name, phone number, and password
- A storefront with categories, service groups, and individual service packages
- An order system where users select a service, enter their game/app ID, and submit orders
- An admin panel for managing categories, services, orders, ads, banks, users, and settings
- A full accounting system with chart of accounts, funds, journal entries, trial balance, and period management
- Automatic journal entry creation when orders are completed
- A glassmorphism dark-themed UI with full RTL (right-to-left) support

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight router)
- **State/Data Fetching**: TanStack React Query for server state management
- **UI Components**: shadcn/ui (New York style) built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming, dark mode by default
- **Animations**: Framer Motion for transitions and micro-interactions
- **Forms**: React Hook Form with Zod validation via @hookform/resolvers
- **Layout**: Full RTL support, Cairo Arabic font, glassmorphism design on dark gradient background
- **Build Tool**: Vite with React plugin

### Backend
- **Runtime**: Node.js with TypeScript (tsx for dev, esbuild for production)
- **Framework**: Express 5
- **Authentication**: Passport.js with Local Strategy (phone number + password), express-session with PostgreSQL session store (connect-pg-simple)
- **Password Hashing**: Node.js crypto scrypt
- **File Uploads**: Multer with disk storage to `./uploads` directory
- **API Pattern**: RESTful JSON API under `/api/*` prefix. Route definitions are shared between client and server via `shared/routes.ts`

### Data Layer
- **Database**: PostgreSQL (required via `DATABASE_URL` environment variable)
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema Location**: `shared/schema.ts` — shared between frontend and backend
- **Schema Push**: `npm run db:push` uses drizzle-kit to push schema changes
- **Migrations**: Output to `./migrations` directory

### Database Schema (key tables)
- **users**: id, fullName, phoneNumber (unique), password (hashed), role (user/admin), balance, active
- **categories**: id, name, icon, image — top-level groupings (Games, Apps, Subscriptions)
- **serviceGroups**: id, name, categoryId, image, note, active, inputType (id/auth) — specific services within categories (e.g., "PUBG Mobile")
- **services**: id, name, price, serviceGroupId, active — individual packages/tiers (e.g., "60 UC - 491 YER")
- **orders**: id, userId, serviceId, status (pending/processing/completed/rejected), userInputId, rejectionReason, timestamps
- **banks**: bank account info for payment
- **ads**: advertisements with text/image types and optional links
- **settings**: key-value store for app configuration (WhatsApp number, store name, etc.)

### Project Structure
```
client/           → React frontend
  src/
    components/   → Reusable components (navbar, modals, ads slider)
    components/ui/→ shadcn/ui primitives
    hooks/        → Custom hooks (use-auth, use-store, use-orders)
    pages/        → Page components (home, auth, admin, accounting, not-found)
    lib/          → Utilities (queryClient, utils)
server/           → Express backend
  index.ts        → Server entry point
  routes.ts       → API route handlers
  auth.ts         → Passport authentication setup
  storage.ts      → Database access layer (IStorage interface)
  db.ts           → Drizzle/PostgreSQL connection
  vite.ts         → Vite dev server middleware
  static.ts       → Production static file serving
shared/           → Shared between client and server
  schema.ts       → Drizzle table definitions + Zod schemas
  routes.ts       → API route/path definitions
```

### Key Design Decisions
1. **Shared schema and routes**: The `shared/` directory contains both database schema and API route definitions, ensuring type safety across the full stack
2. **Storage interface pattern**: `IStorage` interface in `storage.ts` abstracts data access, making it possible to swap implementations
3. **Session-based auth**: Uses server-side sessions stored in PostgreSQL rather than JWTs, with Passport.js Local Strategy
4. **Phone-based authentication**: Users register/login with phone numbers instead of email — this is intentional for the target market
5. **Role-based access**: Admin routes check `req.user.role === 'admin'` for authorization
6. **Single build output**: Production build bundles both client (Vite) and server (esbuild) into `dist/`

## External Dependencies

### Database
- **PostgreSQL** — Required. Connection via `DATABASE_URL` environment variable. Used for all data storage and session management.

### Key NPM Packages
- **drizzle-orm** + **drizzle-kit** — ORM and migration tooling
- **express** v5 — HTTP server
- **passport** + **passport-local** — Authentication
- **connect-pg-simple** — PostgreSQL session store
- **@tanstack/react-query** — Client-side data fetching/caching
- **framer-motion** — Animations
- **react-hook-form** + **zod** — Form handling and validation
- **multer** — File upload handling
- **wouter** — Client-side routing
- **shadcn/ui** components (Radix UI based)

### Environment Variables
- `DATABASE_URL` — PostgreSQL connection string (required)
- `SESSION_SECRET` — Session encryption secret (has default fallback, should be set in production)
- `NODE_ENV` — Controls dev vs production behavior

### Dev Tooling
- **Vite** — Frontend dev server with HMR
- **tsx** — TypeScript execution for development
- **esbuild** — Server bundling for production
- Replit-specific plugins: `@replit/vite-plugin-runtime-error-modal`, `@replit/vite-plugin-cartographer`, `@replit/vite-plugin-dev-banner`