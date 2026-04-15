# Testing Patterns

**Analysis Date:** 2026-04-13

## Test Framework

- **No testing framework configured**
- No Jest, Vitest, or other test runners in `package.json`
- No test scripts in npm scripts

## Test File Organization

- **No test files found** in the codebase
- No `*.test.*` or `*.spec.*` files exist

## Recommendations for Future Testing

To add testing to this Next.js 16 project:

1. **Install testing dependencies:**
   ```bash
   npm install --save-dev vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/dom
   ```

2. **Add test script to package.json:**
   ```json
   "test": "vitest"
   ```

3. **Create vitest.config.ts** with Next.js support

## Current Code Characteristics That Should Be Tested

**Server Actions** (`src/app/actions/*.ts`):
- `signIn` - authentication flow
- `requestService` - form submission
- `getDashboardStats` - data fetching

**Components** (`src/components/*.tsx`):
- `BookingForm` - multi-step form with validation
- UI components using Radix primitives

**Utilities** (`src/lib/utils.ts`):
- `validatePHPhone` - regex validation
- `cn` - class merging

## Mocking Patterns to Use

- Mock `@supabase/ssr` for Supabase client
- Mock `next/cache` (revalidatePath)
- Mock `next/navigation` (redirect)
- Use `vi.mock()` from Vitest