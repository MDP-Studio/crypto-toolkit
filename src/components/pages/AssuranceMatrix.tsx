import { useMemo, useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  ASSURANCE_LEVEL_LABELS,
  ASSURANCE_MODULES,
  countEvidenceLevels,
  type EvidenceLevel,
} from '@/lib/assurance';

const LEVEL_BADGES: Record<EvidenceLevel, 'default' | 'secondary' | 'outline'> = {
  strong: 'default',
  moderate: 'secondary',
  limited: 'outline',
};

export function AssuranceMatrix() {
  const [query, setQuery] = useState('');
  const counts = countEvidenceLevels();
  const normalizedQuery = query.trim().toLowerCase();
  const modules = useMemo(() => {
    if (!normalizedQuery) return ASSURANCE_MODULES;
    return ASSURANCE_MODULES.filter(module => [
      module.title,
      module.category,
      module.evidenceLevel,
      ...module.specSections,
      ...module.vectorSources,
      ...module.testIds,
      ...module.limitations,
    ].some(value => value.toLowerCase().includes(normalizedQuery)));
  }, [normalizedQuery]);

  return (
    <div className="space-y-4">
      <Card className="bg-primary/5 border-primary/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Assurance Matrix</CardTitle>
          <CardDescription>
            Per-module evidence for spec anchors, vector sources, test IDs, and known limitations.
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <MetricCard label="Modules" value={ASSURANCE_MODULES.length.toString()} />
        <MetricCard label="Strong" value={counts.strong.toString()} />
        <MetricCard label="Moderate" value={counts.moderate.toString()} />
        <MetricCard label="Limited" value={counts.limited.toString()} />
      </div>

      <div className="rounded-lg border bg-card/70 p-3">
        <Input
          value={query}
          onChange={event => setQuery(event.target.value)}
          placeholder="Filter by module, spec, vector, test, or limitation"
          className="max-w-xl"
        />
      </div>

      <div className="overflow-hidden rounded-lg border">
        <div className="hidden bg-muted/60 px-4 py-2 text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground md:grid md:grid-cols-[1.15fr_0.8fr_1.1fr_1.1fr_1fr] md:gap-4">
          <span>Module</span>
          <span>Evidence</span>
          <span>Spec and vectors</span>
          <span>Tests</span>
          <span>Known limits</span>
        </div>
        <div className="divide-y">
          {modules.map(module => (
            <article key={module.id} className="grid gap-3 bg-card/40 px-4 py-4 text-sm md:grid-cols-[1.15fr_0.8fr_1.1fr_1.1fr_1fr] md:gap-4">
              <div className="min-w-0">
                <a className="font-semibold text-foreground hover:text-primary" href={`#/${module.id}`}>
                  {module.title}
                </a>
                <p className="mt-1 text-xs text-muted-foreground">{module.category}</p>
              </div>
              <div>
                <Badge variant={LEVEL_BADGES[module.evidenceLevel]}>
                  {ASSURANCE_LEVEL_LABELS[module.evidenceLevel]}
                </Badge>
              </div>
              <EvidenceBlock values={[...module.specSections, ...module.vectorSources]} />
              <EvidenceBlock values={module.testIds} />
              <EvidenceBlock values={module.limitations} />
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-card/70 p-4">
      <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
    </div>
  );
}

function EvidenceBlock({ values }: { values: string[] }) {
  return (
    <ul className="space-y-1 text-xs leading-relaxed text-muted-foreground">
      {values.map(value => (
        <li key={value}>{value}</li>
      ))}
    </ul>
  );
}
