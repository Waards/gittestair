# Technology Stack

**Analysis Date:** 2026-04-13

## Languages

**Primary:**
- TypeScript - Main language for frontend and backend
- JavaScript - Legacy scripts

## Runtime

**Environment:**
- Node.js 24.x (specified in package.json engines)
- npm 10+

## Frameworks

**Core:**
- Next.js 16.2.1 - React framework with App Router
- React 19.2.0 - UI library

**Styling:**
- Tailwind CSS 4 - Utility-first CSS framework
- tailwindcss-animate - Animation utilities
- @tailwindcss/typography - Typography plugin

**Form Handling:**
- React Hook Form 7.60.0 - Form state management
- Zod 4.1.12 - Schema validation
- @hookform/resolvers - Zod resolvers for forms

**UI Components:**
- Radix UI - Headless component primitives (18+ packages)
- @headlessui/react 2.2.9 - Accessible UI components
- Lucide React 0.552.0 - Icon library
- React Icons 5.5.0 - Icon sets

**Animation:**
- Framer Motion 12.23.24 - Animation library
- Motion 12.23.24 - Alternative animation engine
- @tsparticles - Particle effects

**3D & Visualization:**
- Three.js 0.178.0 - 3D library
- React Three Fiber 9.0.0-alpha.8 - React renderer for Three
- @react-three/drei 10.4.4 - Helper components
- Recharts 3.0.2 - Charting library
- three-globe 2.43.0 - Globe visualization

## Data Layer

**ORM:**
- Drizzle ORM 0.44.7 - Type-safe SQL ORM
- Drizzle Kit 0.31.6 - Database migration tooling

**Database:**
- @libsql/client 0.15.15 - Turso/libSQL client (edge SQLite)

**External Data:**
- better-auth 1.5.6 - Authentication framework
- @supabase/ssr 0.8.0 - Supabase SSR utilities
- @supabase/supabase-js 2.89.0 - Supabase client

## Utilities

**Class Management:**
- class-variance-authority - Variant components
- clsx - Conditional classes
- tailwind-merge - Tailwind class merging

**Date/Time:**
- date-fns 4.1.0 - Date utilities
- react-day-picker 9.8.0 - Date picker component

**PDF Generation:**
- jspdf 4.2.1 - PDF generation
- jspdf-autotable 5.0.7 - PDF tables

**Other:**
- Stripe 19.2.0 - Payment processing
- bcrypt 6.0.0 - Password hashing
- @tabler/icons-react 3.35.0 - Additional icons

## Configuration

**Build Tools:**
- TypeScript 5 - Language compiler
- ESLint 9.38.0 - Linting
- eslint-config-next 15.5.0 - Next.js ESLint config

**Environment:**
- .env.local for local development
- Configuration in next.config.ts

## Platform Requirements

**Development:**
- Node.js 24.x
- npm 10+

**Production:**
- Vercel or similar platform (Next.js)
- Turso database (libSQL)