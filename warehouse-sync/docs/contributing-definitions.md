# Contributing SQL View Definitions

This guide explains how to document a warehouse view so its technical definition
is automatically published to Data Compass when your change is merged to `main`.

---

## Repo layout

```
warehouse/
  <schema>/
    Views/
      <viewname>.sql   ← SQL definition of the view
      <viewname>.md    ← Technical definition (you write this)
```

**Example:**
```
warehouse/bus_bereken/Views/netto_omzet.sql
warehouse/bus_bereken/Views/netto_omzet.md
```

---

## .md file format

Every `.md` file must start with a YAML frontmatter block followed by the
technical definition in plain text.

```markdown
---
eigenaar: "Finance - Jan de Vries"
categorie: "Financieel"
status: "Concept"
---
Berekend nettobedrag na aftrek van kortingen en BTW, per maand en entiteit.

Gebaseerd op factuurregels uit Exact Online, grootboekrekeningen 8000-8999.
Creditnota's worden uitgesloten. Vergelijking met vorig jaar wordt berekend
in de rapportagelaag (Power BI).
```

### Frontmatter fields

| Veld       | Verplicht | Geldige waarden                                                    |
|------------|-----------|--------------------------------------------------------------------|
| `eigenaar` | Ja        | Vrije tekst, bijv. `"Finance - Jan de Vries"`                      |
| `categorie`| Ja        | `Financieel` · `HR` · `Klantgegevens` · `Operations` · `IT` · `Overig` |
| `status`   | Ja        | `Concept` · `In review` · `Geaccordeerd`                           |

### Body

Everything after the closing `---` is the technical definition
(`beschrijving` in Data Compass). Write it in plain markdown — headings,
bullet points, and tables are all rendered in the webapp.

---

## Contributor workflow

```
1. Create or edit  warehouse/<schema>/Views/<viewname>.md
2. Edit the paired  warehouse/<schema>/Views/<viewname>.sql  (if needed)
3. Commit and push to a feature branch
4. Open a Pull Request to main
5. After the PR is merged → the pipeline runs automatically
```

The GitHub Actions workflow (`.github/workflows/sync-definitions.yml`) will:
- Detect which `.md` files changed in the merge commit
- Parse the YAML frontmatter and body from each file
- Read the paired `.sql` file (if present)
- POST the definition to the Data Compass API

You can follow the sync in the **Actions** tab of the repository.

---

## Removing a definition

Deleting a `.md` file and merging to `main` triggers a **soft-delete**:
the definition remains visible in Data Compass but its status is downgraded
to `Concept` and it is flagged as removed. This preserves audit history.

---

## Setting up the pipeline (one-time, maintainer task)

Add these two secrets in the GitHub repository settings
(**Settings → Secrets and variables → Actions**):

| Secret name       | Value                                              |
|-------------------|----------------------------------------------------|
| `API_BASE_URL`    | Base URL of the Data Compass server, e.g. `https://data-compass.example.com` |
| `WEBHOOK_API_KEY` | Matches the `WEBHOOK_API_KEY` env var on the server |

---

## Azure DevOps migration

When the pipeline moves to Azure DevOps, only the workflow file changes.
The `.md` format, Python script, and Express API are all pipeline-agnostic.

| GitHub | Azure DevOps |
|---|---|
| `.github/workflows/sync-definitions.yml` | `.azure-pipelines/sync-definitions.yml` |
| `secrets.API_BASE_URL` | Variable Group → `API_BASE_URL` |
| `secrets.WEBHOOK_API_KEY` | Variable Group → `WEBHOOK_API_KEY` |
| `on: push → branches: [main]` | `trigger: branches: include: [main]` |
