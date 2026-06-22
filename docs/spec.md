# Scout — Project Specification

> **What this is:** a first-pass build spec for *Scout*, a full-stack football scouting & player-comparison tool.
> **How to use it:** this doc is intended as the input to a planning / grilling session (e.g. in Claude Code). It states what we're building and why, then deliberately surfaces the genuine open decisions in **§16 — Open Decisions to Grill**. Start there.

---

## 1. Purpose & Context

Scout is a portfolio artifact built to support an application for a **Full-Stack Engineer** role in **Tottenham Hotspur's Football Insights / Football Systems team** (ref REQ00001469).

It is deliberately a *miniature of that job*: an internal-style data tool that ingests rich football event data, makes it usable for a non-technical audience (analysts/scouts), and is engineered the way the brief describes — TypeScript throughout, REST **and** GraphQL, PostgreSQL, deployed to GCP with infrastructure-as-code, CI/CD and tests.

It exists to do three jobs at once:

1. **Prove the stack** I already use (TypeScript, React, Node, Postgres).
2. **Close two essential gaps** my paid work doesn't yet evidence: **GraphQL** and **production cloud infrastructure (GCP)**.
3. **Hit desirables**: data visualisation, GCP, sports-data-ecosystem familiarity, and AI-assisted development.

### Hard constraint
- **Deadline: public on GitHub before 30 June 2026.** This is ~8 days, built alongside a full-time job. **Scope is ruthless. Protect deploy + README + tests over feature count.**

### Audience framing
- Build it as something **a non-technical analyst or scout would actually want to use** — clean, fast, legible. "Software domain experts want to use" is the heart of the role.

---

## 2. Goals & Non-Goals

### Goals (MVP)
- Ingest one competition-season of StatsBomb open event data into PostgreSQL.
- Aggregate per-90 player metrics in a typed, tested layer (Effect).
- Expose the data over **both a REST API and a GraphQL API**, sharing one service layer.
- A React/Next.js frontend with: (a) a filterable, sortable player browser, and (b) a player-vs-player comparison view with a radar chart.
- Deployed to **GCP**, provisioned with **Pulumi**, shipped via **GitHub Actions CI/CD**.
- A meaningful automated **test suite**.
- A **README** written for a hiring engineer.

### Non-Goals (explicitly out of scope to protect the deadline)
- Live / current-season data (open data is historical; live is a paid product).
- Authentication, accounts, multi-tenancy (note security thinking in README instead — see §13).
- Mobile / responsive polish beyond "doesn't break on a laptop".
- Building new ML models (xG/xA come *from* the StatsBomb data; we surface, not model).
- A design system. One clean, consistent look is enough.

---

## 3. Success Criteria

The repo is "done enough to ship" when a reviewer can:
- Clone it, follow the README, and run it locally.
- Visit a **live deployed URL** on GCP.
- See TypeScript end-to-end, a Postgres schema, a working REST endpoint **and** a working GraphQL endpoint, at least one real data visualisation, green CI, and tests that actually assert behaviour.
- Read a README that explains the *why* behind the architecture.

---

## 4. Tech Stack (locked)

| Layer | Choice | Notes |
|---|---|---|
| Language | **TypeScript** | front to back, non-negotiable |
| Frontend | **React + Next.js** | viz lib TBD (§16) |
| Styling | **StyleX** | atomic, type-safe, compile-time CSS-in-JS; toolchain integration TBD (§16) |
| Backend | **Node** + REST + GraphQL | framework TBD (§16) |
| Aggregation | **Effect** | typed, composable, testable; mirrors day-job |
| Database | **PostgreSQL** | their preferred RDBMS |
| Infra | **Pulumi → GCP** | Cloud Run + Cloud SQL |
| CI/CD | **GitHub Actions** | lint, typecheck, test, build, deploy |
| Tests | Vitest (or Jest) + integration | aggregation logic first |

---

## 5. Data

- **Source:** StatsBomb Open Data — free JSON on GitHub (`statsbomb/open-data`).
- **Licence:** free for public/research use **with attribution** — must state StatsBomb as the source (and use their logo per their media pack). Treat as **non-commercial**. Attribution goes in the README **and** a UI footer. (Noticing and respecting the licence is itself evidence of "handling data responsibly" and sports-data-ecosystem awareness.)
- **Structure:** `competitions.json` → `matches/{comp}/{season}.json` → `events/{match}.json` + `lineups/{match}.json`. Events are granular (pass, shot, carry, pressure, etc.). Some matches have 360 freeze-frame data; **out of scope for MVP**.
- **Scope:** **one** competition-season (see §16 for the choice). Keeping to one keeps ingestion small and the deadline realistic.

---

## 6. Domain Model & Metrics

**Entities:** Competition, Season, Team, Player, Match, and aggregated PlayerSeasonStats.

**Metrics (per 90 where relevant), MVP subset:**
- Attacking: goals, assists, xG, xA, shots, shots on target, key passes.
- Passing: passes attempted/completed, completion %, progressive passes.
- Carrying/dribbling: carries, progressive carries, successful dribbles.
- Defending: tackles, interceptions, ball recoveries, pressures.
- Context: minutes played, position, appearances.

