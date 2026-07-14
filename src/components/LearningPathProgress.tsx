import type { Page } from '@/App';
import { Card, CardContent } from '@/components/ui/card';
import { findLearningPath } from '@/data/learning-paths';
import { ArrowLeft, ArrowRight, BookOpenCheck } from 'lucide-react';

interface LearningPathProgressProps {
  page: Page;
  onNavigate: (page: Page) => void;
}

export function LearningPathProgress({ page, onNavigate }: LearningPathProgressProps) {
  const match = findLearningPath(page);
  if (!match) return null;

  const { path, stepIndex } = match;
  const previous = path.steps[stepIndex - 1];
  const next = path.steps[stepIndex + 1];

  return (
    <Card className="mt-6 border-primary/20 bg-primary/5">
      <CardContent className="p-4 md:p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-[0.14em] text-primary">
              <BookOpenCheck className="h-4 w-4" aria-hidden="true" />
              Learning path
            </div>
            <h2 className="mt-2 text-base font-semibold">{path.title}</h2>
            <p className="mt-1 text-sm text-foreground/75">
              Step {stepIndex + 1} of {path.steps.length}: {path.steps[stepIndex].purpose}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {previous && (
              <button
                type="button"
                onClick={() => onNavigate(previous.id)}
                className="inline-flex h-9 items-center gap-2 rounded-lg border border-border bg-background px-3 text-sm font-medium transition-colors hover:border-primary/40 hover:text-primary"
              >
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                {previous.label}
              </button>
            )}
            {next ? (
              <button
                type="button"
                onClick={() => onNavigate(next.id)}
                className="inline-flex h-9 items-center gap-2 rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/85"
              >
                Next: {next.label}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onNavigate('home')}
                className="inline-flex h-9 items-center gap-2 rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/85"
              >
                Choose another path
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
            )}
          </div>
        </div>
        <div
          className="mt-4 h-1.5 overflow-hidden rounded-full bg-muted"
          role="progressbar"
          aria-label={`${path.title} progress`}
          aria-valuemin={1}
          aria-valuemax={path.steps.length}
          aria-valuenow={stepIndex + 1}
        >
          <div
            className="h-full rounded-full bg-primary transition-[width]"
            style={{ width: `${((stepIndex + 1) / path.steps.length) * 100}%` }}
          />
        </div>
      </CardContent>
    </Card>
  );
}
