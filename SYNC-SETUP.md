# Definition Sync Setup

This document describes how to connect the warehouse repo's GitHub Actions pipeline to the Data Compass API server.

---

## How it works

```
warehouse repo                        data-compass server
──────────────                        ───────────────────
.md file merged to main
        │
        ▼
GitHub Actions detects changed files
        │
        ▼
sync_definitions.py parses .md  ──►  POST /api/definitions/:schema/:viewname
                                              │
                                              ▼
                                       data/definitions.json
```

---

## 1. Configure the data-compass server

Copy `.env.example` to `.env` and fill in a secret key of your choice:

```
WEBHOOK_API_KEY=your-secret-here
PORT=3001
```

Start the server:

```sh
# Development (with auto-reload)
npm run server:dev

# Or run frontend + API together
npm run dev:full
```

The API will be available at `http://localhost:3001`.

---

## 2. Configure the warehouse repo

Add two secrets in the warehouse repo:
**GitHub → Settings → Secrets and variables → Actions → New repository secret**

| Secret name | Value |
|---|---|
| `API_BASE_URL` | Full URL of the data-compass server, e.g. `http://localhost:3001` for local testing or `https://your-server.example.com` in production |
| `WEBHOOK_API_KEY` | The same value you set in data-compass `.env` |

---

## 3. Copy pipeline files into the warehouse repo

From `warehouse-sync/` in this repo, copy the following files to the warehouse repo:

```
warehouse-sync/
  .github/
    workflows/sync-definitions.yml   →  .github/workflows/sync-definitions.yml
    scripts/sync_definitions.py      →  .github/scripts/sync_definitions.py
  docs/
    contributing-definitions.md      →  docs/contributing-definitions.md
```

---

## 4. Test locally

With the server running (`npm run server:dev`), you can test a manual upsert:

```sh
curl -X POST http://localhost:3001/api/definitions/bus_bereken/netto_omzet \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-secret-here" \
  -d '{
    "naam": "netto_omzet",
    "beschrijving": "Test definitie",
    "eigenaar": "Finance - Jan de Vries",
    "categorie": "Financieel",
    "status": "Concept",
    "laatstBijgewerkt": "2026-03-17",
    "transformaties": []
  }'
```

Check the result in `data/definitions.json`.

---

## 5. Verify the pipeline

Push a change to any `warehouse/**/*.md` file on the `main` branch of the warehouse repo and check the **Actions** tab to confirm the workflow ran successfully.

---

## Azure DevOps migration

When moving to Azure DevOps, only the workflow file changes:

| GitHub | Azure DevOps |
|---|---|
| `.github/workflows/sync-definitions.yml` | `.azure-pipelines/sync-definitions.yml` |
| `secrets.API_BASE_URL` | Variable Group → `API_BASE_URL` |
| `secrets.WEBHOOK_API_KEY` | Variable Group → `WEBHOOK_API_KEY` |
| `on: push branches: [main]` | `trigger: branches: include: [main]` |

The server, Python script, and `.md` format require no changes.
