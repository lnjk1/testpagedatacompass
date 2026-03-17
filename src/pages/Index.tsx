import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, BookOpen, Upload, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CategoryBadge } from '@/components/CategoryBadge';
import { StatusBadge } from '@/components/StatusBadge';
import { DataDefinition, CATEGORIES, Category } from '@/types/glossary';
import { getDefinitions, saveDefinitions } from '@/lib/glossary-store';
import { sampleDefinitions } from '@/lib/sample-data';

const DEFINITIONS_URL = import.meta.env.VITE_DEFINITIONS_URL as string | undefined;

const Index = () => {
  const [definitions, setDefinitions] = useState<DataDefinition[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<Category[]>([]);

  useEffect(() => {
    if (DEFINITIONS_URL) {
      fetch(DEFINITIONS_URL)
        .then((res) => res.json())
        .then((data: DataDefinition[]) => setDefinitions(data))
        .catch(() => setDefinitions([]));
      return;
    }
    // Local fallback: localStorage with sample data seeding
    let defs = getDefinitions();
    const needsReseed = defs.length === 0 || defs.length < sampleDefinitions.length;
    if (needsReseed) {
      saveDefinitions(sampleDefinitions);
      defs = sampleDefinitions;
    }
    setDefinitions(defs);
  }, []);

  const toggleCategory = (cat: Category) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const filtered = useMemo(() => {
    return definitions.filter((d) => {
      const matchesSearch =
        !search ||
        d.naam.toLowerCase().includes(search.toLowerCase()) ||
        d.beschrijving.toLowerCase().includes(search.toLowerCase()) ||
        d.eigenaar.toLowerCase().includes(search.toLowerCase());
      const matchesCategory =
        selectedCategories.length === 0 || selectedCategories.includes(d.categorie);
      return matchesSearch && matchesCategory;
    });
  }, [definitions, search, selectedCategories]);

  const stats = useMemo(() => {
    const categoryCounts = CATEGORIES.reduce((acc, cat) => {
      acc[cat] = definitions.filter((d) => d.categorie === cat).length;
      return acc;
    }, {} as Record<string, number>);

    const latestUpdate = definitions.length
      ? definitions.reduce((latest, d) => (d.laatstBijgewerkt > latest ? d.laatstBijgewerkt : latest), '1970-01-01')
      : null;

    return { total: definitions.length, categoryCounts, latestUpdate };
  }, [definitions]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
              <BookOpen className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Data Glossary</h1>
              <p className="text-xs text-muted-foreground">Definities & data lineage</p>
            </div>
          </div>
          <Link to="/upload">
            <Button variant="outline" size="sm" className="gap-2">
              <Upload className="h-4 w-4" />
              CSV Upload
            </Button>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Stats */}
        <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <CardContent className="p-4">
              <p className="text-2xl font-bold text-primary">{stats.total}</p>
              <p className="text-xs text-muted-foreground">Totaal definities</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-secondary/10 to-secondary/5 border-secondary/20">
            <CardContent className="p-4">
              <p className="text-2xl font-bold text-secondary">{definitions.filter(d => d.status === 'Geaccordeerd').length}</p>
              <p className="text-xs text-muted-foreground">Geaccordeerd</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
            <CardContent className="p-4">
              <p className="text-2xl font-bold text-accent">{definitions.filter(d => d.status === 'In review').length}</p>
              <p className="text-xs text-muted-foreground">In review</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm font-semibold text-foreground">
                {stats.latestUpdate ? new Date(stats.latestUpdate).toLocaleDateString('nl-NL') : '-'}
              </p>
              <p className="text-xs text-muted-foreground">Laatst bijgewerkt</p>
            </CardContent>
          </Card>
        </div>

        {/* Search & Filters */}
        <div className="mb-6 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Zoek op naam, beschrijving of eigenaar..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-12 text-base"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => toggleCategory(cat)}
                className={`rounded-full border px-3 py-1 text-xs font-medium transition-all ${
                  selectedCategories.includes(cat)
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-card text-muted-foreground border-border hover:border-primary/50'
                }`}
              >
                {cat} ({stats.categoryCounts[cat] || 0})
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        <div className="grid gap-3">
          {filtered.length === 0 && (
            <div className="py-12 text-center text-muted-foreground">
              <BookOpen className="mx-auto mb-3 h-8 w-8 opacity-40" />
              <p>Geen definities gevonden.</p>
            </div>
          )}
          {filtered.map((def) => (
            <Link key={def.id} to={`/definitie/${def.id}`}>
              <Card className="transition-all hover:shadow-md hover:border-primary/30 group cursor-pointer">
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                        {def.naam}
                      </h3>
                      <CategoryBadge category={def.categorie} />
                      <StatusBadge status={def.status} />
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-1">{def.beschrijving}</p>
                  </div>
                  <div className="hidden md:flex flex-col items-end text-xs text-muted-foreground shrink-0">
                    <span>{def.eigenaar}</span>
                    <span>{new Date(def.laatstBijgewerkt).toLocaleDateString('nl-NL')}</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Index;
