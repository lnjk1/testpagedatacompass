# Definition Sync Setup

The warehouse definitions live in this repo alongside the web app. The sync pipeline automatically generates `public/definitions.json` whenever `.md` files under `Warehouses/` are changed.

---

## How it works

```
data-compass-1 (this repo)
──────────────────────────
Warehouses/<db>/<schema>/Views/*.md
        │
        ▼
GitHub Actions detects changed .md files
(.github/workflows/sync-definitions.yml)
        │
        ▼
sync_definitions.py parses .md files
(.github/scripts/sync_definitions.py)
        │
        ▼
public/definitions.json committed back
        │
        ▼ (triggers deploy.yml)
Vite builds app (copies public/ into dist/)
        │
        ▼
GitHub Pages serves updated definitions
```

---

## How .md files are structured

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

An optional paired `.sql` file with the same name can be placed in the same directory — its content will be shown in the SQL tab.

Valid values:
- `categorie`: `Financieel`, `HR`, `Klantgegevens`, `Operations`, `IT`, `Overig`
- `status`: `Geaccordeerd`, `In review`, `Concept`

---

## Triggering a sync

Push any change to a `.md` file under `Warehouses/` on the `main` branch. The workflow will:

1. Detect which files were added, modified, or deleted
2. Update `public/definitions.json` accordingly
3. Commit `public/definitions.json` back (this triggers a redeploy automatically)

Check the **Actions** tab to confirm both the sync and deploy workflows ran successfully.

---

## Verify in Data Compass

Open Data Compass — it fetches `definitions.json` fresh on every page load from `<base>/definitions.json`. New or updated definitions appear immediately after the deploy completes.

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
