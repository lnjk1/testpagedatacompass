import { Category, CATEGORY_COLORS } from '@/types/glossary';
import { cn } from '@/lib/utils';

export function CategoryBadge({ category }: { category: Category }) {
  return (
    <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold', CATEGORY_COLORS[category])}>
      {category}
    </span>
  );
}
