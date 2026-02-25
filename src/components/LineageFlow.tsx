import { TransformationStep } from '@/types/glossary';
import { ArrowRight, Database, BarChart3, Server, Globe } from 'lucide-react';

const APP_ICONS: Record<string, React.ReactNode> = {
  'exact online': <Database className="h-5 w-5" />,
  'afas': <Server className="h-5 w-5" />,
  'power bi': <BarChart3 className="h-5 w-5" />,
  'data warehouse': <Database className="h-5 w-5" />,
  'surveymonkey': <Globe className="h-5 w-5" />,
  'timechimp': <Globe className="h-5 w-5" />,
};

function getIcon(app: string) {
  return APP_ICONS[app.toLowerCase()] || <Server className="h-5 w-5" />;
}

const STEP_COLORS = [
  'from-primary/20 to-primary/5 border-primary/30',
  'from-secondary/20 to-secondary/5 border-secondary/30',
  'from-accent/20 to-accent/5 border-accent/30',
  'from-orange-200 to-orange-50 border-orange-300',
  'from-purple-200 to-purple-50 border-purple-300',
];

export function LineageFlow({ steps }: { steps: TransformationStep[] }) {
  if (steps.length === 0) {
    return <p className="text-sm text-muted-foreground italic">Geen transformatiestappen beschikbaar.</p>;
  }

  return (
    <div className="flex flex-wrap items-start gap-2 pt-3 pl-3">
      {steps.map((step, i) => (
        <div key={i} className="flex items-center gap-2">
          <div
            className={`relative flex flex-col items-center gap-2 rounded-xl border bg-gradient-to-b p-4 min-w-[160px] max-w-[220px] ${STEP_COLORS[i % STEP_COLORS.length]}`}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-card shadow-sm border">
              {getIcon(step.bronapplicatie)}
            </div>
            <span className="text-xs font-semibold text-foreground">{step.bronapplicatie}</span>
            <span className="text-xs text-muted-foreground text-center leading-snug">{step.beschrijving}</span>
            <span className="absolute -top-2 -left-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
              {step.stapnummer}
            </span>
          </div>
          {i < steps.length - 1 && (
            <ArrowRight className="h-5 w-5 text-muted-foreground shrink-0" />
          )}
        </div>
      ))}
    </div>
  );
}
