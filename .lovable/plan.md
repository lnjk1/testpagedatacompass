

# Data Glossary Webapp — Accountantskantoor

## Overzicht
Een moderne, kleurrijke webapp waar eindgebruikers data definities kunnen raadplegen. Definities worden beheerd via CSV/Excel upload en zijn zonder login toegankelijk.

---

## Pagina's & Functionaliteit

### 1. Homepage / Overzichtspagina
- Zoekbalk bovenaan om snel definities te vinden op naam of beschrijving
- Filtermogelijkheden op categorie/domein (bijv. "Financieel", "HR", "Klantgegevens")
- Overzicht van alle definities in een kaart- of tabelweergave
- Statistieken: totaal aantal definities, laatst bijgewerkt

### 2. Definitie-detailpagina
Per datapunt wordt getoond:
- **Naam** van het datapunt
- **Beschrijving / Definitie** — de geaccordeerde betekenis
- **Eigenaar** — verantwoordelijke persoon of afdeling
- **Status** — bijv. "Geaccordeerd", "In review"
- **Laatst bijgewerkt** — datum van laatste wijziging
- **Categorie/Domein** — classificatie van het datapunt
- **Data Lineage / Transformatiestappen** — gestructureerde stapsgewijze weergave per bronapplicatie:
  - Bronapplicatie → Transformatie(s) → Eindresultaat in rapportage
  - Visueel weergegeven als een flow/pipeline (stappen met pijlen)

### 3. CSV/Excel Upload (Admin)
- Uploadpagina waar een CSV of Excel-bestand geüpload kan worden
- Validatie van het bestand (verwachte kolommen, formaat)
- Preview van de data vóór importeren
- Bestaande definities worden bijgewerkt, nieuwe toegevoegd
- Template/voorbeeld CSV beschikbaar om te downloaden

---

## Design & UX
- **Modern en kleurrijk** design met visuele accenten en kleurcategorieën
- Responsief voor desktop en tablet gebruik
- Duidelijke typografie en witruimte
- Kleurcodering per categorie/domein
- De lineage-stappen visueel als een horizontale flow met iconen per bronapplicatie

---

## Data-opslag
- Definities worden lokaal opgeslagen in de browser (localStorage) na CSV-upload
- Geen backend/database nodig in eerste instantie — alles client-side
- Later eventueel uitbreidbaar naar een database (Supabase) als dat gewenst is

---

## CSV-structuur (verwacht formaat)
Het bestand bevat kolommen zoals:
- Naam, Beschrijving, Eigenaar, Categorie, Status, Laatst bijgewerkt
- Per transformatiestap: Bronapplicatie, Stapnummer, Beschrijving van de transformatie

