# Definition Sync Setup

This document describes how to connect the warehouse repo's GitHub Actions pipeline to Data Compass. No server required — the pipeline commits `definitions.json` directly into the warehouse repo, and Data Compass fetches it via a raw GitHub URL.

---

## How it works

```
warehouse repo                          Data Compass (GitHub Pages)
──────────────                          ───────────────────────────
Warehouses/<db>/<schema>/Views/*.md
        │
        ▼
GitHub Actions detects changed .md files
        │
        ▼
sync_definitions.py parses .md files
        │
        ▼
definitions.json committed back
to warehouse repo
        │
        ▼ (raw GitHub URL)
Data Compass fetches definitions.json
on page load
```

---

## 1. Copy pipeline files into the warehouse repo

From `warehouse-sync/` in this repo, copy the following files to the warehouse repo:

```
warehouse-sync/
  .github/
    workflows/sync-definitions.yml   →  .github/workflows/sync-definitions.yml
    scripts/sync_definitions.py      →  .github/scripts/sync_definitions.py
  docs/
    contributing-definitions.md      →  docs/contributing-definitions.md
```

Also create an empty `definitions.json` in the root of the warehouse repo:

```json
[]
```

Commit and push both.

---

## 2. Set VITE_DEFINITIONS_URL in Data Compass

The app needs to know where to fetch `definitions.json`. Set this as a repository variable in the **data-compass** GitHub repo:

- Go to **Settings → Secrets and variables → Actions → Variables tab**
- Create variable: `VITE_DEFINITIONS_URL`
- Value: raw GitHub URL to `definitions.json` in the warehouse repo:

```
https://raw.githubusercontent.com/<org>/<warehouse-repo>/main/definitions.json
```

The next deploy of Data Compass will pick this up automatically.

---

## 3. How .md files are structured

Each view definition lives at:

```
Warehouses/<database>/<schema>/Views/<viewname>.md
```

The file must start with a YAML frontmatter block:

```markdown
---
eigenaar: "Finance - Tom van Berg"
categorie: "Financieel"
status: "Geaccordeerd"
---

The rest of the file is the description shown in Data Compass.
```

Valid values:
- `categorie`: `Financieel`, `HR`, `Klantgegevens`, `Operations`, `IT`, `Overig`
- `status`: `Geaccordeerd`, `In review`, `Concept`

---

## 4. Trigger a sync

Push any change to a `.md` file under `Warehouses/` on the `main` branch of the warehouse repo. The workflow will:

1. Detect which files were added, modified, or deleted
2. Update `definitions.json` accordingly
3. Commit `definitions.json` back to the repo with `[skip ci]`

Check the **Actions** tab in the warehouse repo to confirm it ran successfully.

---

## 5. Verify in Data Compass

Open Data Compass — it fetches `definitions.json` fresh on every page load. New or updated definitions appear immediately.

---

## Azure DevOps migration

When moving to Azure DevOps, only the workflow file changes:

| GitHub | Azure DevOps |
|---|---|
| `.github/workflows/sync-definitions.yml` | `.azure-pipelines/sync-definitions.yml` |
| `on: push branches: [main]` | `trigger: branches: include: [main]` |
| `actions/checkout@v4` | `checkout: self` |
| `git push` | `git push` (same, using pipeline identity) |

The Python script, `.md` format, and `definitions.json` structure require no changes.
