import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ByteInput } from '@/components/ByteInput';
import { aesECBPKCS7Decrypt, aesECBPKCS7Encrypt, bytesToHexAES } from '@/lib/aes-math';
import { caesarCipher, vigenereCipher, rot13, atbashCipher } from '@/lib/crypto-math';
import { bytesToHex, encodeBytes, parseHexBytes, type ByteInputEncoding } from '@/lib/encoding';
import { computeHmacSha1Hex } from '@/lib/hmac';
import { hmacSHA256 } from '@/lib/web-crypto';

type CiphertextEncoding = 'hex' | 'base64';

interface DocumentIdCryptoResult {
  hmacSha1Hex: string;
  hmacSha1Base64: string;
  hmacSha256Hex: string;
  aesCiphertextHex: string;
  aesCiphertextBase64: string;
  aesRoundTrip: string;
  blockCount: number;
}

function bytesToBase64(bytes: ArrayLike<number>): string {
  let binary = '';
  for (const byte of Array.from(bytes)) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary);
}

function base64ToBytes(input: string): Uint8Array {
  try {
    const binary = atob(input.trim());
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  } catch {
    throw new Error('Ciphertext must be valid base64.');
  }
}

function decodeUtf8(bytes: ArrayLike<number>): string {
  return new TextDecoder('utf-8', { fatal: true }).decode(new Uint8Array(Array.from(bytes)));
}

