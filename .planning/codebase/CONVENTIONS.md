# Coding Conventions

**Analysis Date:** 2026-04-13

## Naming Patterns

**Files:**
- PascalCase: `BookingForm.tsx`, `ErrorReporter.tsx`, `user.ts`
- UI components: `src/components/ui/*.tsx` (lowercase, hyphenated)
- Server actions: `*.ts` in `src/app/actions/`

**Functions:**
- camelCase: `validatePHPhone`, `createClient`, `signIn`
- Server actions: Named exports like `signIn`, `changePassword`, `requestService`

**Variables:**
- camelCase: `supabaseClient`, `formData`, `userRole`

## Code Style

**Formatting:**
- Prettier: Not explicitly configured, uses ESLint defaults
- Tailwind CSS v4 with `@tailwindcss/postcss` plugin

**Linting:**
- ESLint flat config (`eslint.config.mjs`)
- Key rules enabled:
  - `import/no-unresolved` (error)
  - `import/named` (error)
  - `import/default` (error)
  - `import/namespace` (error)
  - `import/no-cycle` (error)
- Disabled: `react/no-unescaped-entities`, `@next/next/no-img-element`, `@typescript-eslint/no-unused-vars`, `@typescript-eslint/no-explicit-any`, `react-hooks/exhaustive-deps`

**TypeScript:**
- `strict: true` in `tsconfig.json`
- `moduleResolution: bundler`
- JSX: `react-jsx`

## Import Organization

**Order (from examples):**
1. React imports (`import * as React from "react"`)
2. Next.js imports (`import { redirect } from 'next/navigation'`)
3. UI library imports (`@radix-ui/*`, `lucide-react`)
4. External libs (`@supabase/ssr`, `zod`, `sonner`)
5. Relative imports (`@/lib/utils`, `@/components/ui/...`)

**Path Aliases:**
- `@/*` maps to `./src/*` (defined in `tsconfig.json`)

## Error Handling

**Patterns:**
- Server Actions: Return `{ error: string }` or `{ success: true }` objects
- Example: `src/app/actions/user.ts:28` - `if (error) { return { error: error.message } }`
- Global error: `ErrorReporter.tsx` component captures errors and posts to parent window
- Console logging: `console.error('signIn: error creating profile:', profileError)` pattern
- Form validation: `toast.error()` from `sonner` for user feedback

## Component Patterns

**UI Components:**
- Use `cva` (class-variance-authority) for variant props
- Use `cn()` utility from `@/lib/utils` for class merging
- Use Radix UI primitives (`@radix-ui/react-*`)
- Example: `src/components/ui/button.tsx`

**Client Components:**
- `'use client'` directive at top
- Hydration-safe patterns: `const [mounted, setMounted] = useState(false)`

## Comments

**When to Comment:**
- Complex logic: Server action error handling
- Props: TypeScript types with JSDoc optional (e.g., `type ReporterProps`)
- No inline comments in code (none observed)