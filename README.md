# Sciona Algorithm Atlas

A static-site encyclopedia that renders Sciona's 142 CDGs (Computational Dependency Graphs), 459 atoms, and 142 solution guides as an interconnected, searchable knowledge base. Built with Astro SSG, Tailwind v4, MDX, and React islands. Deploys to Cloudflare Pages at [atlas.sciona.dev](https://atlas.sciona.dev).

## Prerequisites

- **Node.js >= 22.12.0** (check with `node -v`)
- **Peer repos:** The sync pipeline reads source-of-truth data from `sciona-atoms*` repos that must be siblings to this repo in the same workspace directory:

```
workspace/              # ← SCIONA_WORKSPACE (defaults to parent of this repo)
├── sciona-atoms/       # Core atoms + CDG definitions (required)
├── sciona-atoms-ml/    # ML satellite atoms (optional)
├── sciona-atoms-dl/    # DL satellite atoms (optional)
├── sciona-atoms-signal/
├── sciona-atoms-geo/
├── sciona-atoms-cs/
├── sciona-atoms-bio/
└── sciona-kb/          # ← This repo
```

## Quick start

```sh
npm install
npm run dev        # runs sync + starts dev server at localhost:4321
```

The `sync` step reads all atom repos, extracts Python source, syntax-highlights with shiki, and generates MDX files into `src/content/{atoms,cdgs,solutions}/`. These generated files are not committed — they're rebuilt from source data each time.

## Commands

| Command              | Action                                                     |
| :------------------- | :--------------------------------------------------------- |
| `npm run sync`       | Regenerate MDX content from atom repos                     |
| `npm run dev`        | Sync + start dev server at `localhost:4321`                |
| `npm run build`      | Sync + production build + pagefind search index            |
| `npm run preview`    | Preview production build locally                           |

## Environment variables

Copy `.env.example` to `.env` to customize:

| Variable             | Default                    | Description                                    |
| :------------------- | :------------------------- | :--------------------------------------------- |
| `SCIONA_WORKSPACE`   | `../` (parent of this repo)| Directory containing `sciona-atoms*` repos     |

## Architecture

See [ARCH.md](./ARCH.md) for detailed architecture notes covering the data pipeline, content collections, routing, the interactive React Flow viewer, and educational concept pages.

## Data pipeline overview

```
sciona-atoms*/data/solution_cdgs/*.json           → CDG definitions
sciona-atoms*/data/solution_cdgs/*_bindings.json  → Atom bindings per CDG
sciona-atoms*/src/sciona/atoms/**/matches.json    → Atom metadata
sciona-atoms*/src/sciona/atoms/**/atoms.py        → Python implementations
                        ↓
              scripts/sync-content.ts
                        ↓
         src/content/{atoms,cdgs,solutions}/*.mdx
                        ↓
                   Astro SSG build
                        ↓
                      dist/
```

After each sync, a `sync-report.json` is written to the project root with stats on atoms extracted, missing code, unresolved FQDNs, and other gaps.
