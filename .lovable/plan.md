
# Parallelle bronnen in Data Lineage

## Wat verandert er
Datapunten die uit meerdere bronapplicaties komen (bijv. Bezettingsgraad: AFAS + TimeChimp) worden visueel weergegeven als parallelle branches die samenkomen bij een merge-punt, in plaats van een misleidende lineaire keten.

## Aanpassingen per bestand

### 1. `src/types/glossary.ts` -- Datamodel uitbreiden
- Nieuw interface `LineageBranch` met `bronNaam: string` en `stappen: TransformationStep[]`
- Optionele velden toevoegen aan `DataDefinition`:
  - `lineageBranches?: LineageBranch[]` -- parallelle bronstromen
  - `mergeStappen?: TransformationStep[]` -- stappen na het samenvoegpunt
- Bestaand veld `transformaties` blijft werken voor lineaire flows (backwards compatible)

### 2. `src/components/LineageFlow.tsx` -- Visualisatie uitbreiden
- Component accepteert nu ook optionele `branches` en `mergeStappen` props
- Detectie: als `branches` aanwezig is, toon parallelle weergave; anders bestaande lineaire flow
- Parallelle weergave layout:
  - Branches worden verticaal gestapeld, elk als een horizontale reeks stappen
  - CSS-borders tekenen verbindingslijnen van elke branch naar een centraal merge-punt
  - Na het merge-punt gaan de `mergeStappen` lineair verder (hergebruik bestaande step-cards)
  - Elke branch krijgt een eigen kleuraccent uit het bestaande `STEP_COLORS` palet
  - Branch-labels (bronNaam) als kopje boven elke rij

### 3. `src/lib/sample-data.ts` -- Voorbeelddata aanpassen
- "Bezettingsgraad" (id 6) omzetten naar branches:
  - Branch A (AFAS): 2 stappen -- "Beschikbare uren ophalen" -> "Corrigeren voor parttime"
  - Branch B (TimeChimp): 2 stappen -- "Declarabele uren ophalen" -> "Filteren op facturabel"
  - Merge-stappen: Data Warehouse (berekening) -> Power BI (weergave)

### 4. `src/pages/DefinitionDetail.tsx` -- Props doorgeven
- `LineageFlow` aanroep uitbreiden met `branches` en `mergeStappen` van de definitie

### 5. `src/lib/csv-parser.ts` -- CSV-parsing uitbreiden
- Herkennen van `Branch` kolom in CSV (waarden: "A", "B", "C", ... of "Merge")
- Branch-rijen groeperen per branch-letter, merge-rijen apart
- `generateTemplate()` bijwerken met branch-voorbeeld en extra uitleg-rij

## Visueel resultaat

```text
Lineair (bestaand, ongewijzigd):
  [Stap 1] --> [Stap 2] --> [Stap 3]

Parallel (nieuw):
  Branch "AFAS":
    [AFAS: Uren ophalen] --> [AFAS: Corrigeren]  ──╮
                                                    ├──> [DWH: Berekening] --> [Power BI]
  Branch "TimeChimp":                               │
    [TimeChimp: Ophalen] --> [TimeChimp: Filter] ──╯
```

## Technische details
- Geen nieuwe dependencies nodig
- Verbindingslijnen via CSS pseudo-elements en borders (geen SVG/canvas)
- Volledig backwards compatible: definities zonder `lineageBranches` tonen de bestaande lineaire flow
