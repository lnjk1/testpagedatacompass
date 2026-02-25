import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Upload, FileSpreadsheet, Download, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CategoryBadge } from '@/components/CategoryBadge';
import { StatusBadge } from '@/components/StatusBadge';
import { parseFile, generateTemplate, ParseResult } from '@/lib/csv-parser';
import { importDefinitions } from '@/lib/glossary-store';
import { useToast } from '@/hooks/use-toast';

const UploadPage = () => {
  const [result, setResult] = useState<ParseResult | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [imported, setImported] = useState<{ added: number; updated: number } | null>(null);
  const { toast } = useToast();

  const handleFile = useCallback(async (file: File) => {
    setImported(null);
    try {
      const parsed = await parseFile(file);
      setResult(parsed);
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Fout', description: err.message });
    }
  }, [toast]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const onFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleImport = () => {
    if (!result) return;
    const stats = importDefinitions(result.definitions);
    setImported(stats);
    toast({
      title: 'Import succesvol',
      description: `${stats.added} toegevoegd, ${stats.updated} bijgewerkt.`,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto flex items-center gap-4 px-4 py-4">
          <Link to="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold tracking-tight">CSV/Excel Upload</h1>
            <p className="text-xs text-muted-foreground">Importeer of werk definities bij</p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-6 max-w-3xl">
        {/* Template download */}
        <Card>
          <CardContent className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <FileSpreadsheet className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium">Voorbeeld template</p>
                <p className="text-xs text-muted-foreground">Download het verwachte format</p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={generateTemplate} className="gap-2">
              <Download className="h-4 w-4" />
              Download
            </Button>
          </CardContent>
        </Card>

        {/* Upload area */}
        <Card
          className={`transition-all ${isDragging ? 'border-primary bg-primary/5' : ''}`}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={onDrop}
        >
          <CardContent className="flex flex-col items-center justify-center py-12 gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
              <Upload className="h-8 w-8 text-primary" />
            </div>
            <div className="text-center">
              <p className="font-semibold">Sleep een bestand hierheen</p>
              <p className="text-sm text-muted-foreground">of klik om te selecteren (.csv, .xlsx, .xls)</p>
            </div>
            <label>
              <input
                type="file"
                accept=".csv,.xlsx,.xls"
                className="hidden"
                onChange={onFileSelect}
              />
              <Button variant="outline" asChild>
                <span>Bestand kiezen</span>
              </Button>
            </label>
          </CardContent>
        </Card>

        {/* Errors & Warnings */}
        {result && result.errors.length > 0 && (
          <Card className="border-destructive/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-destructive flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Fouten gevonden
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="text-sm space-y-1">
                {result.errors.map((e, i) => <li key={i} className="text-destructive">• {e}</li>)}
              </ul>
            </CardContent>
          </Card>
        )}

        {result && result.warnings.length > 0 && (
          <Card className="border-amber-300">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-amber-600 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Waarschuwingen
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="text-sm space-y-1">
                {result.warnings.map((w, i) => <li key={i} className="text-amber-600">• {w}</li>)}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Preview */}
        {result && result.definitions.length > 0 && !imported && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Preview — {result.definitions.length} definities</CardTitle>
              <CardDescription>Controleer de data voordat je importeert</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Naam</TableHead>
                      <TableHead>Categorie</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Eigenaar</TableHead>
                      <TableHead className="text-right">Stappen</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {result.definitions.slice(0, 20).map((def, i) => (
                      <TableRow key={i}>
                        <TableCell className="font-medium">{def.naam}</TableCell>
                        <TableCell><CategoryBadge category={def.categorie} /></TableCell>
                        <TableCell><StatusBadge status={def.status} /></TableCell>
                        <TableCell className="text-sm">{def.eigenaar}</TableCell>
                        <TableCell className="text-right">{def.transformaties.length}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {result.definitions.length > 20 && (
                <p className="text-xs text-muted-foreground mt-2">
                  ...en {result.definitions.length - 20} meer
                </p>
              )}
              <Button onClick={handleImport} className="mt-4 w-full gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Importeer {result.definitions.length} definities
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Success */}
        {imported && (
          <Card className="border-emerald-300 bg-emerald-50">
            <CardContent className="flex flex-col items-center py-8 gap-3">
              <CheckCircle2 className="h-10 w-10 text-emerald-600" />
              <p className="font-semibold text-emerald-800">Import succesvol!</p>
              <p className="text-sm text-emerald-600">
                {imported.added} nieuw toegevoegd, {imported.updated} bijgewerkt.
              </p>
              <Link to="/">
                <Button className="mt-2">Bekijk glossary</Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default UploadPage;