Keep the metric list small for MVP; the schema should make adding more trivial.

---

## 7. Database Schema (first pass — to be grilled)

```sql
CREATE TABLE competitions (
  competition_id INT,
  season_id      INT,
  name           TEXT NOT NULL,
  season_name    TEXT NOT NULL,
  PRIMARY KEY (competition_id, season_id)
);

CREATE TABLE teams (
  team_id   INT PRIMARY KEY,
  team_name TEXT NOT NULL
);

CREATE TABLE players (
  player_id   INT PRIMARY KEY,
  player_name TEXT NOT NULL,
  team_id     INT REFERENCES teams(team_id),
  position    TEXT
);

CREATE TABLE matches (
  match_id       INT PRIMARY KEY,
  competition_id INT,
  season_id      INT,
  home_team_id   INT REFERENCES teams(team_id),
  away_team_id   INT REFERENCES teams(team_id),
  match_date     DATE,
  FOREIGN KEY (competition_id, season_id) REFERENCES competitions(competition_id, season_id)
);

-- Pre-aggregated at ingestion (decision in §16: pre-aggregate vs aggregate-on-query)
CREATE TABLE player_season_stats (
  player_id       INT REFERENCES players(player_id),
  competition_id  INT,
  season_id       INT,
  minutes         INT,
  appearances     INT,
  goals           NUMERIC,
  assists         NUMERIC,
  xg              NUMERIC,
  xa              NUMERIC,
  shots           NUMERIC,
  key_passes      NUMERIC,
  passes_completed INT,
  passes_attempted INT,
  progressive_passes NUMERIC,
  tackles         NUMERIC,
  interceptions   NUMERIC,
  -- ...extend as needed
  PRIMARY KEY (player_id, competition_id, season_id)
);
```

---

## 8. Aggregation Layer (Effect)

- **Why Effect:** typed errors, composability, and pure functions that are trivial to unit-test — and it echoes the "stats compilers with Effect" work on my CV.
- **Responsibilities:** parse raw event JSON → typed domain events → fold into per-90 player stats. Keep aggregation **pure** (input events → output stats) so it's testable without a DB or network.
- **Boundary:** ingestion is a clear, source-agnostic seam — swapping the data source (or dropping in 360 / live data later) shouldn't touch the aggregation logic.

---

## 9. API Design

**Principle:** REST and GraphQL are **two transports over one service layer** — do not duplicate business logic. The point is to demonstrate both cleanly.

**REST (illustrative):**
```
GET  /api/competitions
GET  /api/players?position=&minMinutes=&sort=xg&order=desc&limit=
GET  /api/players/:id
GET  /api/compare?ids=123,456            # 2+ players, side-by-side
```

**GraphQL (illustrative):**
```graphql
type Player { id: ID!, name: String!, team: Team!, position: String, stats: PlayerStats! }
type PlayerStats { minutes: Int!, goals: Float!, xg: Float!, keyPasses: Float!, ... }

type Query {
  players(position: String, minMinutes: Int, sort: String, limit: Int): [Player!]!
  player(id: ID!): Player
  comparePlayers(ids: [ID!]!): [Player!]!
}
```

---

## 10. Frontend

**Screens (MVP):**
1. **Player browser** — filter (position, minutes, metric thresholds) + sortable table.
2. **Comparison view** — pick 2 players → **radar chart** + side-by-side stat table.
3. *(Stretch)* **Player detail** — a shot map. Cut without guilt if behind.

**Quality bar:** clean, legible, fast; a non-technical user should understand it instantly. Minimal but intentional design (see the frontend-design skill when building the UI in Claude Code).

**Styling:** **StyleX** — type-safe, atomic, colocated styles with deterministic output. Define a small set of design tokens (colour, spacing, type scale) up front and compose from those for a consistent look. Confirm the StyleX build integration for the chosen toolchain early (see §16) — it's a styling-system choice with setup implications, not a drop-in.

---

## 11. Infrastructure (Pulumi → GCP)

- **Pulumi in TypeScript** (stack consistency).
- **Components:** Cloud Run (API), Cloud Run or static hosting (Next.js frontend), Cloud SQL (Postgres), Artifact Registry (images), a least-privilege service account, Secret Manager for DB credentials.
- **Monitoring:** a `/health` endpoint + Cloud Run logs/metrics; basic uptime is enough for MVP.

---

## 12. CI/CD (GitHub Actions)

- **PR checks:** lint → typecheck → test → build.
- **On merge to `main`:** build container → push to Artifact Registry → deploy to Cloud Run.
- Keep secrets in GitHub Actions secrets / Workload Identity Federation (no long-lived keys — note this in the README as a security decision).

---

## 13. Testing & Security

**Testing** ("well-tested" appears twice in the JD — treat tests as a feature):
- **Unit (highest value):** the Effect aggregation logic — given a known set of events, assert the computed per-90 stats.
- **Integration:** REST + GraphQL against a throwaway test database.
- *(Optional)* a couple of frontend component tests.

