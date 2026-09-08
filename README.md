# Honcho Dashboard

A self-hosted, single-page dashboard for inspecting what your [Honcho](https://honcho.dev) agents have learned: workspaces, peers, sessions, conclusions, and a side-by-side "what different agents see" comparison view.

Built entirely with **Bun** — no Vite, no Node/npm. Bun is the package manager, runtime, test runner, and bundler/serving layer (Bun's native fullstack HTML-import routes + `Bun.serve`).

## Stack

- **Bun** — runtime, `bun test`, and `Bun.serve` fullstack mode (native HTML-import routes, JS/TSX bundling, and dev HMR)
- **React 19** + **react-router** (v7) — `createBrowserRouter` with nested routes
- **Tailwind CSS 4** — compiled natively by Bun via the `bun-plugin-tailwind` bundler plugin (registered in `bunfig.toml`); hand-rolled shadcn-style UI components
- **@honcho-ai/sdk 2.4.0** — targets the current v3 Honcho API. The SDK makes browser-direct API calls to your self-hosted Honcho server (Bearer auth via the API key you paste at login)

## Getting started

```sh
bun install
bun dev          # http://localhost:3000 with hot module reload (bun --hot)
```

In the browser you'll be redirected to `/login`. Paste:

- **API key** — required. Honcho issues these per workspace/user.
- **Base URL** — optional. Leave blank for the default Honcho cloud endpoint.
  Set to your self-hosted server, e.g. `http://localhost:8000`.
- **Workspace ID** — optional. Set it to scope the dashboard to one workspace;
  leave blank to browse all workspaces you have access to.

The config is stored in `localStorage` under `honcho.config.v1`. Sign out from the sidebar to clear it.

### Production

```sh
bun start        # serves on http://localhost:3000 (no HMR)
```

`bun start` runs the same server as `bun dev` but without the `--hot` flag, so
asset bundling is served from Bun's build cache instead of re-bundling each request.

### Tests & typecheck

```sh
bun test         # 20 tests across 3 files
bun typecheck    # tsc --noEmit
```

## How the server works

`src/server.ts` imports `index.html` and passes it to `Bun.serve` as the route for
`/` and the SPA catch-all `/*`. Bun's bundler scans the HTML for `<script>` and
`<link>` tags, bundles the referenced TSX and CSS (with HMR in dev), and serves the
result — so there is no separate Vite/build-server step and no custom watch/rebuild
loop.

Tailwind CSS v4 is compiled natively by Bun through the **`bun-plugin-tailwind`**
bundler plugin, registered in `bunfig.toml`:

```toml
[serve.static]
plugins = ["bun-plugin-tailwind"]
```

With that in place `src/styles.css` (which starts with `@import "tailwindcss"`) is
processed by Bun's own CSS pipeline — no PostCSS step, no build script, no
pre-compiled static file. `index.html` links it directly via
`<link rel="stylesheet" href="/src/styles.css" />`.

## Environment variables

| Var    | Default     | Description                          |
| ------ | ----------- | ------------------------------------ |
| `PORT` | `3000`      | HTTP port the dashboard listens on   |
| `HOST` | `0.0.0.0`   | Bind address (0.0.0.0 by default so it is reachable on the network) |

## Pages

- **Overview** (`/`) — stat cards, semantic search, recent peers/sessions, and the
  processing-queue status (completed / in-progress / pending work units)
- **Workspaces** (`/workspaces`) — list all workspaces the API key can see; switch context
- **Peers** (`/peers`) — list peers; click one for its **working representation**,
  self-conclusions, sessions, and a chat box
- **Sessions** (`/sessions`) — list sessions; click one for messages, short/long
  summaries, and the exact context an LLM sees
- **Compare** (`/compare`) — pick peer A, peer B (and an optional target) to see
  their representations and cards side by side. This is the "what different agents
  see" view.

## SDK version

This dashboard is written against **@honcho-ai/sdk 2.4.0**, which targets the current
**v3 Honcho API** (e.g. `peers()`, `sessions()`, `representation()` returning a string,
`conclusionsOf()`, `queueStatus()`, and `workspaces()` returning a `Page`). The
`HonchoClient` wrapper in `src/lib/honcho.ts` normalizes the SDK's return types into a
single clean interface so the page components don't deal with them directly. If your
self-hosted Honcho server is an older v2 build, some pages may fail to load data at
runtime — in that case downgrade the SDK to a version matching your server.
