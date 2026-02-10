# Breezy Telecom

## Overview

Breezy Telecom is a fintech-styled web application for renting virtual phone numbers and receiving SMS messages. Users can register, deposit funds into a wallet, browse available virtual numbers by service (WhatsApp, Telegram, Facebook, etc.) and country, purchase numbers, and view received SMS messages. The app is branded as "Breezy" and designed with a dark-mode, premium fintech aesthetic.

The application follows a full-stack TypeScript monorepo pattern with a React frontend, Express backend, PostgreSQL database, and session-based authentication.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Monorepo Structure
- `client/` — React single-page application (Vite-powered)
- `server/` — Express.js API server
- `shared/` — Shared TypeScript types, Zod schemas, and route definitions used by both client and server
- `migrations/` — Drizzle-generated database migrations

### Frontend (client/)
- **Framework**: React with TypeScript, bundled by Vite
- **Routing**: `wouter` (lightweight client-side router)
- **State/Data Fetching**: TanStack React Query for server state management
- **UI Components**: shadcn/ui (new-york style) with Radix UI primitives, Tailwind CSS
- **Animations**: Framer Motion for page transitions and micro-interactions
- **Forms**: React Hook Form with Zod resolvers for validation
- **Design**: Mobile-first, dark theme fintech aesthetic with emerald/green primary color. Bottom navigation bar on mobile, sidebar on desktop
- **Fonts**: Inter (body), Plus Jakarta Sans (display headings)
- **Path aliases**: `@/` maps to `client/src/`, `@shared/` maps to `shared/`

### Backend (server/)
- **Framework**: Express.js running on Node with `tsx`
- **Authentication**: Passport.js with local strategy (username/password), session-based auth using `express-session` with PostgreSQL session store (`connect-pg-simple`)
- **Password Hashing**: Node.js `crypto.scrypt` with random salt
- **API Pattern**: REST endpoints under `/api/` prefix, route definitions shared between client and server via `shared/routes.ts`
- **External API Integration**: Structured to integrate with 247OTP.ng API for virtual number provisioning (currently mocked)
- **Financial Calculations**: Uses `decimal.js` for precise monetary arithmetic

### Database
- **Database**: PostgreSQL (required, connection via `DATABASE_URL` environment variable)
- **ORM**: Drizzle ORM with `drizzle-zod` for schema-to-validation integration
- **Schema** (defined in `shared/schema.ts`):
  - `users` — id, username, password, balance (numeric 10,2), isAdmin, createdAt
  - `numbers` — virtual phone numbers purchased by users (userId, phoneNumber, service, country, cost, status, expiresAt, orderId)
  - `transactions` — wallet transactions (userId, amount, type [deposit/purchase/refund], description)
  - `messages` — SMS messages received on virtual numbers (numberId, sender, content, receivedAt)
- **Migrations**: Use `npm run db:push` (drizzle-kit push) to sync schema to database

### Storage Layer
- `server/storage.ts` implements `IStorage` interface with `DatabaseStorage` class
- All database access goes through the storage abstraction, making it possible to swap implementations

### API Routes (shared/routes.ts)
The `api` object defines all endpoints with method, path, input schemas, and response schemas:
- **Auth**: POST `/api/register`, POST `/api/login`, POST `/api/logout`, GET `/api/user`
- **Wallet**: GET `/api/wallet/balance`, GET `/api/wallet/transactions`, POST `/api/wallet/deposit`
- **Numbers**: GET `/api/numbers`, GET `/api/numbers/available`, POST `/api/numbers/buy`, DELETE `/api/numbers/:id`
- **Messages**: GET `/api/numbers/:id/messages`

### Build System
- **Development**: `npm run dev` — runs Express server with Vite middleware for HMR
- **Production Build**: `npm run build` — Vite builds the client, esbuild bundles the server into `dist/index.cjs`
- **Production Start**: `npm run start` — runs the built server which serves static files from `dist/public`

### Key Design Decisions
1. **Shared route definitions**: Both client and server reference `shared/routes.ts` for type-safe API contracts with Zod validation
2. **Session-based auth over JWT**: Simpler for this use case, sessions stored in PostgreSQL for persistence across restarts
3. **Mobile-first with bottom nav**: The layout component renders a bottom navigation bar on mobile and a sidebar on desktop
4. **SMS polling**: The number details page polls for new messages every 5 seconds using React Query's `refetchInterval`
5. **Mock external API**: The 247OTP integration is structured but uses mock data; ready to swap in real API calls

## External Dependencies

### Database
- **PostgreSQL** — Required. Connection string via `DATABASE_URL` environment variable. Used for all data storage and session management.

### External APIs (Planned)
- **247OTP.ng** (`https://247otp.ng/api.php`) — Virtual number provider API for ordering phone numbers and receiving SMS. Currently mocked in `server/routes.ts`. Will need `OTP_API_KEY` environment variable when activated.

### Key NPM Packages
- `drizzle-orm` + `drizzle-kit` — Database ORM and migration tooling
- `passport` + `passport-local` — Authentication
- `express-session` + `connect-pg-simple` — Session management with PostgreSQL store
- `@tanstack/react-query` — Client-side data fetching and caching
- `framer-motion` — Animations
- `wouter` — Client-side routing
- `zod` + `drizzle-zod` — Schema validation
- `decimal.js` — Precise financial calculations
- `date-fns` — Date formatting
- `shadcn/ui` components (Radix UI primitives) — UI component library

### Environment Variables Required
- `DATABASE_URL` — PostgreSQL connection string (required)
- `SESSION_SECRET` — Secret for session signing (defaults to fallback in dev)
- `OTP_API_KEY` — API key for 247OTP.ng (needed when real API integration is enabled)