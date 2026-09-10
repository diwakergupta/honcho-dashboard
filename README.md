# Honcho Dashboard

[![CI](https://github.com/diwakergupta/honcho-dashboard/actions/workflows/ci.yml/badge.svg)](https://github.com/diwakergupta/honcho-dashboard/actions/workflows/ci.yml)
[![Bun](https://img.shields.io/badge/Bun-1.4+-black?logo=bun)](https://bun.sh)
[![React](https://img.shields.io/badge/React-19-blue?logo=react)](https://react.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38bdf8?logo=tailwindcss)](https://tailwindcss.com)
[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](LICENSE)

A high-performance, self-hosted single-page dashboard for inspecting what your [Honcho](https://honcho.dev) memory service has learned: workspaces, peers, sessions, conclusions, and a side-by-side **"what different agents see"** perspective comparison view.

It communicates **directly from your browser** to your self-hosted Honcho server using Bearer authentication — no backend server proxy required. The API key and configuration are safely stored in your browser's `localStorage`.

---

## Highlights & Features

- 🧠 **Synthesized Working Representations** — Beautiful markdown rendering of human-readable peer models with raw/formatted toggles and one-click copy.
- 💬 **Interactive Dialectic Console** — Ask peers questions directly and observe how they reason from their learned worldview, with adjustable reasoning levels (`minimal`, `low`, `medium`, `high`) and target viewpoints.
- 🔀 **Perspective Comparison (`/compare`)** — Contrast how different agents perceive the world or each other side-by-side. Inspect differing beliefs about the same target subject.
- 🔍 **Semantic Knowledge Search** — Workspace-wide and session-scoped semantic search with instantaneous result preview and token metrics.
- ⚡ **Real-Time Processing Queue** — Visual progress monitoring of completed, in-progress, and pending Honcho work units.
- 🤖 **LLM Context Assembly Inspector** — Inspect the exact prompts, system summaries, and windowed messages that Honcho feeds to downstream LLMs.
- 🏢 **Multi-Workspace Context Switcher** — Seamlessly navigate between multiple workspaces or instantiate new memory scopes.
- 📱 **Responsive & Refined UI** — Built with Tailwind CSS v4, dark obsidian theme, deterministic peer identity avatars, and mobile drawer navigation.

---

## Tech Stack

- **Runtime & Bundler**: [Bun](https://bun.sh) — package manager, test runner, and `Bun.serve` fullstack HTML-import bundler (no Vite, no Webpack).
- **Frontend**: [React 19](https://react.dev) + [React Router v7](https://reactrouter.com).
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com) compiled natively by Bun via `bun-plugin-tailwind`.
- **Icons**: [Lucide React](https://lucide.dev).
- **SDK**: [`@honcho-ai/sdk`](https://www.npmjs.com/package/@honcho-ai/sdk) 2.4.0 (targeting the v3 Honcho API).

---

## Quickstart

### Option 1: Run with Bun (Recommended)

```sh
# Clone the repository
git clone https://github.com/diwakergupta/honcho-dashboard.git
cd honcho-dashboard

# Install dependencies
bun install

# Start development server with Hot Module Reloading (HMR)
bun dev
```

Visit [http://localhost:3000](http://localhost:3000). The dashboard comes preconfigured for local Honcho:

- **API Key** (*optional*): Leave blank if your local Honcho instance runs unauthenticated.
- **Server URL** (*prefilled*): Preconfigured to `http://localhost:3001`. If you omit `http://`, it will be added automatically.
- **Workspace ID** (*prefilled*): Preconfigured to `hermes`.

To serve in production mode:
```sh
bun start
```

---

### Option 2: Run with Docker / Docker Compose

You can launch the dashboard with Docker in one command:

```sh
docker compose up -d
```

Or build and run manually:
```sh
docker build -t honcho-dashboard .
docker run -d -p 3000:3000 --name honcho-dashboard honcho-dashboard
```

The dashboard will be live at `http://localhost:3000`.

---

## Configuration & CORS

Because the dashboard communicates directly from the browser to your Honcho server, your self-hosted Honcho instance must allow CORS requests from the dashboard's origin (e.g. `http://localhost:3000`).

In your Honcho server environment, ensure:
```sh
CORS_ORIGINS=["http://localhost:3000"]
```

Configuration is persisted in browser `localStorage` under the key `honcho.config.v1`. To disconnect or change servers, click **Sign out** at the bottom of the sidebar.

---

## Environment Variables

| Variable | Default   | Description                                          |
| -------- | --------- | ---------------------------------------------------- |
| `PORT`   | `3000`      | HTTP port the server listens on                      |
| `HOST`   | `localhost` | Bind address (defaults to localhost)                 |

---

## Testing & Verification

```sh
# Run all automated tests
bun test

# Run TypeScript compiler check
bun typecheck
```

---

## Architecture & Conventions

- **SDK Isolation Boundary**: `src/lib/honcho.ts` is the *only* file that imports `@honcho-ai/sdk`. All UI components interact strictly with `HonchoClient`.
- **Client Registry**: `src/lib/client.ts` manages singleton instance lifecycle across workspace transitions.
- **HTML-Import Routing**: `src/server.ts` maps `/` and SPA catch-all `/*` to `index.html`. Bun bundles linked scripts and styles on the fly.
- **Tailwind Native Compilation**: Bun processes `src/styles.css` using `bun-plugin-tailwind` configured in `bunfig.toml`.

See [`AGENTS.md`](./AGENTS.md) for architectural invariants and contributing guidelines.

---

## License

Released under the [Apache 2.0 License](LICENSE).
