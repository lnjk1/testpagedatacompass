import { TransformationStep, LineageBranch } from '@/types/glossary';
import { ArrowRight, Database, BarChart3, Server, Globe, GitMerge } from 'lucide-react';

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

const BRANCH_COLORS = [
  { accent: 'border-primary/50', label: 'text-primary' },
  { accent: 'border-accent/50', label: 'text-accent' },
  { accent: 'border-secondary/50', label: 'text-secondary' },
  { accent: 'border-orange-400', label: 'text-orange-600' },
  { accent: 'border-purple-400', label: 'text-purple-600' },
];

function StepCard({ step, colorIndex }: { step: TransformationStep; colorIndex: number }) {
  return (
    <div
      className={`relative flex flex-col items-center gap-2 rounded-xl border bg-gradient-to-b p-4 min-w-[160px] max-w-[220px] ${STEP_COLORS[colorIndex % STEP_COLORS.length]}`}
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
  );
}

function LinearFlow({ steps }: { steps: TransformationStep[] }) {
  return (
    <div className="flex flex-wrap items-start gap-2 pt-3 pl-3">
      {steps.map((step, i) => (
        <div key={i} className="flex items-center gap-2">
          <StepCard step={step} colorIndex={i} />
          {i < steps.length - 1 && (
            <ArrowRight className="h-5 w-5 text-muted-foreground shrink-0" />
          )}
        </div>
      ))}
    </div>
  );
}

function BranchFlow({ branches, mergeStappen }: { branches: LineageBranch[]; mergeStappen: TransformationStep[] }) {
  return (
    <div className="flex items-stretch gap-0 pt-3 pl-3">
      {/* Branches section */}
      <div className="flex flex-col justify-center gap-6">
        {branches.map((branch, branchIdx) => {
          const branchColor = BRANCH_COLORS[branchIdx % BRANCH_COLORS.length];
          return (
            <div key={branchIdx} className="flex flex-col gap-1">
              <span className={`text-xs font-semibold ${branchColor.label} pl-1`}>
                {branch.bronNaam}
              </span>
              <div className="flex items-center gap-2">
                {branch.stappen.map((step, stepIdx) => (
                  <div key={stepIdx} className="flex items-center gap-2">
                    <StepCard step={step} colorIndex={branchIdx} />
                    {stepIdx < branch.stappen.length - 1 && (
                      <ArrowRight className="h-5 w-5 text-muted-foreground shrink-0" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Merge connector */}
      <div className="flex flex-col items-center justify-center px-3 relative">
        {/* Vertical connector line */}
        <div className="absolute top-[15%] bottom-[15%] w-px border-l-2 border-dashed border-muted-foreground/40" />
        {/* Horizontal connectors from branches */}
        {branches.map((_, i) => (
          <div key={i} className="flex-1 flex items-center">
            <ArrowRight className="h-5 w-5 text-muted-foreground shrink-0" />
          </div>
        ))}
      </div>

      {/* Merge icon */}
      <div className="flex items-center">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 border-2 border-primary/30 shadow-sm">
          <GitMerge className="h-5 w-5 text-primary" />
        </div>
      </div>

      {/* Merge steps */}
      {mergeStappen.length > 0 && (
        <div className="flex items-center gap-2 ml-2">
          {mergeStappen.map((step, i) => (
            <div key={i} className="flex items-center gap-2">
              <ArrowRight className="h-5 w-5 text-muted-foreground shrink-0" />
              <StepCard step={step} colorIndex={branches.length + i} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

interface LineageFlowProps {
  steps: TransformationStep[];
  branches?: LineageBranch[];
  mergeStappen?: TransformationStep[];
}

export function LineageFlow({ steps, branches, mergeStappen }: LineageFlowProps) {
  if (branches && branches.length > 0) {
    return <BranchFlow branches={branches} mergeStappen={mergeStappen || []} />;
  }

  if (steps.length === 0) {
    return <p className="text-sm text-muted-foreground italic">Geen transformatiestappen beschikbaar.</p>;
  }

  return <LinearFlow steps={steps} />;
}
