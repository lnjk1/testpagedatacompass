import { useParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { ArrowLeft, User, Calendar, Tag, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CategoryBadge } from '@/components/CategoryBadge';
import { StatusBadge } from '@/components/StatusBadge';
import { LineageFlow } from '@/components/LineageFlow';
import { DataDefinition } from '@/types/glossary';
import { getDefinitionById } from '@/lib/glossary-store';

const DefinitionDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [definition, setDefinition] = useState<DataDefinition | null>(null);

  useEffect(() => {
    if (id) {
      const def = getDefinitionById(id);
      setDefinition(def || null);
    }
  }, [id]);

  if (!definition) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Definitie niet gevonden.</p>
          <Link to="/">
            <Button variant="outline">Terug naar overzicht</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto flex items-center gap-4 px-4 py-4">
          <Link to="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold tracking-tight truncate">{definition.naam}</h1>
          </div>
          <div className="flex items-center gap-2">
            <CategoryBadge category={definition.categorie} />
            <StatusBadge status={definition.status} />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-6">
        {/* Definitie */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Info className="h-5 w-5 text-primary" />
              Definitie
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-foreground leading-relaxed">{definition.beschrijving}</p>
          </CardContent>
        </Card>

        {/* Metadata */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                <User className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Eigenaar</p>
                <p className="text-sm font-medium">{definition.eigenaar}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary/10">
                <Calendar className="h-4 w-4 text-secondary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Laatst bijgewerkt</p>
                <p className="text-sm font-medium">{new Date(definition.laatstBijgewerkt).toLocaleDateString('nl-NL')}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/10">
                <Tag className="h-4 w-4 text-accent" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Categorie</p>
                <p className="text-sm font-medium">{definition.categorie}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Data Lineage */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Data Lineage — Transformatiestappen</CardTitle>
            <p className="text-sm text-muted-foreground">
              Het pad van brondata naar rapportage, stap voor stap.
            </p>
          </CardHeader>
          <CardContent className="overflow-x-auto pb-6">
            <LineageFlow steps={definition.transformaties} branches={definition.lineageBranches} mergeStappen={definition.mergeStappen} />
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default DefinitionDetail;
