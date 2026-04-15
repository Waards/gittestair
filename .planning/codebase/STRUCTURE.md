# Structure

**Analysis Date:** 2026-04-13

## Directory Layout

```
src/
├── app/                    # Next.js App Router
│   ├── actions/           # Server Actions (auth, CRUD, data)
│   │   ├── user.ts        # Client actions (signIn, requestService, getProfile)
│   │   ├── admin.ts       # Admin actions (manage clients, appointments, settings)
│   │   └── leads.ts       # Lead management actions
│   ├── admin/             # Admin dashboard route
│   ├── dashboard/         # Client dashboard route
│   ├── login/             # Login page
│   ├── forgot-password/   # Password reset
│   ├── reset-password/    # Password reset confirm
│   ├── page.tsx           # Landing page
│   ├── layout.tsx         # Root layout
│   └── global-error.tsx   # Error boundary
├── components/
│   ├── ui/                # shadcn/ui components (button, card, dialog, etc.)
│   ├── sections/          # Landing page sections (hero, services, footer, etc.)
│   ├── booking-form.tsx   # Service booking form
│   ├── client-sidebar.tsx # Client dashboard sidebar
│   └── admin-sidebar.tsx  # Admin dashboard sidebar
├── lib/
│   ├── supabase.ts        # Client-side Supabase client
│   ├── supabase-server.ts # Server-side Supabase client (SSR)
│   ├── utils.ts           # Utility functions (cn, phone validation)
│   └── progress.ts        # Progress calculation helpers
├── hooks/
│   └── use-mobile.ts      # Mobile detection hook
├── visual-edits/          # Visual editing tools
└── middleware.ts          # Auth middleware, route protection
```

## Key File Locations

| Purpose | File Path |
|---------|-----------|
| Root Layout | `src/app/layout.tsx` |
| Auth Middleware | `src/middleware.ts` |
| Supabase Client (SSR) | `src/lib/supabase-server.ts` |
| Supabase Client (Client) | `src/lib/supabase.ts` |
| User Actions | `src/app/actions/user.ts` |
| Admin Actions | `src/app/actions/admin.ts` |
| Client Dashboard | `src/app/dashboard/page.tsx` |
| Admin Dashboard | `src/app/admin/page.tsx` |
| Login Page | `src/app/login/page.tsx` |
| Landing Page | `src/app/page.tsx` |

## Naming Conventions

- **Pages:** `page.tsx` (Next.js App Router requirement)
- **Server Actions:** `*.ts` in `actions/` folder, `'use server'` directive
- **Components:** PascalCase (`BookingForm.tsx` → `booking-form.tsx`)
- **UI Components:** `src/components/ui/` following shadcn/ui patterns
- **Utilities:** camelCase (`utils.ts`, `progress.ts`)
- **Hooks:** camelCase with `use-` prefix (`use-mobile.ts`)
- **Actions:** camelCase exports (`signIn`, `getProfile`, `requestService`)

## Where to Add New Code

| New Feature | Where to Add |
|------------|--------------|
| New page | `src/app/[route]/page.tsx` |
| New server action | `src/app/actions/` (new file or existing) |
| New UI component | `src/components/ui/` |
| New landing section | `src/components/sections/` |
| New utility | `src/lib/` |
| New hook | `src/hooks/` |
| API route | `src/app/api/[route]/route.ts` |

## Key Patterns

- **Server Components:** Default in Next.js App Router
- **Client Components:** Add `'use client'` at top of file
- **Server Actions:** Create in `actions/` files with `'use server'`
- **Component Imports:** Use `@/` alias (`@/components/ui/button`)
- **Route Protection:** Handled in `middleware.ts`
