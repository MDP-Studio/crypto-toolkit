import { describe, expect, it } from 'vitest';
import { NAV_ITEMS } from '@/data/nav-items';
import { LEARNING_PATH_SCOPE_NOTICE, LEARNING_PATHS, findLearningPath } from '@/data/learning-paths';

describe('guided learning paths', () => {
  it('only references navigable pages and keeps every step in one path', () => {
    const validPages = new Set([...NAV_ITEMS.map(item => item.id), 'assurance']);
    const allSteps = LEARNING_PATHS.flatMap(path => path.steps.map(step => step.id));

    expect(LEARNING_PATHS.every(path => path.steps.length >= 5)).toBe(true);
    expect(allSteps.every(page => validPages.has(page))).toBe(true);
    expect(new Set(allSteps).size).toBe(allSteps.length);
  });

  it('resolves path position and preserves the production boundary', () => {
    const match = findLearningPath('aes-gcm');

    expect(match?.path.id).toBe('foundations');
    expect(match?.stepIndex).toBe(4);
    expect(LEARNING_PATH_SCOPE_NOTICE).toMatch(/not qualify.+production/i);
  });
});