**Security (the JD lists "data security principles" as essential):** even without auth, demonstrate awareness — least-privilege IAM, secrets in Secret Manager, no credentials in code, parameterised queries, and a short README note on how I'd add authn/authz and protect sensitive data if this held real club data.

---

## 14. README Plan (the artifact recruiters actually read)

1. One-line what + a screenshot/GIF.
2. The problem & who it's for.
3. Architecture diagram.
4. **Stack rationale** — *why* REST **and** GraphQL, *why* GCP, *why* Effect.
5. Data + **StatsBomb attribution/licence**.
6. Run locally (clear, copy-pasteable).
7. How it's deployed (Pulumi/GCP/CI).
8. Testing.
9. **Trade-offs & what I'd do next** (shows judgement and self-awareness).
10. A note that it was **built with AI coding tools (Claude Code), with all output reviewed and tested** — directly evidencing the "AI coding agents" desirable.

---

## 15. Build Sequence (8 days, alongside work)

1. Repo + Pulumi/GCP skeleton (project, Cloud Run, Cloud SQL) + CI scaffold + DB schema.
2. Ingestion script (StatsBomb JSON → Postgres) for the chosen competition + Effect aggregation.
3. REST endpoints + unit tests on aggregation.
4. GraphQL layer over the same service + API integration tests.
5. Frontend skeleton + player browser + comparison radar.
6. Filters/sorting + usability polish for non-technical users.
7. Full deploy to GCP via Pulumi + wire CI/CD + `/health` + monitoring.
8. README, architecture diagram, screenshots, attribution, buffer.

**Cut list if behind:** shot map → some metrics → frontend tests. Never cut: a working deploy, the README, and the aggregation tests.

---

## 16. Open Decisions to Grill (start here)

These are genuine, unresolved trade-offs. Each should be interrogated and decided before/while building.

1. **Which competition-season?** More players (full league season) = richer comparisons but bigger ingest; a tournament is smaller/recognisable. Candidates in open data include La Liga seasons, Champions League seasons, the FA WSL (a subtle nod to Spurs Women), and World Cups/Euros. *Leaning: one full league season.* Decide and justify.
2. **Backend framework:** NestJS (familiar, batteries-included, clean REST+GraphQL story) vs a lean setup (Fastify/Hono + a GraphQL lib). Trade familiarity/speed vs weight, given 8 days.
3. **GraphQL implementation:** which library (Apollo Server, GraphQL Yoga, Pothos, Mercurius)? Code-first vs schema-first?
4. **Visualisation library:** D3 (max control, more effort) vs Plotly/Recharts/visx (faster). Radar chart is the must-have.
5. **Frontend toolchain + StyleX integration:** is Next.js worth it, or is Vite + React enough? Next gives API routes + a clean deploy story but adds surface area — and **StyleX's setup differs by bundler**. Confirm the current StyleX integration path for the chosen stack early (Babel/SWC plugin, App Router vs Pages Router, Turbopack compatibility); styling-toolchain friction is a real risk on an 8-day timeline. Verify against the latest StyleX docs during the grill, as the Next.js story has been evolving.
6. **Aggregate at ingestion vs on query?** Pre-computing `player_season_stats` is fast and simple; on-query is flexible but heavier. *Leaning: pre-aggregate for MVP.*
7. **Frontend hosting on GCP:** Cloud Run vs Firebase Hosting. (Vercel would be easiest for Next, but the brief wants **GCP** — staying on-brand matters more than convenience here.)
8. **Repo structure:** monorepo (pnpm/Turborepo, shared types between API and web) vs separate packages.
9. **How much to ingest:** all matches in the season, or a representative subset to hit the deadline? Define a fallback.
10. **Security depth:** how far to go beyond "note it in the README" — e.g. a simple API token to make the security story concrete?
11. **Test scope:** what's the minimum suite that genuinely demonstrates rigour without eating the timeline?
12. **Attribution mechanics:** exact placement/wording of StatsBomb attribution to stay compliant.

---

## 17. How Scout Maps to the Job Spec

| Requirement (JD) | How Scout evidences it |
|---|---|
| 4+ yrs full-stack | Built end-to-end, solo |
| Modern JS framework (React) in production | React/Next frontend |
| Strong TypeScript front + back | TS throughout, incl. Effect |
| REST **and** GraphQL API design | Both, over one service layer |
| Relational DB (Postgres preferred) | PostgreSQL |
| Data security principles | IAM, Secret Manager, parameterised queries, README note |
| Solid production cloud | Deployed to GCP |
| Git, CI/CD, modern delivery | GitHub + Actions |
| *Desirable:* data viz (D3/Plotly) | Comparison radar (+ stretch shot map) |
| *Desirable:* GCP / willingness to transition | Deployed on GCP via Pulumi |
| *Desirable:* sports-data ecosystem | StatsBomb open data + licensing awareness |
| *Desirable:* AI coding agents | Built with Claude Code, output reviewed & tested |
