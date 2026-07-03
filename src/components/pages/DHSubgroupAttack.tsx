import { useState } from 'react';
import { usePhaseStatus } from '@/hooks/usePhaseStatus';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { StepCard, ComputationRow, FormulaBox } from '@/components/StepCard';
import { InlineWarning } from '@/components/SecurityBanner';
import { MathText } from '@/components/MathText';
import { modPow } from '@/lib/ec-math';
import { isPrime } from '@/lib/crypto-math';
import { parseBigInt } from '@/lib/parse';
import { findDHSmallSubgroupLeaks } from '@/lib/dh-subgroup';

type Phase = 'setup' | 'attack' | 'result';

export function DHSubgroupAttack() {
  const [phase, setPhase] = useState<Phase>('setup');
  const [pStr, setPStr] = useState('23');
  const [gStr, setGStr] = useState('5');
  const [secretStr, setSecretStr] = useState('7');
  const [error, setError] = useState('');

  const [legitimatePub, setLegitimatePub] = useState<bigint | null>(null);
  const [attackResults, setAttackResults] = useState<{
    maliciousG: bigint;
    order: bigint;
    victimPub: bigint;
    sharedSecret: bigint;
    recoveredMod: bigint;
    explanation: string;
  }[]>([]);

  function doSetup() {
    setError('');
    const p = parseBigInt(pStr), g = parseBigInt(gStr), secret = parseBigInt(secretStr);
    if (!p || !g || !secret) { setError('Enter all parameters'); return; }
    if (!isPrime(p)) { setError('p must be prime'); return; }
    setLegitimatePub(modPow(g, secret, p));
    setPhase('attack');
  }

  function doAttack() {
    const p = parseBigInt(pStr)!, secret = parseBigInt(secretStr)!;
    const results = findDHSmallSubgroupLeaks(p, secret);
    setAttackResults(results);
    setPhase('result');
  }

  const getStatus = usePhaseStatus<Phase>(['setup', 'attack', 'result'], phase);

  return (
    <div className="space-y-4">
      <Card className="bg-red-500/5 border-red-500/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Diffie-Hellman Small Subgroup Attack</CardTitle>
          <CardDescription>
            An attacker sends a malicious generator with small order. The victim's public key
            then leaks their private key modulo that small order. By combining several small-order
            attacks via CRT, the full private key can be recovered.
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="rounded-lg border bg-muted/30 p-4 text-sm space-y-2">
        <p className="font-semibold">The problem</p>
        <p className="text-muted-foreground">Diffie-Hellman is secure only if the generator g has large prime order. If an attacker tricks you into using a generator with small-order subgroups, they can recover your private key.</p>
        <p className="font-semibold mt-3">The insight</p>
        <p className="text-muted-foreground">If g has order n with small factors, the attacker can confine your public key to a small subgroup and use the Chinese Remainder Theorem to reconstruct your private key modulo each small factor. Combining these partial results recovers the full secret. The fix is to validate that received public keys lie in the correct prime-order subgroup, or use safe primes / elliptic curves with cofactor 1.</p>
      </div>

      <StepCard step={1} title="Setup: Legitimate DH Parameters" status={getStatus('setup')}>
        <p className="text-xs text-muted-foreground">
          Set up a standard Diffie-Hellman group with prime p, generator g, and the victim's secret key. The attacker will later substitute malicious generators.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div><Label className="text-xs">p (prime)</Label><Input value={pStr} onChange={e => setPStr(e.target.value)} className="font-mono" /></div>
          <div><Label className="text-xs">g (generator)</Label><Input value={gStr} onChange={e => setGStr(e.target.value)} className="font-mono" /></div>
          <div><Label className="text-xs">Secret key (victim)</Label><Input value={secretStr} onChange={e => setSecretStr(e.target.value)} className="font-mono" /></div>
        </div>
        <Button onClick={doSetup} className="w-full">Setup</Button>
        {error && <p className="text-sm text-destructive">{error}</p>}
        {legitimatePub !== null && (
          <FormulaBox>
            <ComputationRow label="Legitimate pub" formula="g^secret mod p" value={legitimatePub.toString()} />
          </FormulaBox>
        )}
      </StepCard>

      <StepCard step={2} title="Attack: Send Malicious Generators" status={getStatus('attack')}>
        <InlineWarning>
          <MathText text="The attacker replaces g with elements of small order. The victim computes g_malicious^secret without validating the generator, leaking bits of the secret." />
        </InlineWarning>
        <Button onClick={doAttack} className="w-full">Run Small Subgroup Attacks</Button>
      </StepCard>

      <StepCard step={3} title="Results: Private Key Bits Leaked" status={getStatus('result')}>
        {attackResults.length > 0 && (
          <div className="space-y-3">
            {attackResults.map((r, i) => (
              <FormulaBox key={i}>
                <ComputationRow label="Malicious g" value={r.maliciousG.toString()} />
                <ComputationRow label="Order" value={r.order.toString()} />
                <ComputationRow label="Victim's pub" formula={`g^${secretStr} mod ${pStr}`} value={r.victimPub.toString()} />
                <ComputationRow label="Recovered" value={`secret ≡ ${r.recoveredMod} (mod ${r.order})`} highlight />
                <p className="text-xs text-muted-foreground mt-1">{r.explanation}</p>
              </FormulaBox>
            ))}

            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 space-y-2">
              <p className="text-sm font-bold text-red-600 dark:text-red-400">Combining with CRT</p>
              <p className="text-xs text-red-600/80 dark:text-red-400/70">
                Each small-order attack reveals secret mod (order). Using the Chinese Remainder Theorem,
                an attacker combines these to recover secret mod (product of orders). If the product
                covers the full group order, the entire private key is recovered.
              </p>
              <p className="text-xs text-red-600/80 dark:text-red-400/70">
                <strong>Fix:</strong> <MathText text="Always validate that received DH public keys are in the correct prime-order subgroup: check 1 < key < p and key^q ≡ 1 mod p (where q is the subgroup order). Use safe primes (p = 2q + 1) or elliptic curves where cofactor = 1." />
              </p>
            </div>
          </div>
        )}
      </StepCard>
    </div>
  );
}
