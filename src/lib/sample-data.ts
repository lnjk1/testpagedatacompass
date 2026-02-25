import { DataDefinition } from '@/types/glossary';

export const sampleDefinitions: DataDefinition[] = [
  {
    id: '1',
    naam: 'Omzet',
    beschrijving: 'Het totale bedrag aan inkomsten uit de verkoop van goederen en diensten, exclusief BTW en kortingen.',
    eigenaar: 'Finance - Jan de Vries',
    categorie: 'Financieel',
    status: 'Geaccordeerd',
    laatstBijgewerkt: '2025-12-15',
    transformaties: [
      { bronapplicatie: 'Exact Online', stapnummer: 1, beschrijving: 'Factuurregels ophalen uit grootboekrekeningen 8000-8999' },
      { bronapplicatie: 'Data Warehouse', stapnummer: 2, beschrijving: 'Aggregatie per maand en entiteit, uitsluiten creditnota\'s' },
      { bronapplicatie: 'Power BI', stapnummer: 3, beschrijving: 'Omzetcijfer weergeven met vergelijking vorig jaar' },
    ],
  },
  {
    id: '2',
    naam: 'FTE',
    beschrijving: 'Full-time equivalent: het aantal fulltime-arbeidsplaatsen, berekend op basis van contracturen.',
    eigenaar: 'HR - Lisa Bakker',
    categorie: 'HR',
    status: 'Geaccordeerd',
    laatstBijgewerkt: '2025-11-20',
    transformaties: [
      { bronapplicatie: 'AFAS', stapnummer: 1, beschrijving: 'Contracturen per medewerker ophalen' },
      { bronapplicatie: 'Data Warehouse', stapnummer: 2, beschrijving: 'Delen door 40 (standaard werkweek) per peildatum' },
      { bronapplicatie: 'Power BI', stapnummer: 3, beschrijving: 'Weergave als KPI met trend per kwartaal' },
    ],
  },
  {
    id: '3',
    naam: 'Klanttevredenheid (NPS)',
    beschrijving: 'Net Promoter Score: maatstaf voor klanttevredenheid op een schaal van -100 tot +100.',
    eigenaar: 'Sales - Mark Jansen',
    categorie: 'Klantgegevens',
    status: 'In review',
    laatstBijgewerkt: '2026-01-10',
    transformaties: [
      { bronapplicatie: 'SurveyMonkey', stapnummer: 1, beschrijving: 'Enquêteresultaten ophalen via API' },
      { bronapplicatie: 'Data Warehouse', stapnummer: 2, beschrijving: 'Categoriseren in promoters (9-10), passives (7-8), detractors (0-6)' },
      { bronapplicatie: 'Data Warehouse', stapnummer: 3, beschrijving: 'NPS = %promoters - %detractors' },
      { bronapplicatie: 'Power BI', stapnummer: 4, beschrijving: 'Trendlijn per kwartaal met benchmark' },
    ],
  },
  {
    id: '7',
    naam: 'Winstgevendheid per klant',
    beschrijving: 'Nettomarge per klant, berekend uit omzet, directe kosten en tijdsbesteding.',
    eigenaar: 'Finance - Jan de Vries',
    categorie: 'Financieel',
    status: 'In review',
    laatstBijgewerkt: '2026-02-10',
    transformaties: [],
    lineageBranches: [
      {
        bronNaam: 'Exact Online',
        stappen: [
          { bronapplicatie: 'Exact Online', stapnummer: 1, beschrijving: 'Omzet per klant ophalen uit facturen' },
          { bronapplicatie: 'Exact Online', stapnummer: 2, beschrijving: 'Inkoopkosten koppelen aan klantprojecten' },
        ],
      },
      {
        bronNaam: 'TimeChimp',
        stappen: [
          { bronapplicatie: 'TimeChimp', stapnummer: 1, beschrijving: 'Bestede uren per klant ophalen' },
          { bronapplicatie: 'TimeChimp', stapnummer: 2, beschrijving: 'Vermenigvuldigen met intern uurtarief' },
        ],
      },
      {
        bronNaam: 'Salesforce',
        stappen: [
          { bronapplicatie: 'Salesforce', stapnummer: 1, beschrijving: 'Klantgegevens en contracttype ophalen' },
        ],
      },
    ],
    mergeStappen: [
      { bronapplicatie: 'Data Warehouse', stapnummer: 3, beschrijving: 'Nettomarge = omzet - kosten - tijdsbesteding per klant' },
      { bronapplicatie: 'Power BI', stapnummer: 4, beschrijving: 'Ranking en trendanalyse per klantsegment' },
    ],
  },
  {
    id: '4',
    naam: 'Ziekteverzuimpercentage',
    beschrijving: 'Het percentage van de totale beschikbare werkdagen dat verloren gaat door ziekte.',
    eigenaar: 'HR - Lisa Bakker',
    categorie: 'HR',
    status: 'Geaccordeerd',
    laatstBijgewerkt: '2025-10-05',
    transformaties: [
      { bronapplicatie: 'AFAS', stapnummer: 1, beschrijving: 'Ziekmeldingen en herstelmeldingen ophalen' },
      { bronapplicatie: 'Data Warehouse', stapnummer: 2, beschrijving: 'Ziektedagen / beschikbare werkdagen × 100%' },
      { bronapplicatie: 'Power BI', stapnummer: 3, beschrijving: 'Maandelijks percentage met drempelwaarde (4%)' },
    ],
  },
  {
    id: '5',
    naam: 'Debiteuren ouderdom',
    beschrijving: 'Overzicht van openstaande vorderingen, gecategoriseerd naar ouderdom (0-30, 30-60, 60-90, 90+ dagen).',
    eigenaar: 'Finance - Jan de Vries',
    categorie: 'Financieel',
    status: 'Concept',
    laatstBijgewerkt: '2026-02-01',
    transformaties: [
      { bronapplicatie: 'Exact Online', stapnummer: 1, beschrijving: 'Openstaande facturen ophalen met vervaldatum' },
      { bronapplicatie: 'Data Warehouse', stapnummer: 2, beschrijving: 'Ouderdomscategorie berekenen o.b.v. verschil peildatum - vervaldatum' },
      { bronapplicatie: 'Power BI', stapnummer: 3, beschrijving: 'Gestapelde staafgrafiek per ouderdomscategorie' },
    ],
  },
  {
    id: '6',
    naam: 'Bezettingsgraad',
    beschrijving: 'Het percentage van de beschikbare capaciteit dat daadwerkelijk benut wordt voor declarabele werkzaamheden.',
    eigenaar: 'Operations - Petra Smit',
    categorie: 'Operations',
    status: 'Geaccordeerd',
    laatstBijgewerkt: '2025-09-30',
    transformaties: [],
    lineageBranches: [
      {
        bronNaam: 'AFAS',
        stappen: [
          { bronapplicatie: 'AFAS', stapnummer: 1, beschrijving: 'Beschikbare uren per medewerker ophalen' },
          { bronapplicatie: 'AFAS', stapnummer: 2, beschrijving: 'Corrigeren voor parttime en verlof' },
        ],
      },
      {
        bronNaam: 'TimeChimp',
        stappen: [
          { bronapplicatie: 'TimeChimp', stapnummer: 1, beschrijving: 'Declarabele uren per medewerker ophalen' },
          { bronapplicatie: 'TimeChimp', stapnummer: 2, beschrijving: 'Filteren op facturabel en goedgekeurd' },
        ],
      },
    ],
    mergeStappen: [
      { bronapplicatie: 'Data Warehouse', stapnummer: 3, beschrijving: 'Bezettingsgraad = declarabele uren / beschikbare uren × 100%' },
      { bronapplicatie: 'Power BI', stapnummer: 4, beschrijving: 'Per team en individueel met target (75%)' },
    ],
  },
];
