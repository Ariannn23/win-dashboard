import { SearchX } from 'lucide-react';

export function EmptyState({ title }: { title: string }) {
  return (
    <div className="grid min-h-[220px] place-items-center rounded-lg border border-dashed border-slate-300 bg-slate-50">
      <div className="text-center">
        <SearchX className="mx-auto h-9 w-9 text-slate-400" aria-hidden="true" />
        <p className="mt-3 text-sm font-semibold text-slate-700">{title}</p>
      </div>
    </div>
  );
}
