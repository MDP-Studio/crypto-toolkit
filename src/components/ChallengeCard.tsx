import { useMemo, useState } from 'react';
import { ArrowRight, CheckCircle2, Flag, Lightbulb } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MathText } from '@/components/MathText';
import { readSolvedChallengeIds, writeSolvedChallengeIds } from '@/lib/challenge-progress';

function normalizeAnswer(value: string) {
  return value.trim().toLowerCase().replace(/^crypto\{(.+)\}$/, '$1').replace(/\s+/g, ' ');
}

export interface ChallengeVisual {
  kind: 'flow' | 'formula' | 'xor' | 'graph';
  title: string;
  formula?: string;
  items?: string[];
  rows?: { label: string; value: string }[];
}

export interface ChallengeCardProps {
  id: string;
  title: string;
  category: string;
  difficulty?: string;
  points: number;
  prompt: string;
  answerFormat?: string;
  placeholder?: string;
  hint?: string;
  moduleHref?: string;
  moduleLabel?: string;
  acceptedAnswers: string[];
  visual?: ChallengeVisual;
  solvedIds?: Set<string>;
  onSolved?: (id: string) => void;
}

function ChallengeVisualPanel({ visual }: { visual: ChallengeVisual }) {
  return (
    <div className="rounded-lg border border-border/70 bg-background/60 p-3">
      <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">{visual.title}</p>

      {visual.kind === 'formula' && visual.formula && (
        <div className="mt-2 rounded-md bg-muted/60 px-3 py-2 font-mono text-sm text-foreground">
          <MathText text={visual.formula} />
        </div>
      )}

      {visual.kind === 'flow' && visual.items && (
        <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
          {visual.items.map((item, index) => (
            <div key={item} className="flex items-center gap-2">
              <span className="rounded-md border border-primary/20 bg-primary/10 px-3 py-2 font-mono text-xs text-foreground">
                <MathText text={item} />
              </span>
              {index < visual.items!.length - 1 && (
                <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground max-sm:rotate-90" />
              )}
            </div>
          ))}
        </div>
      )}

      {visual.kind === 'xor' && visual.rows && (
        <div className="mt-2 divide-y divide-border/60 overflow-hidden rounded-md border border-border/60 font-mono text-xs">
          {visual.rows.map(row => (
            <div key={row.label} className="grid grid-cols-[7rem_1fr] gap-2 bg-muted/40 px-3 py-2">
              <span className="text-muted-foreground"><MathText text={row.label} /></span>
              <span className="text-foreground"><MathText text={row.value} /></span>
            </div>
          ))}
        </div>
      )}

      {visual.kind === 'graph' && visual.items && (
        <div className="mt-3 max-w-full overflow-hidden">
          <svg className="w-full text-foreground" viewBox="0 0 420 110" role="img" aria-label={visual.title}>
            <line x1="56" y1="54" x2="364" y2="54" stroke="currentColor" strokeOpacity="0.22" strokeWidth="2" />
            {visual.items.map((item, index) => {
              const x = 56 + index * (308 / Math.max(visual.items!.length - 1, 1));
              return (
                <g key={item}>
                  <circle cx={x} cy="54" r="18" className="fill-primary/10 stroke-primary/50" strokeWidth="2" />
                  <text x={x} y="59" textAnchor="middle" className="fill-primary text-[11px] font-semibold">
                    {index + 1}
                  </text>
                  <text x={x} y="91" textAnchor="middle" className="fill-muted-foreground text-[10px]">
                    {item}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      )}
    </div>
  );
}

export function ChallengeCard({
  id,
  title,
  category,
  difficulty,
  points,
  prompt,
  answerFormat,
  placeholder = 'Enter answer',
  hint,
  moduleHref,
  moduleLabel = 'Open module',
  acceptedAnswers,
  visual,
  solvedIds,
  onSolved,
}: ChallengeCardProps) {
  const accepted = useMemo(() => new Set(acceptedAnswers.map(normalizeAnswer)), [acceptedAnswers]);
  const [answer, setAnswer] = useState('');
  const [internalSolvedIds, setInternalSolvedIds] = useState(readSolvedChallengeIds);
  const [message, setMessage] = useState('');
  const activeSolvedIds = solvedIds ?? internalSolvedIds;
  const solved = activeSolvedIds.has(id);

  function checkAnswer() {
    if (accepted.has(normalizeAnswer(answer))) {
      const next = new Set(activeSolvedIds);
      next.add(id);
      writeSolvedChallengeIds(next);
      if (!solvedIds) setInternalSolvedIds(next);
      onSolved?.(id);
      setMessage('Solved. Nice work.');
      return;
    }

    setMessage('Not quite. Check the module output and try again.');
  }

  return (
    <section className="min-w-0 rounded-xl border border-primary/25 bg-primary/5 p-5 text-sm shadow-sm shadow-primary/5 space-y-4 md:p-6">
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-primary/25 bg-background/80 text-primary">
          <Flag className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-primary">{category}</p>
            {difficulty && <Badge variant="outline" className="text-[10px]">{difficulty}</Badge>}
          </div>
          <h3 className="mt-1 text-xl font-semibold leading-tight text-foreground md:text-2xl">{title}</h3>
        </div>
        <Badge variant={solved ? 'default' : 'outline'}>
          {solved ? 'Solved' : `${points} pts`}
        </Badge>
      </div>

      <div className="rounded-lg border border-primary/20 bg-background/75 p-4">
        <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-primary">Question</p>
        <p className="mt-2 text-base font-medium leading-relaxed text-foreground md:text-lg">
          <MathText text={prompt} />
        </p>
        {answerFormat && (
          <p className="mt-3 text-xs text-muted-foreground">
            Answer format: <span className="font-medium text-foreground">{answerFormat}</span>
          </p>
        )}
      </div>

      {visual && <ChallengeVisualPanel visual={visual} />}

      {hint && (
        <details className="rounded-lg border border-border/70 bg-background/60 px-3 py-2 text-xs">
          <summary className="flex cursor-pointer items-center gap-2 font-medium text-foreground">
            <Lightbulb className="h-3.5 w-3.5 text-primary" />
            Hint
          </summary>
          <p className="mt-2 leading-relaxed text-muted-foreground"><MathText text={hint} /></p>
        </details>
      )}

      <div className="flex flex-col gap-2 sm:flex-row">
        <Input
          value={answer}
          onChange={event => {
            setAnswer(event.target.value);
            setMessage('');
          }}
          onKeyDown={event => {
            if (event.key === 'Enter') checkAnswer();
          }}
          className="font-mono"
          placeholder={placeholder}
        />
        <Button type="button" onClick={checkAnswer} className="sm:w-32">
          Check
        </Button>
      </div>

      {moduleHref && (
        <a className="inline-flex text-xs font-medium text-primary hover:underline" href={moduleHref}>
          {moduleLabel}
        </a>
      )}

      {(message || solved) && (
        <p className={`flex items-center gap-2 text-xs ${solved ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'}`}>
          {solved && <CheckCircle2 className="h-3.5 w-3.5" />}
          {message || 'Solved locally on this browser.'}
        </p>
      )}
    </section>
  );
}
