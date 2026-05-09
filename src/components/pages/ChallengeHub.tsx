import { useMemo, useState } from 'react';
import { CheckCircle2, ChevronLeft, ChevronRight, Layers3, Trophy } from 'lucide-react';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChallengeCard } from '@/components/ChallengeCard';
import { CHALLENGE_STAGES, CHALLENGES, TOTAL_CHALLENGE_POINTS, type Challenge } from '@/data/challenges';
import { readSolvedChallengeIds } from '@/lib/challenge-progress';

function firstUnsolvedChallenge(challenges: Challenge[], solvedIds: Set<string>) {
  return challenges.find(challenge => !solvedIds.has(challenge.id)) ?? challenges[0];
}

export function ChallengeHub() {
  const [solvedIds, setSolvedIds] = useState(readSolvedChallengeIds);
  const [activeChallengeId, setActiveChallengeId] = useState(() => firstUnsolvedChallenge(CHALLENGES, solvedIds).id);

  const activeChallenge = CHALLENGES.find(challenge => challenge.id === activeChallengeId) ?? CHALLENGES[0];
  const activeStage = CHALLENGE_STAGES.find(stage => stage.id === activeChallenge.stageId) ?? CHALLENGE_STAGES[0];
  const activeStageChallenges = CHALLENGES.filter(challenge => challenge.stageId === activeStage.id);
  const activeStageIndex = CHALLENGE_STAGES.findIndex(stage => stage.id === activeStage.id);
  const activeIndex = CHALLENGES.findIndex(challenge => challenge.id === activeChallenge.id);
  const activeIndexInStage = activeStageChallenges.findIndex(challenge => challenge.id === activeChallenge.id);

  const solvedCount = useMemo(
    () => CHALLENGES.filter(challenge => solvedIds.has(challenge.id)).length,
    [solvedIds],
  );
  const solvedPoints = useMemo(
    () => CHALLENGES.filter(challenge => solvedIds.has(challenge.id)).reduce((sum, challenge) => sum + challenge.points, 0),
    [solvedIds],
  );

  function selectStage(stageId: string) {
    const stageChallenges = CHALLENGES.filter(challenge => challenge.stageId === stageId);
    const next = firstUnsolvedChallenge(stageChallenges, solvedIds);
    setActiveChallengeId(next.id);
  }

  function showPreviousChallenge() {
    const previous = CHALLENGES[(activeIndex - 1 + CHALLENGES.length) % CHALLENGES.length];
    setActiveChallengeId(previous.id);
  }

  function showNextChallenge() {
    const next = CHALLENGES[(activeIndex + 1) % CHALLENGES.length];
    setActiveChallengeId(next.id);
  }

  function handleSolved(id: string) {
    setSolvedIds(current => {
      const next = new Set(current);
      next.add(id);
      return next;
    });
  }

  return (
    <div className="space-y-5">
      <Card className="bg-primary/5 border-primary/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Challenge Hub</CardTitle>
          <CardDescription>
            Staged practice stays separate from the calculators. Pick a stage, solve one active challenge,
            then move forward when the reasoning is clear.
          </CardDescription>
        </CardHeader>
      </Card>

      <section className="grid gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="order-2 min-w-0 space-y-4 lg:order-1">
          <section className="rounded-xl border border-border/70 bg-card/50 p-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">Stages</p>
                <p className="mt-1 text-2xl font-semibold">{CHALLENGE_STAGES.length}</p>
              </div>
              <div>
                <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">Challenges</p>
                <p className="mt-1 text-2xl font-semibold">{CHALLENGES.length}</p>
              </div>
              <div>
                <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">Solved</p>
                <p className="mt-1 text-2xl font-semibold">{solvedCount}</p>
              </div>
              <div>
                <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">Points</p>
                <p className="mt-1 text-2xl font-semibold">{solvedPoints}/{TOTAL_CHALLENGE_POINTS}</p>
              </div>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">Progress is stored in this browser only.</p>
          </section>

          <section className="space-y-3" aria-labelledby="challenge-stages">
            <div className="flex items-center gap-2">
              <Layers3 className="h-4 w-4 text-primary" />
              <h2 id="challenge-stages" className="text-base font-semibold">Stages</h2>
            </div>

            <div className="grid grid-cols-1 gap-2" aria-label="Choose stage">
              {CHALLENGE_STAGES.map((stage, index) => {
                const stageChallenges = CHALLENGES.filter(challenge => challenge.stageId === stage.id);
                const stageSolved = stageChallenges.filter(challenge => solvedIds.has(challenge.id)).length;
                const selected = stage.id === activeStage.id;

                return (
                  <Button
                    key={stage.id}
                    type="button"
                    variant={selected ? 'default' : 'outline'}
                    onClick={() => selectStage(stage.id)}
                    aria-pressed={selected}
                    className="h-auto justify-start gap-3 px-3 py-3 text-left"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-background/20 font-mono text-xs">
                      {index + 1}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-semibold">{stage.title}</span>
                      <span className="mt-0.5 block truncate text-xs opacity-80">
                        {stage.difficulty} | {stageSolved}/{stageChallenges.length} solved
                      </span>
                    </span>
                  </Button>
                );
              })}
            </div>
          </section>
        </aside>

        <section className="order-1 min-w-0 space-y-3 lg:order-2" aria-labelledby="active-challenge">
          <div className="rounded-xl border border-border/70 bg-card/50 p-4 space-y-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                  Stage {activeStageIndex + 1} of {CHALLENGE_STAGES.length} | Question {activeIndexInStage + 1} of {activeStageChallenges.length}
                </p>
                <h2 id="active-challenge" className="mt-1 text-lg font-semibold">{activeStage.title}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{activeStage.summary}</p>
              </div>
              <div className="grid grid-cols-2 gap-2 sm:flex">
                <Button type="button" variant="outline" size="sm" onClick={showPreviousChallenge}>
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={showNextChallenge}>
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2" aria-label="Change question">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">Question picker</p>
                <p className="text-xs text-muted-foreground">
                  Overall {activeIndex + 1} of {CHALLENGES.length}
                </p>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {activeStageChallenges.map((challenge, index) => {
                  const selected = challenge.id === activeChallenge.id;
                  const solved = solvedIds.has(challenge.id);

                  return (
                    <Button
                      key={challenge.id}
                      type="button"
                      variant={selected ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setActiveChallengeId(challenge.id)}
                      aria-label={`Question ${index + 1}: ${challenge.title}`}
                      className="h-10 w-10 shrink-0 p-0"
                    >
                      {solved && !selected ? <CheckCircle2 className="h-4 w-4" /> : index + 1}
                    </Button>
                  );
                })}
              </div>
              <div className="rounded-lg border border-primary/20 bg-primary/5 px-3 py-2">
                <div className="flex flex-wrap items-center gap-2">
                  <Trophy className="h-4 w-4 text-primary" />
                  <p className="text-sm font-medium text-foreground">{activeChallenge.title}</p>
                  <span className="text-xs text-muted-foreground">{activeChallenge.points} pts</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{activeChallenge.category} | {activeChallenge.difficulty}</p>
              </div>
            </div>
          </div>

          <ChallengeCard
            key={activeChallenge.id}
            {...activeChallenge}
            solvedIds={solvedIds}
            onSolved={handleSolved}
          />
        </section>
      </section>

      <div className="rounded-lg border bg-muted/30 p-4 text-xs text-muted-foreground space-y-2">
        <p className="font-semibold text-foreground text-sm">Challenge boundary</p>
        <p>
          These are client-side educational checks, not anti-cheat flags. The goal is deliberate practice:
          read the prompt, use the module, derive the answer, and verify your understanding.
        </p>
        <p>
          The harder stages use short accepted answers because the browser cannot keep secrets from the learner.
          That is fine for training, but it is not a server-side CTF scoring model.
        </p>
      </div>
    </div>
  );
}
