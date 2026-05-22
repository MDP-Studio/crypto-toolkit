import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StepCard, ComputationRow, FormulaBox } from '@/components/StepCard';
import { ByteInput } from '@/components/ByteInput';
import { bytesToHex, encodeBytes, type ByteInputEncoding } from '@/lib/encoding';
import { computeHmacSha256Steps } from '@/lib/hmac';
import { HMAC_EXAMPLES, type HmacExample } from '@/lib/hmac-examples';
import { hmacSHA256 } from '@/lib/web-crypto';

export function HMACWalkthrough() {
  const [key, setKey] = useState('mysecretkey');
  const [keyEncoding, setKeyEncoding] = useState<ByteInputEncoding>('text');
  const [message, setMessage] = useState('Hello World');
  const [computed, setComputed] = useState(false);
  const [inputError, setInputError] = useState('');
  const [selectedExample, setSelectedExample] = useState<HmacExample | null>(null);

  const [keyBytesHex, setKeyBytesHex] = useState('');
  const [normalizedKeyHex, setNormalizedKeyHex] = useState('');
  const [keyPadded, setKeyPadded] = useState('');
  const [ipadXor, setIpadXor] = useState('');
  const [opadXor, setOpadXor] = useState('');
  const [innerHash, setInnerHash] = useState('');
  const [outerHash, setOuterHash] = useState('');
  const [webCryptoHash, setWebCryptoHash] = useState('');

  async function doCompute() {
    setInputError('');
    setComputed(false);

    try {
      const keyBytes = encodeBytes(key, keyEncoding);
      const msgBytes = new TextEncoder().encode(message);
      const steps = computeHmacSha256Steps(keyBytes, msgBytes);

      setKeyBytesHex(steps.keyBytesHex);
      setNormalizedKeyHex(steps.normalizedKeyHex);
      setKeyPadded(steps.paddedKeyHex);
      setIpadXor(steps.ipadXorHex);
      setOpadXor(steps.opadXorHex);
      setInnerHash(steps.innerHash);
      setOuterHash(steps.outerHash);

      try {
        const sig = await hmacSHA256(keyBytes, msgBytes);
        setWebCryptoHash(bytesToHex(sig));
      } catch (error) {
      console.debug('Recovered from non-fatal error in src/components/pages/HMACWalkthrough.tsx:51.', error);
        setWebCryptoHash('Web Crypto HMAC unavailable');
      }

      setComputed(true);
    } catch (e) {
      console.debug('Recovered from non-fatal error in src/components/pages/HMACWalkthrough.tsx:56.', e);
      setInputError(e instanceof Error ? e.message : String(e));
    }
  }

  function loadExample(example: HmacExample) {
    setSelectedExample(example);
    setKey(example.key);
    setKeyEncoding(example.keyEncoding);
    setMessage(example.message);
    setInputError('');
    setComputed(false);
  }

  return (
    <div className="space-y-4">
      <Card className="bg-primary/5 border-primary/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">HMAC-SHA256 Step-by-Step</CardTitle>
          <CardDescription>
            HMAC(K, m) = H((K XOR opad) || H((K XOR ipad) || m)). The double-hash construction
            prevents hash length extension attacks that break naive H(key || message) schemes.
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="rounded-lg border bg-muted/30 p-4 text-sm space-y-2">
        <p className="font-semibold">The problem</p>
        <p className="text-muted-foreground">Using H(key || message) as a MAC is broken by length extension attacks on Merkle-Damgard hashes (SHA-256, SHA-512). An attacker who sees H(key || msg) can compute H(key || msg || padding || extra) without knowing the key. We need a secure way to combine a key with a hash function.</p>
        <p className="font-semibold mt-3">The insight</p>
        <p className="text-muted-foreground">HMAC uses two nested hash calls: H(K&oplus;opad || H(K&oplus;ipad || message)). The inner hash processes the message with one key derivative; the outer hash "seals" the result with another. This construction is provably secure (under standard assumptions about the hash function's compression function) even if the underlying hash has some structural weaknesses — the outer hash hides the internal state that length extension would exploit.</p>
      </div>

      <StepCard step={1} title="Input" status={computed ? 'complete' : 'active'}>
        <p className="text-xs text-muted-foreground">Enter any key and message. The walkthrough will show each intermediate value in the HMAC-SHA256 computation, then verify the result against the browser's native Web Crypto implementation.</p>
        <div className="rounded-lg border bg-muted/30 p-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground">Known vectors</span>
            {HMAC_EXAMPLES.map(example => (
              <Button
                key={example.id}
                type="button"
                size="xs"
                variant={selectedExample?.id === example.id ? 'default' : 'outline'}
                onClick={() => loadExample(example)}
              >
                {example.label}
              </Button>
            ))}
          </div>
          {selectedExample && (
            <p className="mt-2 text-[11px] text-muted-foreground">
              Source: {selectedExample.source}. Expected HMAC: <code className="break-all">{selectedExample.expectedHmac}</code>
            </p>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <ByteInput
            label="Key"
            value={key}
            encoding={keyEncoding}
            onValueChange={value => { setKey(value); setSelectedExample(null); }}
            onEncodingChange={encoding => { setKeyEncoding(encoding); setSelectedExample(null); }}
            textPlaceholder="mysecretkey"
            hexPlaceholder="0b0b0b0b..."
            helper="Hex bytes mode treats pasted HMAC outputs as raw key bytes."
          />
          <div>
            <Label className="text-xs">Message</Label>
            <Input
              value={message}
              onChange={e => { setMessage(e.target.value); setSelectedExample(null); }}
              className="font-mono"
            />
          </div>
        </div>
        <Button onClick={doCompute} className="w-full">Compute HMAC-SHA256</Button>
        {inputError && <p className="text-sm text-destructive">{inputError}</p>}
      </StepCard>

      {computed && (
        <>
          <StepCard step={2} title="Key Padding (to 64 bytes)" status="complete">
            <FormulaBox>
              <ComputationRow label={`Key input (${keyEncoding})`} value={key || '(empty)'} />
              <ComputationRow label="Key bytes (hex)" value={keyBytesHex || '(empty)'} />
              {normalizedKeyHex !== keyBytesHex && (
                <ComputationRow label="Hashed key (hex)" value={normalizedKeyHex} />
              )}
              <ComputationRow label="Padded key (64B)" value={keyPadded.substring(0, 40) + '...'} highlight />
              <p className="text-xs text-muted-foreground mt-1">
                If key &gt; 64 bytes: hash it first. If key &lt; 64 bytes: zero-pad to 64.
              </p>
            </FormulaBox>
          </StepCard>

          <StepCard step={3} title="XOR with ipad (0x36) and opad (0x5c)" status="complete">
            <FormulaBox>
              <ComputationRow label="K XOR ipad" value={ipadXor.substring(0, 40) + '...'} />
              <ComputationRow label="K XOR opad" value={opadXor.substring(0, 40) + '...'} />
              <p className="text-xs text-muted-foreground mt-1">
                ipad = 0x363636...36 (64 bytes). opad = 0x5c5c5c...5c (64 bytes).
                Different constants ensure inner and outer hashes are independent.
              </p>
            </FormulaBox>
          </StepCard>

          <StepCard step={4} title="Inner Hash: H((K XOR ipad) || message)" status="complete">
            <FormulaBox>
              <ComputationRow label="Inner hash" value={innerHash} highlight />
              <p className="text-xs text-muted-foreground mt-1">
                This hashes the key-derived pad concatenated with the message.
              </p>
            </FormulaBox>
          </StepCard>

          <StepCard step={5} title="Outer Hash: H((K XOR opad) || inner_hash)" status="complete">
            <FormulaBox>
              <ComputationRow label="HMAC result" value={outerHash} highlight />
              <p className="text-xs text-muted-foreground mt-1">
                This hashes the outer pad with the inner hash result. The double-hash
                means an attacker who sees the HMAC cannot extend it — the outer hash
                obscures the SHA-256 internal state from the inner computation.
              </p>
            </FormulaBox>
          </StepCard>

          <StepCard step={6} title="Verify with Web Crypto (constant-time)" status="complete">
            <FormulaBox>
              <ComputationRow label="Our HMAC" value={outerHash} />
              <ComputationRow label="Web Crypto HMAC" value={webCryptoHash} />
              {selectedExample && (
                <ComputationRow label="Expected vector" value={selectedExample.expectedHmac} />
              )}
              <div className="mt-2 pt-2 border-t flex items-center gap-2">
                <Badge variant={outerHash === webCryptoHash && (!selectedExample || outerHash === selectedExample.expectedHmac) ? 'default' : 'destructive'}>
                  {outerHash === webCryptoHash && (!selectedExample || outerHash === selectedExample.expectedHmac) ? 'MATCH' : 'MISMATCH'}
                </Badge>
              </div>
            </FormulaBox>

            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 text-xs text-green-600 dark:text-green-400">
              <p className="font-semibold">Why HMAC prevents length extension:</p>
              <p>H(key || message) exposes the internal state. But HMAC wraps the hash in a second hash
              with a different key-derived pad. An attacker who sees HMAC(K, m) gets the STATE of the outer hash,
              but that state depends on the inner hash output — which requires knowing K to compute.</p>
            </div>
          </StepCard>
        </>
      )}

      <div className="rounded-lg border bg-muted/30 p-4 text-xs text-muted-foreground space-y-2">
        <p className="font-semibold text-foreground text-sm">Limitations & real-world context</p>
        <p>This walkthrough implements HMAC-SHA256 step-by-step in JavaScript for educational clarity. In production, always use <code>crypto.subtle.sign('HMAC', ...)</code> or <code>crypto.createHmac()</code> — native implementations are constant-time and audited against timing side channels.</p>
        <p>HMAC is not the only way to build a secure MAC. KMAC (Keccak-based MAC) is simpler because SHA-3 is not vulnerable to length extension, so a single H(key || message) construction is already secure. CMAC uses a block cipher (AES) instead of a hash function.</p>
        <p>The ipad/opad constants (0x36, 0x5c) were chosen to have a large Hamming distance from each other, ensuring the two key derivatives are always different. The specific values are not cryptographically significant — any pair of distinct constants with good diffusion properties would work.</p>
      </div>
    </div>
  );
}
