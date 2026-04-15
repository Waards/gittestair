# Architecture

**Analysis Date:** 2026-04-13

## Pattern Overview

**Overall:** Next.js 16 App Router with Server Actions and Supabase Auth

**Key Characteristics:**
- Server Components by default, `use client` for interactive components
- Server Actions (`'use server'`) in `src/app/actions/` handle all data mutations
- Supabase for authentication, database, and realtime features
- Client-side state management with React hooks
- Radix UI + Tailwind CSS for UI components

## Layers

**Routes/Pages:**
- Location: `src/app/`
- Contains: Page components, layouts, server actions
- Files: `page.tsx`, `layout.tsx`, `actions/*.ts`

**Server Actions:**
- Location: `src/app/actions/`
- Files: `user.ts`, `admin.ts`, `leads.ts`
- Contains: All database mutations, auth logic, data fetching

**Components:**
- Location: `src/components/`
- Contains: UI components (`ui/`), feature components (`sections/`, `*sidebar.tsx`)
- Uses: Radix UI primitives, shadcn/ui patterns

**Lib/Utilities:**
- Location: `src/lib/`
- Files: `supabase.ts`, `supabase-server.ts`, `utils.ts`, `progress.ts`
- Contains: Database clients, validation, helpers

**Middleware:**
- Location: `src/middleware.ts`
- Handles: Auth redirects, cookie management, route protection

## Data Flow

**Authentication Flow:**
1. User submits credentials on `/login`
2. Server Action `signIn` validates and creates session
3. Middleware checks session, redirects based on role (admin vs client)
4. Dashboard loads via Server Actions (`getProfile`, `getDashboardStats`)

**Service Request Flow:**
1. Client fills form on dashboard
2. Server Action `requestService` creates:
   - Appointment record
   - Installation/Repair record (based on service type)
   - Client request record
   - Admin notification
3. Admin sees request in `/admin`, can update status

## Entry Points

**Root Layout:**
- Location: `src/app/layout.tsx`
- Triggers: Every page render
- Initializes: Supabase, ErrorReporter, Toaster, VisualEditsMessenger

**Middleware:**
- Location: `src/middleware.ts`
- Triggers: Every request
- Protects: `/dashboard`, `/admin` routes

**Login Page:**
- Location: `src/app/login/page.tsx`
- Triggers: Unauthenticated user access

**Client Dashboard:**
- Location: `src/app/dashboard/page.tsx`
- Triggers: Authenticated client login

**Admin Dashboard:**
- Location: `src/app/admin/page.tsx`
- Triggers: Authenticated admin login
