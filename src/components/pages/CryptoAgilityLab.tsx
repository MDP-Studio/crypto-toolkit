import { useMemo, useState } from 'react';
import { CheckCircle2, CircleAlert, RefreshCcw, ShieldCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  CRYPTO_AGILITY_SCENARIOS,
  CRYPTO_INVENTORY,
  scoreCryptoAgilityAnswers,
  type QuantumExposure,
} from '@/data/crypto-agility';

const EXPOSURE_LABELS: Record<QuantumExposure, string> = {
  none: 'No PQC priority',
  monitor: 'Monitor',
  prioritize: 'Prioritize',
};

export function CryptoAgilityLab() {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [checked, setChecked] = useState<Set<string>>(() => new Set());
  const score = useMemo(() => scoreCryptoAgilityAnswers(answers), [answers]);

  const checkScenario = (scenarioId: string) => {
    if (!answers[scenarioId]) return;
    setChecked(current => new Set(current).add(scenarioId));
  };

  const reset = () => {
    setAnswers({});
    setChecked(new Set());
  };

  return (
    <div className="space-y-5">
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <div className="flex items-center gap-2 text-primary"><RefreshCcw className="h-5 w-5" /><span className="text-xs font-mono uppercase tracking-[0.16em]">Migration lab</span></div>
          <CardTitle className="text-xl"><h1>Crypto-Agility Inventory and Migration Lab</h1></CardTitle>
          <CardDescription>
            Inventory algorithms, formats, owners, lifetimes, and protocol boundaries before changing cryptography. This lab teaches migration reasoning, not production implementation.
          </CardDescription>
        </CardHeader>
      </Card>

      <section aria-labelledby="inventory-title" className="space-y-3">
        <div>
          <h2 id="inventory-title" className="text-lg font-semibold">1. Read the cryptographic inventory</h2>
          <p className="text-sm text-muted-foreground">An algorithm name alone is not an inventory. A migration also needs a format version, owner, lifetime, target, and boundary.</p>
        </div>
        <div className="grid gap-3 lg:grid-cols-2">
          {CRYPTO_INVENTORY.map(item => (
            <Card key={item.id} size="sm">
              <CardHeader>
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <CardTitle><h3>{item.purpose}</h3></CardTitle>
                  <Badge variant={item.quantumExposure === 'prioritize' ? 'default' : 'outline'}>{EXPOSURE_LABELS[item.quantumExposure]}</Badge>
                </div>
                <CardDescription>{item.owner}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-xs leading-relaxed">
                <p><strong>Algorithm ID:</strong> <code>{item.algorithmId}</code></p>
                <p><strong>Format:</strong> <code>{item.formatVersion}</code></p>
                <p><strong>Protected lifetime:</strong> {item.dataLifetime}</p>
                <p><strong>Migration target:</strong> {item.migrationTarget}</p>
                <p className="text-muted-foreground"><strong>Boundary:</strong> {item.boundary}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section aria-labelledby="scenario-title" className="space-y-3">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 id="scenario-title" className="text-lg font-semibold">2. Reject unsafe migration plans</h2>
            <p className="text-sm text-muted-foreground">Choose a plan, check it, and use the failure explanation to identify the trust boundary you missed.</p>
          </div>
          <div aria-live="polite" className="text-right text-sm">
            <strong>{score.correct}/{score.total} correct</strong>
            <span className="block text-xs text-muted-foreground">{score.complete ? `${score.percent}% complete score` : 'Answer every scenario for a complete score'}</span>
          </div>
        </div>

        {CRYPTO_AGILITY_SCENARIOS.map((scenario, index) => {
          const selected = answers[scenario.id];
          const isChecked = checked.has(scenario.id);
          const correct = selected === scenario.correctOptionId;
          const selectedOption = scenario.options.find(option => option.id === selected);
          return (
            <Card key={scenario.id}>
              <CardHeader>
                <CardTitle><h3>{index + 1}. {scenario.title}</h3></CardTitle>
                <CardDescription>{scenario.prompt}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <fieldset className="space-y-2">
                  <legend className="sr-only">{scenario.title} options</legend>
                  {scenario.options.map(option => (
                    <label key={option.id} className="flex cursor-pointer items-start gap-3 rounded-lg border p-3 text-sm hover:bg-muted/40">
                      <input
                        type="radio"
                        name={scenario.id}
                        value={option.id}
                        checked={selected === option.id}
                        onChange={() => {
                          setAnswers(current => ({ ...current, [scenario.id]: option.id }));
                          setChecked(current => {
                            const next = new Set(current);
                            next.delete(scenario.id);
                            return next;
                          });
                        }}
                        className="mt-1"
                      />
                      <span>{option.label}</span>
                    </label>
                  ))}
                </fieldset>
                <Button type="button" variant="outline" disabled={!selected} onClick={() => checkScenario(scenario.id)}>Check migration decision</Button>
                {isChecked && selectedOption && (
                  <div role="status" className={`flex items-start gap-2 rounded-lg border p-3 text-sm ${correct ? 'border-primary/30 bg-primary/5' : 'border-destructive/30 bg-destructive/5'}`}>
                    {correct ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" /> : <CircleAlert className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />}
                    <p><strong>{correct ? 'Safe decision.' : 'Trust gap.'}</strong> {selectedOption.explanation}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </section>

      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="flex flex-col gap-4 pt-1 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            <p className="text-sm leading-relaxed"><strong>Stop point:</strong> use this lab to identify migration requirements. Production changes still require supported libraries, protocol owners, interoperability tests, staged telemetry, and an approved rollback policy.</p>
          </div>
          <Button type="button" variant="secondary" onClick={reset}>Reset lab</Button>
        </CardContent>
      </Card>
    </div>
  );
}
