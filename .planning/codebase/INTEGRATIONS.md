# Integrations

**Analysis Date:** 2026-04-13

## Database

**Primary:**
- Turso/libSQL (SQLite edge database)
- Client: `@libsql/client` 0.15.15
- ORM: Drizzle ORM 0.44.7
- Migrations: Drizzle Kit 0.31.6
- Configured in: Database schemas and connection files

## Authentication

**Primary:**
- better-auth 1.5.6 - Full-stack authentication framework
- bcrypt 6.0.0 - Password hashing

**Secondary:**
- Supabase Auth (@supabase/supabase-js 2.89.0)
- @supabase/ssr 0.8.0 - SSR utilities for Supabase auth

**Related:**
- Various Radix UI components for auth UI (dialog, form, etc.)

## Payment Processing

**Provider:**
- Stripe 19.2.0
- Package: stripe npm package
- Integration: Payment gateway API

## External Services

**File Storage:**
- Supabase Storage (via @supabase/supabase-js)
- Remote image loading via Next.js image optimization

**Email/Notifications:**
- (Not detected in dependencies - may be server-side)

**Analytics:**
- (Not detected in dependencies)

## API Integrations

**External APIs:**
- Stripe API for payments
- Supabase APIs for auth/storage
- LibSQL for database

**Webhooks:**
- Unknown - typically handled via API routes

## CI/CD & Deployment

**Platform:**
- Vercel (implied by Next.js usage)
- Supports Vercel Analytics, Edge Functions, etc.

**Build:**
- Next.js 16.2.1 with TypeScript
- Turbopack for development (npm run dev)
- Build script: npm run build

**Linting:**
- ESLint 9.38.0
- Configuration: eslint.config.mjs

## Environment Configuration

**Local Development:**
- `.env.local` - Local environment variables
- `.env` - Base environment configuration

**Required Variables:**
- Database connection (Turso/libSQL)
- Authentication secrets (better-auth)
- Stripe keys
- Supabase keys (if used)

## Third-Party Libraries

**UI Components:**
- Radix UI primitives (18+ packages)
- Headless UI (@headlessui/react)
- Various Radix components: dialog, dropdown, popover, tooltip, etc.

**Icons:**
- Lucide React
- React Icons
- Tabler Icons
- Heroicons

**Data Visualization:**
- Recharts
- Three.js / React Three Fiber
- tsParticles for effects

**Utilities:**
- React Hook Form (form handling)
- Zod (validation)
- date-fns (dates)
- jsPDF (PDF generation)