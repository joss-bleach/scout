# Scout — Product Requirements Document

## Problem Statement

Football analysts, scouts, and coaches at professional clubs need internal tooling that makes complex event-level data legible and actionable. Public football data products either surface only aggregated statistics (goals, assists) or require deep technical knowledge to query. There is no purpose-built, fast, intuitive interface that lets a non-technical analyst browse, filter, and directly compare players using rich per-90 metrics derived from event data — and do so without writing SQL or Python.

## Solution

Scout is a full-stack internal-style football scouting and player-comparison tool that ingests StatsBomb open event data for the Premier League 2015/16 season, aggregates per-90 player metrics, and exposes them through a clean, fast UI. Analysts can browse all players with flexible filtering and sorting, and compare any two players head-to-head via a D3 radar chart and Plotly scatter visualisation. The application is deployed on GCP, typed end-to-end in TypeScript, and exposes both a REST and GraphQL API over a shared service layer.

## User Stories

### Player Browser

1. As an analyst, I want to see all players from the PL 2015/16 season in a sortable table, so that I can get a broad view of the player pool.
2. As an analyst, I want to filter players by position, so that I can narrow the table to the role I am scouting.
3. As an analyst, I want to filter players by minimum minutes played, so that I exclude players with too small a sample for reliable per-90 metrics.
4. As an analyst, I want to filter players by team, so that I can explore a specific club's squad.
5. As an analyst, I want to sort the player table by any metric column (xG, xA, progressive passes, tackles, etc.), so that I can rank players by the attribute I care about most.
6. As an analyst, I want to sort ascending or descending, so that I can find both high and low performers on any metric.
7. As an analyst, I want the table to show per-90 values rather than raw totals, so that players with different minutes are compared fairly.
8. As an analyst, I want to see a player's name, team, position, and key metrics at a glance in the table row, so that I do not need to click into each player to get basic context.
9. As an analyst, I want the player browser to load fast, so that filtering and sorting feel instantaneous rather than sluggish.

### Player Comparison

10. As an analyst, I want to select two players from the browser and view them side by side, so that I can directly compare their profiles.
11. As an analyst, I want to see a D3 radar chart comparing two players across a consistent set of metrics, so that I can immediately grasp the shape of each player's game.
12. As an analyst, I want the radar chart axes to be normalised against the full player pool (or positional peer group), so that values reflect relative rather than absolute performance.
13. As an analyst, I want a side-by-side stat table beneath the radar, showing every metric for both players, so that I can inspect specific numbers the radar cannot convey precisely.
14. As an analyst, I want to see a Plotly scatter chart plotting a metric pair (e.g. xG vs goals), so that I can identify over- and under-performers relative to expectation.
15. As an analyst, I want hover tooltips on the scatter chart that label each data point with the player name, so that I can orient myself in the distribution.
16. As a scout, I want to swap one of the two comparison players without losing the other selection, so that I can run a quick series of comparisons.

### Player Detail (Stretch)

17. As an analyst, I want to view a shot map for an individual player using Plotly, so that I can see the spatial distribution and xG value of their attempts.
18. As an analyst, I want shots coloured by outcome (goal, saved, missed, blocked), so that I can read the map without referring to a legend repeatedly.

### General UI / Non-Technical Usability

19. As a non-technical analyst, I want the interface to use familiar football terminology (xG, xA, progressive passes) rather than database column names, so that I do not need to interpret technical labels.
20. As a non-technical analyst, I want the application to be visually consistent with a professional football product aesthetic, so that it feels credible and not like a developer prototype.
21. As a non-technical analyst, I want clear empty states when no players match my filters, so that I do not assume the application has broken.
22. As any user, I want a StatsBomb attribution footer visible on every page, so that the data licence is properly honoured.

### API Consumers

23. As an API consumer, I want a REST endpoint to list and filter players, so that I can integrate the data into other tooling.
24. As an API consumer, I want a REST endpoint to retrieve a single player by ID, so that I can fetch a full profile.
25. As an API consumer, I want a REST endpoint to compare two or more players by IDs, so that I can retrieve comparison data programmatically.
26. As an API consumer, I want a GraphQL query to list players with filtering arguments, so that I can fetch exactly the fields I need in one request.
27. As an API consumer, I want a GraphQL query to fetch a single player and their stats, so that I can traverse the player → stats relation in one query.
28. As an API consumer, I want a GraphQL query to compare players by IDs, so that I can retrieve a comparison payload via GraphQL.
29. As an API consumer, I want the REST and GraphQL APIs to share the same underlying service and return consistent data, so that results are identical regardless of transport.