export function CipherTools() {
  // Caesar
  const [caesarInput, setCaesarInput] = useState('');
  const [caesarShift, setCaesarShift] = useState('3');
  const [caesarResult, setCaesarResult] = useState('');
  const [caesarMode, setCaesarMode] = useState<'encrypt' | 'decrypt'>('encrypt');

  // Vigenere
  const [vigInput, setVigInput] = useState('');
  const [vigKey, setVigKey] = useState('');
  const [vigResult, setVigResult] = useState('');
  const [vigMode, setVigMode] = useState<'encrypt' | 'decrypt'>('encrypt');

  // ROT13 / Atbash
  const [rotInput, setRotInput] = useState('');
  const [rotResult, setRotResult] = useState('');

  // Caesar brute force
  const [bruteInput, setBruteInput] = useState('');
  const [bruteResults, setBruteResults] = useState<{ shift: number; text: string }[]>([]);

  // Frequency analysis
  const [freqInput, setFreqInput] = useState('');
  const [freqResult, setFreqResult] = useState<{ char: string; count: number; pct: string }[]>([]);

  // Document ID compatibility helpers
  const [docIdInput, setDocIdInput] = useState('DOC-2026-00042');
  const [docHmacKey, setDocHmacKey] = useState('partner-shared-secret');
  const [docHmacKeyEncoding, setDocHmacKeyEncoding] = useState<ByteInputEncoding>('text');
  const [docAesKey, setDocAesKey] = useState('00112233445566778899aabbccddeeff');
  const [docAesKeyEncoding, setDocAesKeyEncoding] = useState<ByteInputEncoding>('hex');
  const [docCiphertext, setDocCiphertext] = useState('');
  const [docCiphertextEncoding, setDocCiphertextEncoding] = useState<CiphertextEncoding>('hex');
  const [docCryptoResult, setDocCryptoResult] = useState<DocumentIdCryptoResult | null>(null);
  const [docDecryptResult, setDocDecryptResult] = useState('');
  const [docCryptoError, setDocCryptoError] = useState('');

  function doCaesar() {
    const shift = parseInt(caesarShift) || 0;
    setCaesarResult(caesarCipher(caesarInput, shift, caesarMode === 'decrypt'));
  }

  function doVigenere() {
    setVigResult(vigenereCipher(vigInput, vigKey, vigMode === 'decrypt'));
  }

  function doRot() {
    setRotResult(`ROT13: ${rot13(rotInput)}\nAtbash: ${atbashCipher(rotInput)}`);
  }

  function doBruteForce() {
    const results: { shift: number; text: string }[] = [];
    for (let i = 0; i < 26; i++) {
      results.push({ shift: i, text: caesarCipher(bruteInput, i, true) });
    }
    setBruteResults(results);
  }

  function doFrequency() {
    const counts: Record<string, number> = {};
    let total = 0;
    for (const c of freqInput.toUpperCase()) {
      if (c >= 'A' && c <= 'Z') {
        counts[c] = (counts[c] || 0) + 1;
        total++;
      }
    }
    const result = Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([char, count]) => ({
        char,
        count,
        pct: total > 0 ? ((count / total) * 100).toFixed(1) + '%' : '0%',
      }));
    setFreqResult(result);
  }

  async function doDocumentIdCrypto() {
    setDocCryptoError('');
    setDocDecryptResult('');
    try {
      const documentIdBytes = encodeBytes(docIdInput, 'text');
      const hmacKeyBytes = encodeBytes(docHmacKey, docHmacKeyEncoding);
      const aesKeyBytes = encodeBytes(docAesKey, docAesKeyEncoding);

      const hmacSha1Hex = await computeHmacSha1Hex(hmacKeyBytes, documentIdBytes);
      const hmacSha256Hex = bytesToHex(await hmacSHA256(hmacKeyBytes, documentIdBytes));
      const aesCiphertext = aesECBPKCS7Encrypt(documentIdBytes, aesKeyBytes);
      const aesPlaintext = aesECBPKCS7Decrypt(aesCiphertext, aesKeyBytes);

      const aesCiphertextHex = bytesToHexAES(aesCiphertext);
      setDocCiphertext(aesCiphertextHex);
      setDocCiphertextEncoding('hex');
      setDocCryptoResult({
        hmacSha1Hex,
        hmacSha1Base64: bytesToBase64(parseHexBytes(hmacSha1Hex)),
        hmacSha256Hex,
        aesCiphertextHex,
        aesCiphertextBase64: bytesToBase64(aesCiphertext),
        aesRoundTrip: decodeUtf8(aesPlaintext),
        blockCount: aesCiphertext.length / 16,
      });
    } catch (e) {
      console.debug('Recovered from document ID crypto calculation error.', e);
      setDocCryptoResult(null);
      setDocCryptoError(e instanceof Error ? e.message : String(e));
    }
  }

  function doDocumentIdDecrypt() {
    setDocCryptoError('');
    setDocDecryptResult('');
    try {
      const aesKeyBytes = encodeBytes(docAesKey, docAesKeyEncoding);
      const ciphertextBytes = docCiphertextEncoding === 'hex'
        ? parseHexBytes(docCiphertext)
        : base64ToBytes(docCiphertext);
      const plaintextBytes = aesECBPKCS7Decrypt(ciphertextBytes, aesKeyBytes);
      setDocDecryptResult(decodeUtf8(plaintextBytes));
    } catch (e) {
      console.debug('Recovered from document ID decrypt error.', e);
      setDocCryptoError(e instanceof Error ? e.message : String(e));
    }
  }

  return (
    <div className="space-y-6">
      <Card className="bg-primary/5 border-primary/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Cipher & Document ID Tools</CardTitle>
          <CardDescription>
            Classical ciphers plus document-ID compatibility helpers for HMAC-SHA1 and AES-128-ECB with PKCS#7 padding.
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="rounded-lg border bg-muted/30 p-4 text-sm space-y-2">
        <p className="font-semibold">The problem</p>
        <p className="text-muted-foreground">Classical ciphers teach why weak substitution leaks structure. Legacy integrations can also force deterministic document-ID signing or encryption formats that need careful byte-level verification.</p>
        <p className="font-semibold mt-3">The insight</p>
        <p className="text-muted-foreground">Caesar and Vigenere show frequency leakage. HMAC-SHA1 shows keyed integrity for compatibility. AES-ECB/PKCS#7 shows a deterministic block-encryption envelope, useful for matching older systems but not recommended for new confidential storage.</p>
      </div>

      <Tabs defaultValue="caesar">
        <TabsList className="w-full flex flex-wrap h-auto justify-start">
          <TabsTrigger value="caesar">Caesar</TabsTrigger>
          <TabsTrigger value="vigenere">Vigenere</TabsTrigger>
          <TabsTrigger value="rot13">ROT13/Atbash</TabsTrigger>
          <TabsTrigger value="docid">Doc IDs</TabsTrigger>
          <TabsTrigger value="analysis">Analysis</TabsTrigger>
        </TabsList>

        {/* Caesar */}
        <TabsContent value="caesar">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Caesar Cipher</CardTitle>
                <CardDescription>Shift each letter by a fixed amount</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-2">
                  <Badge
                    variant={caesarMode === 'encrypt' ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => setCaesarMode('encrypt')}
                  >
                    Encrypt
                  </Badge>
                  <Badge
                    variant={caesarMode === 'decrypt' ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => setCaesarMode('decrypt')}
                  >
                    Decrypt
                  </Badge>
                </div>
                <div>
                  <Label>Text</Label>
                  <Textarea value={caesarInput} onChange={e => setCaesarInput(e.target.value)} rows={3} className="font-mono" placeholder="Enter text..." />
                </div>
                <div>
                  <Label>Shift (0-25)</Label>
                  <Input value={caesarShift} onChange={e => setCaesarShift(e.target.value)} className="font-mono w-24" placeholder="3" />
                </div>
                <Button onClick={doCaesar} className="w-full">
                  {caesarMode === 'encrypt' ? 'Encrypt' : 'Decrypt'}
                </Button>
                {caesarResult && (
                  <div className="rounded-md border bg-muted/50 p-3">
                    <Label className="text-xs text-muted-foreground">Result</Label>
                    <p className="font-mono text-sm whitespace-pre-wrap">{caesarResult}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Brute Force</CardTitle>
                <CardDescription>Try all 26 shifts to find the plaintext</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label>Ciphertext</Label>
                  <Textarea value={bruteInput} onChange={e => setBruteInput(e.target.value)} rows={2} className="font-mono" placeholder="Encrypted text..." />
                </div>
                <Button onClick={doBruteForce} className="w-full">Brute Force All Shifts</Button>
                {bruteResults.length > 0 && (
                  <div className="max-h-72 overflow-auto space-y-1">
                    {bruteResults.map(({ shift, text }) => (
                      <div key={shift} className="flex items-center gap-2 text-sm font-mono py-0.5">
                        <Badge variant="outline" className="text-xs w-12 justify-center shrink-0">{shift}</Badge>
                        <span className="truncate">{text}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Vigenere */}
        <TabsContent value="vigenere">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Vigenere Cipher</CardTitle>
              <CardDescription>Polyalphabetic substitution using a keyword</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <Badge
                  variant={vigMode === 'encrypt' ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => setVigMode('encrypt')}
                >
                  Encrypt
                </Badge>
                <Badge
                  variant={vigMode === 'decrypt' ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => setVigMode('decrypt')}
                >
                  Decrypt
                </Badge>
              </div>
              <div>
                <Label>Text</Label>
                <Textarea value={vigInput} onChange={e => setVigInput(e.target.value)} rows={3} className="font-mono" placeholder="Enter text..." />
              </div>
              <div>
                <Label>Key</Label>
                <Input value={vigKey} onChange={e => setVigKey(e.target.value)} className="font-mono" placeholder="SECRET" />
              </div>
              <Button onClick={doVigenere} className="w-full">
                {vigMode === 'encrypt' ? 'Encrypt' : 'Decrypt'}
              </Button>
              {vigResult && (
                <div className="rounded-md border bg-muted/50 p-3">
                  <Label className="text-xs text-muted-foreground">Result</Label>
                  <p className="font-mono text-sm whitespace-pre-wrap">{vigResult}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ROT13 / Atbash */}
        <TabsContent value="rot13">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">ROT13 & Atbash</CardTitle>
              <CardDescription>Quick substitution ciphers</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label>Text</Label>
                <Textarea value={rotInput} onChange={e => setRotInput(e.target.value)} rows={3} className="font-mono" placeholder="Enter text..." />
              </div>
              <Button onClick={doRot} className="w-full">Transform</Button>
              {rotResult && (
                <div className="rounded-md border bg-muted/50 p-3">
                  <p className="font-mono text-sm whitespace-pre-wrap">{rotResult}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Document ID compatibility helpers */}
        <TabsContent value="docid">
          <div className="grid grid-cols-1 xl:grid-cols-[1fr_1fr] gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Document ID Tokens</CardTitle>
                <CardDescription>Generate HMAC-SHA1 and AES-128-ECB/PKCS#7 values for a document ID.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Document ID</Label>
                  <Input
                    value={docIdInput}
                    onChange={e => setDocIdInput(e.target.value)}
                    className="font-mono"
                    placeholder="DOC-2026-00042"
                  />
                </div>
                <ByteInput
                  label="HMAC key"
                  value={docHmacKey}
                  encoding={docHmacKeyEncoding}
                  onValueChange={setDocHmacKey}
                  onEncodingChange={setDocHmacKeyEncoding}
                  textPlaceholder="partner-shared-secret"
                  hexPlaceholder="706172746e65722d7368617265642d736563726574"
                  helper="Used for both HMAC-SHA1 and HMAC-SHA256 comparison."
                />
                <ByteInput
                  label="AES-128 key"
                  value={docAesKey}
                  encoding={docAesKeyEncoding}
                  onValueChange={setDocAesKey}
                  onEncodingChange={setDocAesKeyEncoding}
                  textPlaceholder="16-byte-key-here"
                  hexPlaceholder="00112233445566778899aabbccddeeff"
                  helper="Must resolve to exactly 16 bytes. No key derivation is applied."
                />
                <Button onClick={doDocumentIdCrypto} className="w-full">Generate Document ID Values</Button>
                {docCryptoError && <p className="text-sm text-destructive">{docCryptoError}</p>}
                <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-3 text-xs text-yellow-700 dark:text-yellow-300">
                  ECB is deterministic: equal document ID blocks encrypt to equal ciphertext blocks. Keep this for compatibility testing, not new system design.
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Outputs</CardTitle>
                <CardDescription>Hex and base64 forms for copy-safe integration checks.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {docCryptoResult ? (
                  <>
                    <div className="rounded-md border bg-muted/50 p-3 space-y-1">
                      <Label className="text-xs text-muted-foreground">HMAC-SHA1 hex</Label>
                      <p className="font-mono text-xs break-all">{docCryptoResult.hmacSha1Hex}</p>
                      <Label className="text-xs text-muted-foreground">HMAC-SHA1 base64</Label>
                      <p className="font-mono text-xs break-all">{docCryptoResult.hmacSha1Base64}</p>
                    </div>
                    <div className="rounded-md border bg-muted/50 p-3 space-y-1">
                      <Label className="text-xs text-muted-foreground">HMAC-SHA256 hex</Label>
                      <p className="font-mono text-xs break-all">{docCryptoResult.hmacSha256Hex}</p>
                    </div>
                    <div className="rounded-md border bg-muted/50 p-3 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Label className="text-xs text-muted-foreground">AES-128-ECB/PKCS#7 ciphertext</Label>
                        <Badge variant="outline">{docCryptoResult.blockCount} block{docCryptoResult.blockCount === 1 ? '' : 's'}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">Hex</p>
                      <p className="font-mono text-xs break-all">{docCryptoResult.aesCiphertextHex}</p>
                      <p className="text-xs text-muted-foreground">Base64</p>
                      <p className="font-mono text-xs break-all">{docCryptoResult.aesCiphertextBase64}</p>
                      <p className="text-xs text-muted-foreground">Decrypt check</p>
                      <p className="font-mono text-xs break-all">{docCryptoResult.aesRoundTrip}</p>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">Generate values to see HMAC and AES outputs.</p>
                )}
              </CardContent>
            </Card>

            <Card className="xl:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg">Decrypt AES-128-ECB/PKCS#7</CardTitle>
                <CardDescription>Paste a generated or external ciphertext and decode it with the AES key above.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-2">
                  <Badge
                    variant={docCiphertextEncoding === 'hex' ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => setDocCiphertextEncoding('hex')}
                  >
                    Hex
                  </Badge>
                  <Badge
                    variant={docCiphertextEncoding === 'base64' ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => setDocCiphertextEncoding('base64')}
                  >
                    Base64
                  </Badge>
                </div>
                <Textarea
                  value={docCiphertext}
                  onChange={e => setDocCiphertext(e.target.value)}
                  rows={3}
                  className="font-mono"
                  placeholder={docCiphertextEncoding === 'hex' ? 'ciphertext hex...' : 'ciphertext base64...'}
                />
                <Button onClick={doDocumentIdDecrypt} variant="outline" className="w-full">Decrypt Ciphertext</Button>
                {docDecryptResult && (
                  <div className="rounded-md border bg-muted/50 p-3">
                    <Label className="text-xs text-muted-foreground">Plaintext document ID</Label>
                    <p className="font-mono text-sm break-all">{docDecryptResult}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Frequency Analysis */}
        <TabsContent value="analysis">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Frequency Analysis</CardTitle>
              <CardDescription>Count letter frequencies to help break substitution ciphers</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label>Ciphertext</Label>
                <Textarea value={freqInput} onChange={e => setFreqInput(e.target.value)} rows={4} className="font-mono" placeholder="Paste ciphertext here..." />
              </div>
              <Button onClick={doFrequency} className="w-full">Analyze Frequencies</Button>
              {freqResult.length > 0 && (
                <div className="space-y-2">
                  <div className="grid grid-cols-7 sm:grid-cols-13 gap-1">
                    {freqResult.map(({ char, pct }) => (
                      <div key={char} className="text-center">
                        <div
                          className="bg-primary/20 rounded-t mx-auto w-6"
                          style={{ height: `${Math.max(4, parseFloat(pct) * 3)}px` }}
                        />
                        <span className="text-xs font-mono font-bold">{char}</span>
                        <span className="text-xs text-muted-foreground block">{pct}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    English letter frequency order: E T A O I N S H R D L C U M W F G Y P B V K J X Q Z
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
