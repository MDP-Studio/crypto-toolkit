import { describe, expect, it } from 'vitest';
import { CHALLENGE_STAGES, CHALLENGES } from '@/data/challenges';
import { HMAC_EXAMPLES } from '@/lib/hmac-examples';

describe('challenge bank', () => {
  it('keeps challenge ids unique and attached to a known stage', () => {
    const ids = new Set(CHALLENGES.map(challenge => challenge.id));
    const stageIds = new Set(CHALLENGE_STAGES.map(stage => stage.id));

    expect(ids.size).toBe(CHALLENGES.length);
    expect(CHALLENGES.every(challenge => stageIds.has(challenge.stageId))).toBe(true);
  });

  it('keeps the staged practice bank balanced', () => {
    expect(CHALLENGE_STAGES).toHaveLength(6);
    expect(CHALLENGES).toHaveLength(30);

    for (const stage of CHALLENGE_STAGES) {
      expect(CHALLENGES.filter(challenge => challenge.stageId === stage.id)).toHaveLength(5);
    }
  });

  it('matches the RFC 4231 HMAC TC1 challenge answer to the shared vector', () => {
    const tc1 = HMAC_EXAMPLES.find(example => example.id === 'rfc4231-tc1');
    const challenge = CHALLENGES.find(item => item.id === 'hmac-rfc4231-case1');

    expect(challenge?.acceptedAnswers).toContain(tc1?.expectedHmac);
  });
});
