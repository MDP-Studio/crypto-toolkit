import { useMemo, useState } from 'react';
import { CheckCircle2, Flag, Lightbulb } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const STORAGE_KEY = 'crypto-toolkit:challenge-solves';

function normalizeAnswer(value: string) {
  return value.trim().toLowerCase().replace(/^crypto\{(.+)\}$/, '$1');
}

function readSolvedIds(): Set<string> {
  if (typeof window === 'undefined') return new Set();

  try {
    const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '[]');
    return new Set(Array.isArray(parsed) ? parsed.filter(item => typeof item === 'string') : []);
  } catch {
    return new Set();
  }
}

function writeSolvedIds(ids: Set<string>) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(ids).sort()));
}

interface ChallengeCardProps {
  id: string;
  title: string;
  category: string;
  points: number;
  prompt: string;
  placeholder?: string;
  hint?: string;
  moduleHref?: string;
  moduleLabel?: string;
  acceptedAnswers: string[];
}

export function ChallengeCard({
  id,
  title,
  category,
  points,
  prompt,
  placeholder = 'Enter answer',
  hint,
  moduleHref,
  moduleLabel = 'Open module',
  acceptedAnswers,
}: ChallengeCardProps) {
  const accepted = useMemo(() => new Set(acceptedAnswers.map(normalizeAnswer)), [acceptedAnswers]);
  const [answer, setAnswer] = useState('');
  const [solvedIds, setSolvedIds] = useState(readSolvedIds);
  const [message, setMessage] = useState('');
  const solved = solvedIds.has(id);

  function checkAnswer() {
    if (accepted.has(normalizeAnswer(answer))) {
      const next = new Set(solvedIds);
      next.add(id);
      writeSolvedIds(next);
      setSolvedIds(next);
      setMessage('Solved. Nice work.');
      return;
    }

    setMessage('Not quite. Check the module output and try again.');
  }

  return (
    <section className="rounded-lg border border-primary/20 bg-primary/5 p-4 text-sm space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-primary/25 bg-background/70 text-primary">
          <Flag className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-primary">{category}</p>
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        </div>
        <Badge variant={solved ? 'default' : 'outline'}>
          {solved ? 'Solved' : `${points} pts`}
        </Badge>
      </div>

      <p className="text-xs leading-relaxed text-muted-foreground">{prompt}</p>

      {hint && (
        <details className="rounded-md border border-border/70 bg-background/60 px-3 py-2 text-xs">
          <summary className="flex cursor-pointer items-center gap-2 font-medium text-foreground">
            <Lightbulb className="h-3.5 w-3.5 text-primary" />
            Hint
          </summary>
          <p className="mt-2 leading-relaxed text-muted-foreground">{hint}</p>
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
