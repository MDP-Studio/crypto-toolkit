import type { Page } from '@/App';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ASSURANCE_LEVEL_LABELS, getAssuranceForPage } from '@/lib/assurance';

const LEVEL_BADGES = {
  strong: 'default',
  moderate: 'secondary',
  limited: 'outline',
} as const;

export function AssuranceSummary({ page }: { page: Page }) {
  const assurance = getAssuranceForPage(page);
  if (!assurance) return null;

  return (
    <Card className="mt-6 border-primary/10 bg-card/70">
      <CardContent className="p-4 md:p-5 space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="text-[11px] font-mono uppercase tracking-[0.18em] text-primary mb-2">
              Assurance evidence
            </div>
            <h2 className="text-base font-semibold">{assurance.title}</h2>
          </div>
          <Badge variant={LEVEL_BADGES[assurance.evidenceLevel]}>
            {ASSURANCE_LEVEL_LABELS[assurance.evidenceLevel]}
          </Badge>
        </div>

        <div className="grid gap-3 md:grid-cols-4">
          <EvidenceList title="Spec anchors" values={assurance.specSections} />
          <EvidenceList title="Vector source" values={assurance.vectorSources} />
          <EvidenceList title="Test ID" values={assurance.testIds} />
          <EvidenceList title="Known limit" values={assurance.limitations} />
        </div>

        <a className="text-xs font-medium text-primary hover:underline" href="#/assurance">
          Open full assurance matrix
        </a>
      </CardContent>
    </Card>
  );
}

function EvidenceList({ title, values }: { title: string; values: string[] }) {
  return (
    <div className="min-w-0">
      <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">{title}</p>
      <ul className="mt-2 space-y-1">
        {values.slice(0, 2).map(value => (
          <li key={value} className="text-xs leading-relaxed text-muted-foreground">
            {value}
          </li>
        ))}
      </ul>
    </div>
  );
}
