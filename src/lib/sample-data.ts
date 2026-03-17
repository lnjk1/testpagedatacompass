import { DataDefinition } from '@/types/glossary';

export const sampleDefinitions: DataDefinition[] = [
  {
    id: '1',
    naam: 'Productie-output',
    beschrijving: 'Het totale aantal geproduceerde eenheden in een periode, gecorrigeerd voor uitval en herbewerking.',
    eigenaar: 'Finance - Tom van Berg',
    categorie: 'Financieel',
    status: 'Geaccordeerd',
    laatstBijgewerkt: '2025-12-15',
    transformaties: [
      { bronapplicatie: 'SystemX', stapnummer: 1, beschrijving: 'Productieorders ophalen uit productiemodule' },
      { bronapplicatie: 'DataBridge', stapnummer: 2, beschrijving: 'Aggregatie per week en productlijn, uitsluiten afgekeurde batches' },
      { bronapplicatie: 'InsightBoard', stapnummer: 3, beschrijving: 'Output weergeven met vergelijking vorige periode' },
    ],
  },
  {
    id: '2',
    naam: 'Medewerkersbestand (VTE)',
    beschrijving: 'Voltijdsequivalent: het aantal voltijdse arbeidsplaatsen, berekend op basis van contracturen per medewerker.',
    eigenaar: 'HR - Sophie Dekker',
    categorie: 'HR',
    status: 'Geaccordeerd',
    laatstBijgewerkt: '2025-11-20',
    transformaties: [
      { bronapplicatie: 'PlannerPro', stapnummer: 1, beschrijving: 'Contracturen per medewerker ophalen' },
      { bronapplicatie: 'DataBridge', stapnummer: 2, beschrijving: 'Delen door 38 (standaard werkweek) per peildatum' },
      { bronapplicatie: 'InsightBoard', stapnummer: 3, beschrijving: 'Weergave als KPI met trend per kwartaal' },
    ],
  },
  {
    id: '3',
    naam: 'Klanttevredenheid (CSI)',
    beschrijving: 'Customer Satisfaction Index: gewogen gemiddelde van klanttevredenheidsscores op een schaal van 0 tot 10.',
    eigenaar: 'Sales - Rick Vermeer',
    categorie: 'Klantgegevens',
    status: 'In review',
    laatstBijgewerkt: '2026-01-10',
    transformaties: [
      { bronapplicatie: 'SurveyTool', stapnummer: 1, beschrijving: 'Enquêteresultaten ophalen via API-koppeling' },
      { bronapplicatie: 'DataBridge', stapnummer: 2, beschrijving: 'Categoriseren in tevreden (8-10), neutraal (6-7), ontevreden (0-5)' },
      { bronapplicatie: 'DataBridge', stapnummer: 3, beschrijving: 'CSI = gewogen gemiddelde per klantsegment' },
      { bronapplicatie: 'InsightBoard', stapnummer: 4, beschrijving: 'Trendlijn per kwartaal met sectorgemiddelde' },
    ],
  },
  {
    id: '7',
    naam: 'Winstgevendheid per project',
    beschrijving: 'Nettomarge per project, berekend uit opbrengsten, directe kosten en tijdsbesteding van medewerkers.',
    eigenaar: 'Finance - Tom van Berg',
    categorie: 'Financieel',
    status: 'In review',
    laatstBijgewerkt: '2026-02-10',
    transformaties: [],
    lineageBranches: [
      {
        bronNaam: 'SystemX',
        stappen: [
          { bronapplicatie: 'SystemX', stapnummer: 1, beschrijving: 'Opbrengsten per project ophalen uit facturatiemodule' },
          { bronapplicatie: 'SystemX', stapnummer: 2, beschrijving: 'Inkoopkosten koppelen aan projecten' },
        ],
      },
      {
        bronNaam: 'TimeTrack',
        stappen: [
          { bronapplicatie: 'TimeTrack', stapnummer: 1, beschrijving: 'Bestede uren per project ophalen' },
          { bronapplicatie: 'TimeTrack', stapnummer: 2, beschrijving: 'Vermenigvuldigen met intern kostentarief' },
        ],
      },
      {
        bronNaam: 'PlannerPro',
        stappen: [
          { bronapplicatie: 'PlannerPro', stapnummer: 1, beschrijving: 'Projectgegevens en contracttype ophalen' },
        ],
      },
    ],
    mergeStappen: [
      { bronapplicatie: 'DataBridge', stapnummer: 3, beschrijving: 'Nettomarge = opbrengsten - kosten - tijdsbesteding per project' },
      { bronapplicatie: 'InsightBoard', stapnummer: 4, beschrijving: 'Ranking en trendanalyse per projecttype' },
    ],
  },
  {
    id: '4',
    naam: 'Verzuimratio',
    beschrijving: 'Het percentage van de totale beschikbare werkdagen dat verloren gaat door verzuim van medewerkers.',
    eigenaar: 'HR - Sophie Dekker',
    categorie: 'HR',
    status: 'Geaccordeerd',
    laatstBijgewerkt: '2025-10-05',
    transformaties: [
      { bronapplicatie: 'PlannerPro', stapnummer: 1, beschrijving: 'Verzuimmeldingen en herstelmeldingen ophalen' },
      { bronapplicatie: 'DataBridge', stapnummer: 2, beschrijving: 'Verzuimdagen / beschikbare werkdagen × 100%' },
      { bronapplicatie: 'InsightBoard', stapnummer: 3, beschrijving: 'Maandelijks percentage met drempelwaarde (3,5%)' },
    ],
  },
  {
    id: '5',
    naam: 'Openstaande posten',
    beschrijving: 'Overzicht van uitstaande vorderingen, gecategoriseerd naar looptijd (0-30, 30-60, 60-90, 90+ dagen).',
    eigenaar: 'Finance - Tom van Berg',
    categorie: 'Financieel',
    status: 'Concept',
    laatstBijgewerkt: '2026-02-01',
    transformaties: [
      { bronapplicatie: 'SystemX', stapnummer: 1, beschrijving: 'Openstaande facturen ophalen met vervaldatum' },
      { bronapplicatie: 'DataBridge', stapnummer: 2, beschrijving: 'Looptijdcategorie berekenen op basis van peildatum minus vervaldatum' },
      { bronapplicatie: 'InsightBoard', stapnummer: 3, beschrijving: 'Gestapelde staafgrafiek per looptijdcategorie' },
    ],
  },
  {
    id: '6',
    naam: 'Capaciteitsbenutting',
    beschrijving: 'Het percentage van de beschikbare capaciteit dat daadwerkelijk benut wordt voor factureerbare werkzaamheden.',
    eigenaar: 'Operations - Anna Prins',
    categorie: 'Operations',
    status: 'Geaccordeerd',
    laatstBijgewerkt: '2025-09-30',
    transformaties: [],
    lineageBranches: [
      {
        bronNaam: 'PlannerPro',
        stappen: [
          { bronapplicatie: 'PlannerPro', stapnummer: 1, beschrijving: 'Beschikbare uren per medewerker ophalen' },
          { bronapplicatie: 'PlannerPro', stapnummer: 2, beschrijving: 'Corrigeren voor deeltijd en verlof' },
        ],
      },
      {
        bronNaam: 'TimeTrack',
        stappen: [
          { bronapplicatie: 'TimeTrack', stapnummer: 1, beschrijving: 'Factureerbare uren per medewerker ophalen' },
          { bronapplicatie: 'TimeTrack', stapnummer: 2, beschrijving: 'Filteren op goedgekeurde en gefactureerde uren' },
        ],
      },
    ],
    mergeStappen: [
      { bronapplicatie: 'DataBridge', stapnummer: 3, beschrijving: 'Capaciteitsbenutting = factureerbare uren / beschikbare uren × 100%' },
      { bronapplicatie: 'InsightBoard', stapnummer: 4, beschrijving: 'Per afdeling en individueel met streefwaarde (80%)' },
    ],
  },
];
