import * as XLSX from 'xlsx';
import { DataDefinition, Category, Status, TransformationStep } from '@/types/glossary';
import { generateId } from './glossary-store';

const VALID_CATEGORIES: Category[] = ['Financieel', 'HR', 'Klantgegevens', 'Operations', 'IT', 'Overig'];
const VALID_STATUSES: Status[] = ['Geaccordeerd', 'In review', 'Concept'];

const REQUIRED_COLUMNS = ['Naam', 'Beschrijving', 'Eigenaar', 'Categorie', 'Status', 'LaatstBijgewerkt'];

export interface ParseResult {
  definitions: DataDefinition[];
  errors: string[];
  warnings: string[];
}

export function parseFile(file: File): Promise<ParseResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target!.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows: Record<string, string>[] = XLSX.utils.sheet_to_json(sheet, { defval: '' });

        if (rows.length === 0) {
          resolve({ definitions: [], errors: ['Het bestand is leeg.'], warnings: [] });
          return;
        }

        const headers = Object.keys(rows[0]);
        const errors: string[] = [];
        const warnings: string[] = [];

        for (const col of REQUIRED_COLUMNS) {
          if (!headers.some((h) => h.trim().toLowerCase() === col.toLowerCase())) {
            errors.push(`Ontbrekende kolom: "${col}"`);
          }
        }

        if (errors.length > 0) {
          resolve({ definitions: [], errors, warnings });
          return;
        }

        const definitions: DataDefinition[] = [];

        for (let i = 0; i < rows.length; i++) {
          const row = normalizeKeys(rows[i]);
          const naam = row['naam']?.trim();
          if (!naam) {
            warnings.push(`Rij ${i + 2}: Naam is leeg, overgeslagen.`);
            continue;
          }

          const categorie = matchCategory(row['categorie']?.trim());
          if (!categorie) {
            warnings.push(`Rij ${i + 2}: Onbekende categorie "${row['categorie']}", standaard "Overig" gebruikt.`);
          }

          const status = matchStatus(row['status']?.trim());

          // Parse transformation steps
          const transformaties: TransformationStep[] = [];
          let stepIdx = 1;
          while (row[`bronapplicatie_${stepIdx}`] || row[`stap_${stepIdx}_bron`]) {
            const bron = row[`bronapplicatie_${stepIdx}`] || row[`stap_${stepIdx}_bron`] || '';
            const beschrijving = row[`transformatie_${stepIdx}`] || row[`stap_${stepIdx}_beschrijving`] || '';
            if (bron || beschrijving) {
              transformaties.push({ bronapplicatie: bron, stapnummer: stepIdx, beschrijving });
            }
            stepIdx++;
          }

          definitions.push({
            id: generateId(),
            naam,
            beschrijving: row['beschrijving'] || '',
            eigenaar: row['eigenaar'] || '',
            categorie: categorie || 'Overig',
            status: status || 'Concept',
            laatstBijgewerkt: row['laatstbijgewerkt'] || new Date().toISOString().split('T')[0],
            transformaties,
          });
        }

        resolve({ definitions, errors, warnings });
      } catch (err) {
        reject(new Error('Kon het bestand niet verwerken. Controleer het formaat.'));
      }
    };
    reader.onerror = () => reject(new Error('Fout bij het lezen van het bestand.'));
    reader.readAsArrayBuffer(file);
  });
}

function normalizeKeys(row: Record<string, string>): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(row)) {
    result[key.trim().toLowerCase().replace(/\s+/g, '')] = value;
  }
  return result;
}

function matchCategory(value: string | undefined): Category | null {
  if (!value) return null;
  return VALID_CATEGORIES.find((c) => c.toLowerCase() === value.toLowerCase()) || null;
}

function matchStatus(value: string | undefined): Status | null {
  if (!value) return null;
  return VALID_STATUSES.find((s) => s.toLowerCase() === value.toLowerCase()) || null;
}

export function generateTemplate(): void {
  const headers = [
    'Naam', 'Beschrijving', 'Eigenaar', 'Categorie', 'Status', 'LaatstBijgewerkt',
    'Bronapplicatie_1', 'Transformatie_1',
    'Bronapplicatie_2', 'Transformatie_2',
    'Bronapplicatie_3', 'Transformatie_3',
  ];
  const example = [
    'Omzet', 'Totale inkomsten uit verkoop', 'Finance - Jan', 'Financieel', 'Geaccordeerd', '2025-12-15',
    'Exact Online', 'Factuurregels ophalen',
    'Data Warehouse', 'Aggregatie per maand',
    'Power BI', 'Weergave met vergelijking',
  ];
  const ws = XLSX.utils.aoa_to_sheet([headers, example]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Template');
  XLSX.writeFile(wb, 'data-glossary-template.xlsx');
}
