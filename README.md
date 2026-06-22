# Scout

A full-stack football scouting and player-comparison tool built as a portfolio artifact for Tottenham Hotspur's Football Insights / Football Systems team.

Ingests StatsBomb open event data for the **Premier League 2015/16 season**, aggregates per-90 player metrics, and exposes them through a clean UI designed for non-technical analysts.

---

## What it does

- **Player browser** — filter by position, team, and minimum minutes; sort by any metric (xG, xA, progressive passes, tackles, etc.)
- **Player comparison** — pick two players, view a D3 radar chart and side-by-side stat table; a Plotly scatter chart plots metric pairs (e.g. xG vs goals)
- **REST + GraphQL API** — both transports share one service layer and return identical data

---

## Stack

| Layer | Choice |
|---|---|
| Language | TypeScript end-to-end |
| Frontend | Vite + React, StyleX, Base UI, D3, Plotly |
| Backend | Hono + GraphQL Yoga + Pothos |
| Business logic | Effect (typed, composable, testable aggregation) |
| Database | PostgreSQL (Cloud SQL) |
| Infra | Pulumi → GCP (Cloud Run, Cloud SQL, Firebase Hosting, Secret Manager) |
| CI/CD | GitHub Actions |
| Tests | Vitest (unit aggregation + integration REST/GraphQL) |

---

## Data

StatsBomb Open Data — Premier League 2015/16 (380 matches, ~950k events).

> Data provided by [StatsBomb](https://statsbomb.com) under the [StatsBomb Open Data licence](https://github.com/statsbomb/open-data/blob/master/LICENSE.pdf). Free for public/research/non-commercial use with attribution.

---

## Local setup

_Coming soon — full instructions will be added once the stack is wired up._

---

## Built with

[Claude Code](https://claude.ai/code) — all generated output reviewed and tested.
