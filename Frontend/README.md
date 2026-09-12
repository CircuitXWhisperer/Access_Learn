# AccessLearn Frontend

Production-oriented React + Vite + TypeScript frontend scaffold for the AccessLearn inclusive education platform.

## Implemented

- Student and admin role-based entry with protected routes.
- Student dashboard inspired by the supplied AccessLearn / Sahayak Ed screens.
- Daily learning path, lesson reader, audio-first library and scholarship/scheme hub.
- AI Sahayak lesson assistant with browser speech synthesis and simple/simplified mode.
- Student learning-profile setup with React Hook Form + Zod validation.
- Educator Command Centre, inclusion roster, live classroom and exam management screens.
- Exam Hall with question navigation and accessibility tools.
- Focus mode, text scaling, keyboard-focus treatment and screen-reader-friendly labels.
- TanStack Query server-state layer, Axios API client, refresh interceptor and in-memory access token store.
- DOMPurify for rich-text rendering.
- Zod validation for frontend environment variables.
- Demo mode so the UI can run before the backend is connected.

## Blueprint alignment

The frontend follows the supplied blueprint's React + Vite + TypeScript structure: `src/lib/env.ts`, `src/lib/api/client.ts`, `src/lib/api/refreshClient` behavior inside the API client, `src/auth/AuthProvider.tsx`, `src/auth/tokenStore.ts`, `src/components/RequireAuth.tsx`, `src/components/ErrorBoundary.tsx`, and domain-oriented page/feature modules.

The blueprint specifies access JWTs in memory, refresh tokens in an HttpOnly cookie, protected routes, TanStack Query, React Hook Form + Zod, DOMPurify, a root error boundary, and loading/error states. Those frontend patterns are represented here. See the source blueprint for the backend contract and security rules.

## Demo accounts

The demo login accepts any valid email. The selected portal controls the role.

- Student: `arjun@accesslearn.demo`
- Admin: `admin@accesslearn.demo`

No demo token is persisted to localStorage or sessionStorage.

## Run

1. Copy `.env.example` to `.env`.
2. Install dependencies with `npm install`.
3. Run `npm run dev`.
4. Use the Student or Admin entry on `/login`.

Set `VITE_DEMO_MODE=false` when the backend API is available at `VITE_API_BASE_URL`.

## Dependency verification

Dependency versions in `package.json` were selected after checking the npm registry on 11 September 2026 rather than copying version numbers from the supplied blueprint. The blueprint itself explicitly says its dependency numbers are not authoritative.
