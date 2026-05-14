import { parseMathText } from '@/lib/math-text';

interface MathTextProps {
  text: string;
}

export function MathText({ text }: MathTextProps) {
  return (
    <>
      {parseMathText(text).map((part, index) => {
        if (part.kind === 'sup') {
          return <sup key={index} className="text-[0.72em] leading-none">{part.text}</sup>;
        }
        if (part.kind === 'sub') {
          return <sub key={index} className="text-[0.72em] leading-none">{part.text}</sub>;
        }
        return <span key={index}>{part.text}</span>;
      })}
    </>
  );
}
