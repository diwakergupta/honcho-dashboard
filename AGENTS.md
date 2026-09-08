# AGENTS.md

Guidance for AI agents (and new humans) working in this repo. Read this before
making changes; the README is the user-facing overview.

## What this is

A self-hosted single-page dashboard for inspecting what a [Honcho](https://honcho.dev)
memory service has learned: workspaces, peers, sessions, conclusions, and a
side-by-side "what different agents see" comparison view. It talks **directly
from the browser** to a self-hosted Honcho server (no backend proxy) — the API
key is pasted at login and stored in `localStorage`.

## Commands

Run from the repo root. Bun is the runtime, package manager, test runner, and
serving layer — there is no npm, no Vite, no build step.

| Task           | Command            | Notes                                             |
| -------------- | ------------------ | ------------------------------------------------- |
| Install deps   | `bun install`      |                                                    |
| Dev server     | `bun dev`          | HMR via `bun --hot`, http://localhost:3000         |
| Production     | `bun start`        | Same server, no HMR (served from Bun build cache)  |
| Tests          | `bun test`         | 20 tests across 3 files (tests/*.test.ts)         |
| Typecheck      | `bun typecheck`    | `tsc --noEmit`                                    |

No formatter and no linter are configured. Do not introduce them. Run
`bun test` **and** `bun typecheck` after any change to `src/` or `tests/`.

## How the server works

`src/server.ts` imports `index.html` and passes it to `Bun.serve` as the route
for `/` and the SPA catch-all `/*`. Bun's bundler scans the HTML for `<script>`
and `<link>` tags, bundles the referenced TSX/CSS (HMR in dev), and serves the
result. Tailwind v4 is compiled natively by Bun via the `bun-plugin-tailwind`
plugin registered in `bunfig.toml` (`[serve.static]`). There is no separate
build/watch loop and no static output directory.

- Env vars: `PORT` (default `3000`), `HOST` (default `0.0.0.0`).
- The SPA catch-all `/*` in `Bun.serve` is what makes deep routes work on refresh.

## Architecture

```
index.html              <link href="/src/styles.css">, <script src="/src/index.tsx">
src/
  server.ts             Bun.serve: "/" and "/*" both serve index.html
  index.tsx             createBrowserRouter + route table (see below)
  styles.css            @import "tailwindcss"; Tailwind v4 theme tokens
  lib/
    honcho.ts           HonchoClient: the ONLY place that touches @honcho-ai/sdk
    client.ts           Client registry (singleton, connect/getClient/resetClient)
    config.ts           loadConfig/saveConfig/clearConfig (localStorage, key "honcho.config.v1")
    use-async.ts        useAsync<T>() hook: {data,error,loading,refetch}
    utils.ts            cn() (clsx + tailwind-merge), truncate()
  routes/
    root.tsx            Auth guard: redirect to /login if no config; layout w/ <Sidebar>
    login.tsx           API key / base URL / workspace form; validates via metadata()
    index.tsx           Overview (thin wrapper around components/overview/overview.tsx)
    workspaces.tsx      List workspaces; select one to switch context
    peers.tsx           List peers
    peers.$peerId.tsx   Peer detail: representation, conclusions, sessions, chat box
    sessions.tsx        List sessions
    sessions.$sessionId.tsx  Session detail: messages, summaries, search, LLM context
    compare.tsx         Side-by-side peer A / peer B (and optional target) comparison
  components/
    ui/                 Hand-rolled shadcn-style primitives (button, card, input, ...)
    layout/sidebar.tsx  Navigation; sign-out clears config
    shared/async-view.tsx  Loading/error/empty display for useAsync results
    overview/overview.tsx  Overview page body
tests/
  client.test.ts        HonchoClient vs a faked SDK (mock.module before import)
  config.test.ts        config.ts localStorage round-trips (localStorage is stubbed)
  utils.test.ts         cn() and truncate()
```

### Invariants that keep this maintainable

- **`src/lib/honcho.ts` is the sole boundary with the Honcho SDK.** Page
  components (`src/routes/*`, `src/components/*`) must never import
  `@honcho-ai/sdk` directly — go through `HonchoClient`. This isolates SDK
  version changes to one file. The README documents the exact SDK version and
  the shape of the v3 API it targets; keep that note in sync if you bump the SDK.
- **`src/lib/config.ts` owns the `honcho.config.v1` localStorage key.** Don't
  write to localStorage elsewhere.
- **`src/lib/client.ts` is the client registry.** Pages obtain the client via
  `getClient()` (or the `useAsync` hook) rather than constructing their own.
  `connect()`/`resetClient()` are used by login and the workspace switcher.
- **Route filenames map to URL paths** via `src/index.tsx`
  (`peers.$peerId.tsx` → `/peers/:peerId`). When adding a route, add the
  `<Route>` in `src/index.tsx` and the file in `src/routes/`.
- **UI is hand-rolled shadcn-style** (`src/components/ui/`). Prefer reusing an
  existing primitive over adding a component library.
- **No test/build config exists beyond what's shown** (no `jest`, no `vite`, no
  `eslint`, no `prettier`). Adding any of them is a project decision, not a
  drive-by.

## Conventions

- TypeScript, strict mode, `ES2022` target, `moduleResolution: "bundler"`,
  `isolatedModules: true`, path alias `@/*` → `./src/*`.
- Use `import type { ... }` for type-only imports (see `src/lib/honcho.ts`).
- React 19 + `react-jsx` transform: don't `import React` for JSX; import only
  what you use.
- Keep dependencies minimal; the `package.json` dependency set is deliberate
  (see the Stack section of the README).
- Commit messages: conventional style (`feat:`, `fix:`, `docs:`, `refactor:`,
  `test:`, `chore:`). Keep the first line under 72 chars; add a short body only
  when the "why" is non-obvious.

## Things that are easy to break

- **Tailwind plugin**: if Tailwind styling suddenly stops working, check that
  `bunfig.toml` still has `[serve.static] plugins = ["bun-plugin-tailwind"]`
  and that `src/styles.css` still begins with `@import "tailwindcss"`.
- **SPA catch-all**: `Bun.serve` must map both `"/"` and `"/*"` to `index.html`
  in `src/server.ts`; removing `"/*"` breaks deep-route refresh.
- **CORS** is a property of the *Honcho server*, not this dashboard. If the
  browser reports "failed to fetch", the likely cause is the Honcho container's
  `CORS_ORIGINS` not including the dashboard's origin (e.g.
  `http://localhost:3000`). The dashboard itself needs no change.
- **`bun test` localStorage**: Bun's test runtime does not provide
  `localStorage`; `tests/config.test.ts` stubs it on `globalThis`. If you add a
  test that touches `config.ts`, reuse that stub.

## What NOT to do

- Don't introduce a Node/npm or Vite toolchain; Bun is the only runtime.
- Don't add a backend/proxy layer; the browser talks to Honcho directly by
  design.
- Don't change the `honcho.config.v1` key name or its shape without a migration
  path in `config.ts`.
- Don't commit `.env`, `.crush/`, or `node_modules/` (see `.gitignore`).
