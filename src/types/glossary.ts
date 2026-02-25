export type Category = 'Financieel' | 'HR' | 'Klantgegevens' | 'Operations' | 'IT' | 'Overig';

export type Status = 'Geaccordeerd' | 'In review' | 'Concept';

export interface TransformationStep {
  bronapplicatie: string;
  stapnummer: number;
  beschrijving: string;
}

export interface LineageBranch {
  bronNaam: string;
  stappen: TransformationStep[];
}

export interface DataDefinition {
  id: string;
  naam: string;
  beschrijving: string;
  eigenaar: string;
  categorie: Category;
  status: Status;
  laatstBijgewerkt: string;
  transformaties: TransformationStep[];
  lineageBranches?: LineageBranch[];
  mergeStappen?: TransformationStep[];
}

export const CATEGORIES: Category[] = ['Financieel', 'HR', 'Klantgegevens', 'Operations', 'IT', 'Overig'];

export const CATEGORY_COLORS: Record<Category, string> = {
  Financieel: 'bg-primary text-primary-foreground',
  HR: 'bg-accent text-accent-foreground',
  Klantgegevens: 'bg-secondary text-secondary-foreground',
  Operations: 'bg-orange-500 text-white',
  IT: 'bg-purple-500 text-white',
  Overig: 'bg-muted-foreground text-white',
};

export const STATUS_COLORS: Record<Status, string> = {
  Geaccordeerd: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  'In review': 'bg-amber-100 text-amber-700 border-amber-200',
  Concept: 'bg-slate-100 text-slate-600 border-slate-200',
};
