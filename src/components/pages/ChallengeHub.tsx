import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChallengeCard } from '@/components/ChallengeCard';

const CHALLENGES = [
  {
    id: 'hmac-rfc4231-case1',
    title: 'RFC 4231 HMAC Vector',
    category: 'Composition',
    points: 10,
    prompt: 'Use the HMAC walkthrough to load RFC 4231 TC1, compute the HMAC, and submit the full SHA-256 HMAC hex digest.',
    placeholder: 'b0344c61...',
    hint: 'The key is hex bytes, not the text characters 0 and b. This reinforces the key-encoding bug class fixed in the HMAC module.',
    moduleHref: '#/hmac',
    moduleLabel: 'Open HMAC walkthrough',
    acceptedAnswers: ['b0344c61d8db38535ca8afceafbf12b881dc200c9833da726e9376c2e32cff7'],
  },
  {
    id: 'ecb-pattern-leakage-mode',
    title: 'Name the Broken Mode',
    category: 'Symmetric Ciphers',
    points: 5,
    prompt: 'Use the ECB Pattern Leakage simulator with the default repeated plaintext. Which AES mode leaks identical plaintext blocks as identical ciphertext blocks?',
    placeholder: 'mode name',
    hint: 'Look for duplicate ciphertext rows and the mode name in the simulator title.',
    moduleHref: '#/ecb-penguin',
    moduleLabel: 'Open ECB simulator',
    acceptedAnswers: ['ecb', 'aes-ecb', 'electronic codebook'],
  },
  {
    id: 'ecdsa-nonce-reuse-recover-d',
    title: 'Recover the Private Key',
    category: 'Elliptic Curves',
    points: 15,
    prompt: 'Run the default ECDSA nonce reuse attack through verification, then submit the recovered private key d.',
    placeholder: 'recovered d',
    hint: 'Use the default values. The answer is the d value shown in the verification step after recovery.',
    moduleHref: '#/nonce-reuse',
    moduleLabel: 'Open nonce reuse simulator',
    acceptedAnswers: ['3'],
  },
];

const totalPoints = CHALLENGES.reduce((sum, challenge) => sum + challenge.points, 0);

export function ChallengeHub() {
  return (
    <div className="space-y-5">
      <Card className="bg-primary/5 border-primary/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Challenge Hub</CardTitle>
          <CardDescription>
            Standalone practice tasks inspired by crypto CTF platforms. Calculators and simulators stay focused
            on teaching; challenges live here as a separate practice track.
          </CardDescription>
        </CardHeader>
      </Card>

      <section className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <div className="rounded-lg border border-border/70 bg-card/50 p-4">
          <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">Starter set</p>
          <p className="mt-1 text-2xl font-semibold">{CHALLENGES.length}</p>
        </div>
        <div className="rounded-lg border border-border/70 bg-card/50 p-4">
          <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">Points available</p>
          <p className="mt-1 text-2xl font-semibold">{totalPoints}</p>
        </div>
        <div className="rounded-lg border border-border/70 bg-card/50 p-4">
          <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">Progress storage</p>
          <p className="mt-1 text-sm text-muted-foreground">Local browser only</p>
        </div>
      </section>

      <section className="space-y-3" aria-labelledby="starter-challenges">
        <div>
          <h2 id="starter-challenges" className="text-base font-semibold">Starter Challenges</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Use the linked learning module as your lab, then return here to submit the result.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
          {CHALLENGES.map(challenge => (
            <ChallengeCard key={challenge.id} {...challenge} />
          ))}
        </div>
      </section>

      <div className="rounded-lg border bg-muted/30 p-4 text-xs text-muted-foreground space-y-2">
        <p className="font-semibold text-foreground text-sm">Challenge boundary</p>
        <p>
          These are client-side educational checks, not anti-cheat flags. The goal is deliberate practice:
          read the prompt, use the simulator, derive the answer, and verify your understanding.
        </p>
        <p>
          Future challenge sets can add local oracle-style tasks for ECB, padding oracle, RSA, ECDSA,
          hash length extension, and GCM nonce reuse without mixing practice UI into the calculators.
        </p>
      </div>
    </div>
  );
}
