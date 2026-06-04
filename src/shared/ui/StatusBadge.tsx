import { STATUS_LABELS } from '@/shared/lib/constants';
import { statusTone } from '@/shared/lib/format';
import type { SaleStatus } from '@/types';

export function StatusBadge({ status }: { status: SaleStatus }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${statusTone(status)}`}>
      {STATUS_LABELS[status]}
    </span>
  );
}
