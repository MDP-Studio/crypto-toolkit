export type MathTextPart = {
  kind: 'text' | 'sup' | 'sub';
  text: string;
};

const STOP_CHARS = new Set([' ', '\t', '\n', '\r', '+', '-', '*', '/', '=', '<', '>', ',', '.', ';', ':', '|', '(', ')', '[', ']', '}']);

function pushPart(parts: MathTextPart[], kind: MathTextPart['kind'], text: string) {
  if (!text) return;
  const previous = parts[parts.length - 1];
  if (previous?.kind === kind) {
    previous.text += text;
    return;
  }
  parts.push({ kind, text });
}

function readGrouped(input: string, start: number, open: string, close: string) {
  let depth = 1;
  for (let index = start + 1; index < input.length; index++) {
    if (input[index] === open) depth++;
    if (input[index] === close) depth--;
    if (depth === 0) {
      return {
        text: input.slice(start + 1, index),
        end: index + 1,
      };
    }
  }

  return null;
}

function readScript(input: string, start: number) {
  const next = input[start];
  if (next === undefined) return null;

  if (next === '(') return readGrouped(input, start, '(', ')');
  if (next === '{') return readGrouped(input, start, '{', '}');

  let end = start;
  if ((input[end] === '-' || input[end] === '+') && input[end + 1] && !STOP_CHARS.has(input[end + 1])) {
    end++;
  }
  while (end < input.length && !STOP_CHARS.has(input[end])) end++;
  if (end === start) return null;

  return {
    text: input.slice(start, end),
    end,
  };
}

export function parseMathText(input: string): MathTextPart[] {
  const parts: MathTextPart[] = [];
  let textBuffer = '';
  let index = 0;

  while (index < input.length) {
    const char = input[index];
    const scriptKind = char === '^' ? 'sup' : char === '_' ? 'sub' : null;

    if (scriptKind) {
      const script = readScript(input, index + 1);
      if (script) {
        pushPart(parts, 'text', textBuffer);
        textBuffer = '';
        pushPart(parts, scriptKind, script.text);
        index = script.end;
        continue;
      }
    }

    textBuffer += char;
    index++;
  }

  pushPart(parts, 'text', textBuffer);
  return parts;
}
