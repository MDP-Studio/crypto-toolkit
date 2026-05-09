const STORAGE_KEY = 'crypto-toolkit:challenge-solves';

export function readSolvedChallengeIds(): Set<string> {
  if (typeof window === 'undefined') return new Set();

  try {
    const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '[]');
    return new Set(Array.isArray(parsed) ? parsed.filter(item => typeof item === 'string') : []);
  } catch {
    return new Set();
  }
}

export function writeSolvedChallengeIds(ids: Set<string>) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(ids).sort()));
}
