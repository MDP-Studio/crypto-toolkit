import { describe, expect, it } from 'vitest';
import {
  CRYPTO_AGILITY_SCENARIOS,
  CRYPTO_INVENTORY,
  scoreCryptoAgilityAnswers,
} from '@/data/crypto-agility';

describe('crypto-agility lab', () => {
  it('keeps inventory identifiers and migration boundaries explicit', () => {
    expect(CRYPTO_INVENTORY.length).toBeGreaterThanOrEqual(5);
    for (const item of CRYPTO_INVENTORY) {
      expect(item.algorithmId).toBeTruthy();
      expect(item.formatVersion).toContain('/');
      expect(item.owner).toBeTruthy();
      expect(item.boundary).toBeTruthy();
      expect(item.migrationTarget).toBeTruthy();
    }
    expect(CRYPTO_INVENTORY.find(item => item.id === 'backup-key-wrap')?.quantumExposure).toBe('prioritize');
    expect(CRYPTO_INVENTORY.find(item => item.id === 'customer-records')?.quantumExposure).toBe('none');
  });

  it('scores a complete safe migration plan', () => {
    const answers = Object.fromEntries(CRYPTO_AGILITY_SCENARIOS.map(scenario => [scenario.id, scenario.correctOptionId]));
    expect(scoreCryptoAgilityAnswers(answers)).toEqual({
      correct: CRYPTO_AGILITY_SCENARIOS.length,
      total: CRYPTO_AGILITY_SCENARIOS.length,
      percent: 100,
      complete: true,
      missedScenarioIds: [],
    });
  });

  it('keeps unanswered and unsafe decisions visible', () => {
    const result = scoreCryptoAgilityAnswers({
      'versioned-envelope': 'silent-swap',
      rollback: 'write-old',
    });
    expect(result.complete).toBe(false);
    expect(result.correct).toBe(0);
    expect(result.percent).toBe(0);
    expect(result.missedScenarioIds).toContain('versioned-envelope');
    expect(result.missedScenarioIds).toContain('harvest-now');
  });
});
