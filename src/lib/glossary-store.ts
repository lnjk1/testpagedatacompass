import { DataDefinition } from '@/types/glossary';

const STORAGE_KEY = 'data-glossary-definitions';

export function getDefinitions(): DataDefinition[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveDefinitions(definitions: DataDefinition[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(definitions));
}

export function getDefinitionById(id: string): DataDefinition | undefined {
  return getDefinitions().find((d) => d.id === id);
}

export function importDefinitions(newDefs: DataDefinition[]): { added: number; updated: number } {
  const existing = getDefinitions();
  const existingMap = new Map(existing.map((d) => [d.naam.toLowerCase(), d]));
  let added = 0;
  let updated = 0;

  for (const def of newDefs) {
    const key = def.naam.toLowerCase();
    if (existingMap.has(key)) {
      existingMap.set(key, { ...existingMap.get(key)!, ...def, id: existingMap.get(key)!.id });
      updated++;
    } else {
      existingMap.set(key, def);
      added++;
    }
  }

  saveDefinitions(Array.from(existingMap.values()));
  return { added, updated };
}

export function generateId(): string {
  return crypto.randomUUID();
}
