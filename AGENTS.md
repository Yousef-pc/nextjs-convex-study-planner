# StudyPro - AI Agent Architecture & Rules

You are an expert full-stack engineer working on StudyPro, a Next.js 16 + Convex application.
Whenever you write code, you MUST strictly adhere to the following architectural rules, tech stack, and patterns.

## 1. Tech Stack
* **Framework:** Next.js 16 (App Router, Turbopack)
* **Backend/Database:** Convex (Real-time WebSockets)
* **Auth:** Better Auth (integrated with Convex)
* **UI:** Tailwind CSS v4, Shadcn UI (Base UI version), Lucide React
* **Forms/Validation:** React Hook Form + Zod

## 2. Strict TypeScript Rules
* **NO `any`**: Use `Id<"tableName">` and `Doc<"tableName">` for Convex types. If you must bypass a type, use `unknown` and type guards.
* **Explicit Types**: Always define interfaces for component props (e.g., `interface MarketplaceCardProps { ... }`).

## 3. Shadcn UI (Base UI) Rules
* **NEVER use `asChild`**. We are using the Base UI version of Shadcn.
* **ALWAYS use `render`** when passing a custom element to a trigger/button.
  * ✅ Correct: `<Button render={<Link href="/dashboard" />}>Go</Button>`
  * ❌ Wrong: `<Button asChild><Link href="/dashboard">Go</Link></Button>`

## 4. Next.js & Caching Rules
* **Client vs. Server Components**: Keep `"use client"` isolated to interactive "islands" (e.g., buttons, forms). Use Server Components for layout and static data.
* **Caching**: Use the `"use cache"` directive and `cacheLife()` for static, public data (like the Marketplace list). 
* **Live Data**: Use Convex `useQuery` and `<Suspense>` for real-time data (like Comments). DO NOT cache live WebSocket data.
* **Metadata**: Use Next.js `Metadata` object in `layout.tsx`. For social previews, use dynamic `opengraph-image.tsx`.

## 5. Convex Backend Rules
* **Authentication**: ALWAYS check `authComponent.safeGetAuthUser(ctx)` at the start of every mutation.
* **Atomicity**: Convex mutations are fully transactional. If an error is thrown, all database writes are automatically rolled back. Do NOT write manual `try/catch` rollbacks.
* **Double Validation**: Validate incoming data with Zod on the frontend AND the backend.
* **Indexes**: Always define and use `.withIndex()` for queries (e.g., `.withIndex("by_user", q => q.eq("user", userId))`).

## 6. Folder Structure
* `app/`: Routing only. Dynamic routes (e.g., `app/dashboard/marketplace/[pluginSlug]/page.tsx`) are thin wrappers.
* `components/web/dashboard/`: Contains all domain logic. 
  * `plugins/`: The shell components for plugins (e.g., `StudyPlannerPlugin`).
  * `marketplace/`: The marketplace UI and Client Islands.
* `convex/`: All backend logic, schemas, mutations, and queries.
* `lib/`: Utilities, shared helpers, and test setup (`testUtils.ts`).

## 7. Testing Rules
* Use **Vitest** and **convex-test**.
* Put all tests in `convex/tests/`.
* Use `createAuthenticatedTest()` from `lib/testUtils.ts` to mock Better Auth sessions.
* Test high-risk features (Auth, Smart Import limits, Account deletion).

## 8. Smart Import Specifics
* The Smart Import parser is custom. It looks for `*Title*`, `[Text]`, and `{Code}` in the string.
* Smart Import limits are strictly enforced on the backend using Zod.
* Do NOT use optimistic updates for Smart Import; use a blocking loader overlay.