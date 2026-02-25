import { Status, STATUS_COLORS } from '@/types/glossary';
import { cn } from '@/lib/utils';

export function StatusBadge({ status }: { status: Status }) {
  return (
    <span className={cn('inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold', STATUS_COLORS[status])}>
      {status}
    </span>
  );
}
