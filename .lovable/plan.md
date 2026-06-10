
# Magnolia OS — Phase 1 Build Plan

Scope for this project: the **Magnolia OS web portal** — a polished marketing presence, an ecosystem app catalog (roadmap), and the **flagship AI Assistant** product, all under one Magnolia Account. Native iOS/Android are out of scope for this codebase; backend will be structured so future native clients can reuse it.

## What we'll build

1. **Public marketing site** (dark, premium, minimal)
   - `/` — hero, ecosystem pitch, featured apps, CTA to launch Assistant
   - `/ecosystem` — full app catalog grid with status badges (Live / In development / Planned), categories (AI, Productivity, Creative, Social, Education, Health, Commerce, Smart Systems)
   - `/manifesto` — Magnolia OS vision/principles
   - Shared header/footer, SEO metadata per route, `llms.txt`

2. **Magnolia Account** (Lovable Cloud)
   - Email/password + Google sign-in
   - `/auth` page; `profiles` table auto-created on signup (display name, avatar)
   - `_authenticated/` layout protecting the app surface

3. **AI Assistant** (flagship, threaded)
   - `/app/assistant` thread list + new chat
   - `/app/assistant/$threadId` chat surface
   - Streaming chat via TanStack server route `/api/chat` → Lovable AI Gateway (`google/gemini-3-flash-preview`)
   - Threads + messages persisted in Postgres, scoped to `auth.uid()` via RLS
   - Built with AI Elements (Conversation, Message, PromptInput, Shimmer)
   - Markdown rendering, optimistic UI, focus management

4. **Design system foundation** (premium dark)
   - Update `src/styles.css` tokens: deep near-black background, off-white foreground, single warm magnolia accent, subtle elevation/gradient tokens
   - Typography: distinctive display (e.g. Fraunces or Instrument Serif) + clean sans (Geist/Inter alternative). One curated pair, not generic.
   - Shared primitives: GradientCard, SectionHeader, StatusBadge, AppTile

## Out of scope (Phase 1)

Native apps, payments/subscriptions, cross-app messaging bus, additional flagship apps (Tasks, CRM, etc.), admin tooling, analytics dashboards. These become later phases — the catalog page reflects them as "Planned".

## Technical details

- **Stack**: TanStack Start (already set up), Tailwind v4, shadcn/ui, AI SDK + AI Elements, Lovable Cloud (Supabase under the hood), Lovable AI Gateway.
- **Routes**:
  ```
  src/routes/
    __root.tsx                          (header/footer shell, auth listener)
    index.tsx                           (landing)
    ecosystem.tsx                       (app catalog)
    manifesto.tsx
    auth.tsx                            (sign in / sign up)
    _authenticated/route.tsx            (managed gate)
    _authenticated/app.assistant.index.tsx       (thread list / new)
    _authenticated/app.assistant.$threadId.tsx   (chat)
    api/chat.ts                         (streaming server route)
  ```
- **Server functions** (`src/lib/assistant.functions.ts`): `listThreads`, `createThread`, `getThreadMessages`, `renameThread`, `deleteThread` — all `.middleware([requireSupabaseAuth])`.
- **DB schema** (migration with GRANTs + RLS):
  - `profiles(id uuid pk → auth.users, display_name, avatar_url, created_at)` + auto-insert trigger
  - `assistant_threads(id uuid pk, user_id uuid, title text, created_at, updated_at)`
  - `assistant_messages(id uuid pk, thread_id uuid fk, role text, parts jsonb, created_at)`
  - RLS: owner-only on all three; GRANT to `authenticated` + `service_role`.
- **AI**: provider helper in `src/lib/ai-gateway.server.ts`; `/api/chat` uses `streamText` + `toUIMessageStreamResponse({ originalMessages, onFinish })` to persist the assistant turn.
- **Auth**: `supabase--configure_social_auth` for Google in same turn; broker via `lovable.auth.signInWithOAuth`.
- **App catalog data**: static TS array in `src/data/ecosystem.ts` (categories + 20–30 planned apps with status). Easy to extend later.

## Visual direction (default: dark premium minimal)

- Background `oklch(0.16 0.01 280)`, foreground near-white, accent warm magnolia rose `oklch(0.72 0.16 20)`.
- Generous negative space, hairline borders, soft radial highlight behind hero, restrained motion (fade/translate on enter only).
- Assistant chat: no bubble on AI replies, subtle filled bubble on user, monospace tool/code blocks.

## Order of execution

1. Enable Lovable Cloud + provision `LOVABLE_API_KEY` + configure Google auth.
2. Migration: profiles, threads, messages, RLS, GRANTs, trigger.
3. Design tokens + shared layout (header/footer, fonts, accent).
4. Landing, Ecosystem, Manifesto routes with per-route SEO.
5. Auth page + `_authenticated` gate.
6. AI Assistant: server fns, `/api/chat` route, AI Elements UI, thread routing.
7. `public/llms.txt`, polish pass, verify build.

## What you'll be able to do at the end

Sign in with Google or email, land in the Assistant, create multiple chat threads, stream responses, reload and see history restored, and browse the full Magnolia ecosystem roadmap on the public site.

Approve to start building, or tell me what to change (scope, visuals, auth methods, catalog contents).