## Implementation Decisions

### Repository Structure
Pnpm workspaces monorepo, no Turborepo. Three packages:
- `apps/api` — Hono backend (REST + GraphQL)
- `apps/web` — Vite + React frontend
- `packages/types` — shared TypeScript types consumed by both apps

### Frontend
- Vite + React. No Next.js — the application is fully client-side and SSR provides no benefit for a data visualisation tool.
- **StyleX** (`@stylexjs/rollup-plugin`) for all styling. Tokens defined once in `*.stylex.ts` files matching the design system in `design.md` (navy, lilywhite, sky accent, Archivo/Outfit typefaces).
- **Base UI** (`@base-ui-components/react`) for accessible headless primitives (dropdowns, dialogs, tooltips, tables). Components are thin StyleX wrappers over Base UI — the shadcn composition pattern without Tailwind.
- **D3** for the radar chart. Hand-rolled, axes normalised against the player pool.
- **Plotly** (`react-plotly.js`) for the scatter chart and stretch shot map.
- Hosted on **Firebase Hosting** (static CDN, fast deploys, analogous to the Vercel experience).

### Backend
- **Hono** — lightweight, TypeScript-native HTTP framework.
- **GraphQL Yoga** mounted as a Hono middleware at `/graphql`.
- **Pothos** (code-first, manual definitions) for the GraphQL schema. No Pothos Drizzle plugin — avoids the RQBV2 beta dependency. Types are derived from Drizzle's `$inferSelect`.
- **Effect** for all business logic (aggregation, service layer). Effect programs are run at handler/resolver boundaries via `Effect.runPromise`. Errors are mapped to HTTP status codes or GraphQL errors at the boundary.
- Deployed to **Cloud Run** as a Docker container.

### Type Stack (single source of truth)
```
Drizzle schema
  ├─ $inferSelect → TypeScript types (shared via packages/types)
  ├─ createSelectSchema() [drizzle-orm/effect-schema] → Effect Schema (validation)
  └─ Pothos manual definitions → GraphQL schema
```

### Database
PostgreSQL on **Cloud SQL**. Key tables:
- `competitions` — `(competition_id, season_id)` composite PK
- `teams` — `team_id` PK
- `players` — `player_id` PK, FK to teams
- `matches` — `match_id` PK, FK to competitions + teams
- `raw_events` — raw StatsBomb event JSON, FK to matches. Retained as source of truth.
- `player_season_stats` — pre-aggregated per-90 metrics, `(player_id, competition_id, season_id)` PK

Metrics in `player_season_stats` (MVP): minutes, appearances, goals, assists, xG, xA, shots, shots on target, key passes, passes attempted, passes completed, pass completion %, progressive passes, carries, progressive carries, successful dribbles, tackles, interceptions, ball recoveries, pressures.

### Data Ingestion
- Source: StatsBomb Open Data PL 2015/16 (380 matches, ~950k events), loaded from the GitHub JSON repository.
- Ingestion script runs once at setup. All upserts are idempotent (`ON CONFLICT DO NOTHING` or `DO UPDATE`). Progress is logged per match.
- Aggregation is implemented as pure Effect functions: `rawEvents → PlayerSeasonStats`. No DB or network dependency in aggregation logic — input/output only.

### REST API
```
GET  /api/competitions
GET  /api/players?position=&team=&minMinutes=&sort=xg&order=desc&limit=&offset=
GET  /api/players/:id
GET  /api/compare?ids=123,456
GET  /health
```

### GraphQL API
```graphql
type Player  { id: ID!, name: String!, team: Team!, position: String, stats: PlayerStats! }
type Team    { id: ID!, name: String! }
type PlayerStats { minutes: Int!, goals: Float!, xg: Float!, xa: Float!, keyPasses: Float!, ... }

type Query {
  players(position: String, team: String, minMinutes: Int, sort: String, order: String, limit: Int, offset: Int): [Player!]!
  player(id: ID!): Player
  comparePlayers(ids: [ID!]!): [Player!]!
}
```

