# Codebase Concerns

**Analysis Date:** 2026-04-13

## Tech Debt

**Main Admin Page:**
- Issue: Single `src/app/admin/page.tsx` file is 285KB with 5000+ lines of code - monolithic file combining all admin functionality
- Files: `src/app/admin/page.tsx`
- Impact: Maintainability nightmare - any admin feature change requires editing this massive file. Hard to review, test, and debug.
- Fix approach: Split into feature-based components (ClientsPanel, InstallationsPanel, SettingsPanel, etc.) and extract to separate files under `src/components/admin/`

**Server Actions:**
- Issue: All server actions in single files (`admin.ts` 1068 lines, `user.ts` 455 lines) without separation by domain
- Files: `src/app/actions/admin.ts`, `src/app/actions/user.ts`, `src/app/actions/leads.ts`
- Impact: Difficult to maintain, import entire action file triggers full file evaluation
- Fix approach: Split into domain-specific action modules under `src/app/actions/*/`

**Duplicate Hooks:**
- Issue: `use-mobile` hook exists in both `src/hooks/use-mobile.ts` and `src/lib/hooks/use-mobile.tsx`
- Files: `src/hooks/use-mobile.ts`, `src/lib/hooks/use-mobile.tsx`
- Impact: Unclear which to use, potential inconsistency
- Fix approach: Consolidate to single location, remove duplicate

## Known Bugs

**Type Assertion Issue:**
- Symptoms: `maxLength={11 as any}` - unsafe type casting in phone input fields
- Files: `src/app/dashboard/page.tsx:500`, `src/app/dashboard/page.tsx:619`
- Trigger: React/TypeScript may treat maxLength as number|string in some contexts
- Fix approach: Remove `as any` and use proper typing, or wrap with Number() conversion

**Null Safety:**
- Symptoms: Server actions return `null` or empty arrays on error without distinguishing error types
- Files: `src/app/actions/admin.ts` (lines 154, 604), `src/app/actions/user.ts` (lines 142, 153)
- Trigger: Calling code cannot distinguish "no data found" from "error occurred"
- Fix approach: Return error objects `{ error: string, data?: T }` instead of null/[]

## Security Considerations

**Environment Variables:**
- Risk: `.env` file committed to repo with hardcoded Supabase keys including SERVICE_ROLE_KEY
- Files: `.env`
- Current mitigation: RLS policies on Supabase, but service role bypasses RLS
- Fix approach: Never commit `.env` to git, use `.env.local` for local dev, rotate exposed keys immediately

**Password Handling:**
- Risk: Auto-generated password stored in plaintext in profiles table, returned in API response
- Files: `src/app/actions/admin.ts:29`, `src/app/actions/admin.ts:49`
- Current mitigation: Password is random 11-char string
- Fix approach: Use password reset flow instead of plaintext password storage/display

**Middleware Auth:**
- Risk: Middleware queries DB on every authenticated request to get user role
- Files: `src/middleware.ts:56-60`
- Impact: Performance issue, additional DB load per request
- Fix approach: Cache role in session/token, use edge middleware without DB hit

## Performance Bottlenecks

**Admin Page Loading:**
- Problem: Single page with all admin features loads entire 285KB bundle on navigation
- Files: `src/app/admin/page.tsx`
- Cause: No code splitting, all components bundled together
- Fix approach: Implement React.lazy() for feature panels, use Next.js dynamic imports

**Middleware DB Query:**
- Problem: Every protected route triggers profile query for role check
- Files: `src/middleware.ts`
- Cause: No session caching, role looked up on each request
- Fix approach: Store role in auth token/comJWT, skip DB hit in middleware

## Dependencies at Risk

**Node 24.x Requirement:**
- Risk: `package.json` specifies `"engines": { "node": "24.x" }` - very new release
- Impact: Many CI/CD systems, hosting providers may not support Node 24 yet
- Fix approach: Test extensively on Node 22 LTS, adjust engine requirement if needed

**Beta/Alpha Packages:**
- Risk: Using `@react-three/fiber@9.0.0-alpha.8`, `better-auth@1.5.6` (beta)
- Impact: API changes, breaking updates frequent in alpha/beta
- Fix approach: Pin exact versions, monitor changelogs, have upgrade plan

## Test Coverage Gaps

**No Test Files:**
- What's not tested: Zero test files visible in codebase
- Files: Entire codebase
- Risk: Any refactoring could break functionality without detection
- Fix approach: Add Vitest/Jest tests for server actions, React Testing Library for components

**Manual Verification Only:**
- What's not tested: Auth flow, payment integration, database operations
- Files: All actions in `src/app/actions/*`
- Risk: Auth bugs, data corruption could go unnoticed
- Fix approach: Add integration tests with test Supabase instance, mock auth