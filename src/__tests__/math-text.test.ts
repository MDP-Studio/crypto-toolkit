import { describe, expect, it } from 'vitest';
import { parseMathText } from '@/lib/math-text';

describe('math text parser', () => {
  it('turns caret powers into superscript parts', () => {
    expect(parseMathText('f(x) = 197 + 41x + 11x^2 mod 257')).toEqual([
      { kind: 'text', text: 'f(x) = 197 + 41x + 11x' },
      { kind: 'sup', text: '2' },
      { kind: 'text', text: ' mod 257' },
    ]);
  });

  it('supports grouped exponents and subscripts', () => {
    expect(parseMathText('AES_K(0^128), B = 2^(8*(4-2))')).toEqual([
      { kind: 'text', text: 'AES' },
      { kind: 'sub', text: 'K' },
      { kind: 'text', text: '(0' },
      { kind: 'sup', text: '128' },
      { kind: 'text', text: '), B = 2' },
      { kind: 'sup', text: '8*(4-2)' },
    ]);
  });

  it('keeps signed exponents together', () => {
    expect(parseMathText('r^-1 mod q')).toEqual([
      { kind: 'text', text: 'r' },
      { kind: 'sup', text: '-1' },
      { kind: 'text', text: ' mod q' },
    ]);
  });

  it('leaves dangling script markers as text', () => {
    expect(parseMathText('x^ + y_')).toEqual([{ kind: 'text', text: 'x^ + y_' }]);
  });
});