### Infrastructure (Pulumi → GCP)
All infra defined in TypeScript Pulumi:
- Cloud Run — API container
- Firebase Hosting — frontend static bundle
- Cloud SQL — Postgres
- Artifact Registry — Docker images
- Secret Manager — DB credentials (never in env vars or code)
- Least-privilege service account for Cloud Run (Cloud SQL client + Secret Manager accessor only)
- Workload Identity Federation for GitHub Actions (no long-lived service account keys)

### Security
- Least-privilege IAM on all GCP service accounts.
- DB credentials in Secret Manager, not environment variables.
- Workload Identity Federation for CI/CD — no long-lived keys in GitHub secrets.
- Parameterised queries throughout (Drizzle enforces this by default).
- Hono rate-limiting middleware on the API.
- CORS restricted to the frontend origin — no wildcard.
- No authentication in scope. README documents how auth (Clerk/Auth0 with role-based access) would be added for a production deployment holding real club data.

### CI/CD (GitHub Actions)
- **On pull request:** lint → typecheck → test → build (all packages in parallel where possible).
- **On merge to `main`:** API container build → push to Artifact Registry → deploy to Cloud Run; Vite build → Firebase deploy. Both run in the same workflow.

## Testing Decisions

A good test asserts observable behaviour — what the system produces given known inputs — not how it produces it. Tests must not reach into implementation details (internal Effect state, Drizzle internals, React component internals beyond rendered output).

### Unit — Effect Aggregation (highest value)
Given a fixture of raw StatsBomb events for a known player and match set, assert the computed `PlayerSeasonStats` fields exactly (goals, xG, progressive passes, etc.). Pure functions with no DB or network dependency. Run with Vitest. These tests are the showcase of the suite — they prove the core statistical logic is correct and demonstrate idiomatic Effect testing.

### Integration — REST and GraphQL Endpoints
Spin up a Postgres test database (Testcontainers or Docker Compose), seed it with a minimal player subset, and assert:
- REST: correct shape, filtering, sorting, and pagination on `/api/players`; correct player returned by `/api/players/:id`; correct comparison payload from `/api/compare`
- GraphQL: equivalent assertions via the `players`, `player`, and `comparePlayers` queries
- Both transports return identical data for equivalent queries

### Frontend — Component Tests
Vitest + Testing Library. Test the composed Base UI + StyleX components at the behaviour level:
- Player table renders rows, responds to sort/filter interactions
- Comparison view renders with two players selected
- Radar chart mounts without error given two player stat objects
- Empty state renders when filter returns no results

## Out of Scope

- Live or current-season data (StatsBomb open data is historical; live data is commercially licensed)
- Authentication and authorisation (addressed in README only)
- Mobile / responsive polish beyond "does not break on a standard laptop"
- StatsBomb 360 freeze-frame data and spatial visualisations
- New ML models — xG and xA are sourced directly from StatsBomb, not modelled
- Multi-tenancy or user accounts
- Player detail shot map (stretch goal — cut without guilt if timeline is at risk)
- Turborepo or remote build caching

## Further Notes

- **Deadline:** the repository must be public on GitHub before 30 June 2026. Protect deploy + README + aggregation tests over feature count. Cut list in priority order: shot map → some metrics → frontend component tests.
- **README is a deliverable.** It should cover: one-line summary + screenshot/GIF, architecture diagram, stack rationale (why both REST and GraphQL, why GCP, why Effect), StatsBomb attribution, local setup, deploy instructions, testing, trade-offs and next steps, and a note that the project was built with Claude Code with all output reviewed and tested.
- **StatsBomb attribution** must appear in the UI footer on every page and in the README, with their logo per the StatsBomb media pack.
- **AI coding tools** — the JD lists experience with AI coding agents (Claude Code, Copilot, Cursor) as a desirable. The README should explicitly state this was built with Claude Code and that all generated output was reviewed and tested. This is evidence, not a caveat.
- **Data licence** — StatsBomb Open Data is free for public/research/non-commercial use with attribution. This is non-commercial. Licence link: https://github.com/statsbomb/open-data/blob/master/LICENSE.pdf
