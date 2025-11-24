import { memo } from 'react';

interface TextCellProps {
  text: string | number | null | undefined;
  secondary?: string;
  className?: string;
  fallback?: string;
}

export const TextCell = memo<TextCellProps>(function TextCell({
  text,
  secondary,
  className = '',
  fallback = '-',
}) {
  return (
    <div className={className}>
      <div className="font-medium">{text ?? fallback}</div>
      {secondary && <div className="text-sm text-gray-500">{secondary}</div>}
    </div>
  );
});
