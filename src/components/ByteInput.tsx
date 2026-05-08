import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { ByteInputEncoding } from '@/lib/encoding';

interface ByteInputProps {
  label: string;
  value: string;
  encoding: ByteInputEncoding;
  onValueChange: (value: string) => void;
  onEncodingChange: (encoding: ByteInputEncoding) => void;
  textPlaceholder?: string;
  hexPlaceholder?: string;
  helper?: string;
}

export function ByteInput({
  label,
  value,
  encoding,
  onValueChange,
  onEncodingChange,
  textPlaceholder = 'text',
  hexPlaceholder = '0b0b...',
  helper,
}: ByteInputProps) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between gap-2">
        <Label className="text-xs">{label}</Label>
        <div className="flex gap-1" aria-label={`${label} encoding`}>
          <Button
            type="button"
            size="xs"
            variant={encoding === 'text' ? 'default' : 'outline'}
            aria-pressed={encoding === 'text'}
            onClick={() => onEncodingChange('text')}
          >
            Text
          </Button>
          <Button
            type="button"
            size="xs"
            variant={encoding === 'hex' ? 'default' : 'outline'}
            aria-pressed={encoding === 'hex'}
            onClick={() => onEncodingChange('hex')}
          >
            Hex bytes
          </Button>
        </div>
      </div>
      <Input
        value={value}
        onChange={e => onValueChange(e.target.value)}
        className="font-mono"
        placeholder={encoding === 'hex' ? hexPlaceholder : textPlaceholder}
      />
      {helper && <p className="text-[11px] text-muted-foreground">{helper}</p>}
    </div>
  );
}
