import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  accent: string;
}

export function StatCard({ title, value, icon: Icon, accent }: StatCardProps) {
  return (
    <section className="rounded-lg border border-win-line bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-2 text-3xl font-semibold text-win-ink">{value}</p>
        </div>
        <div className={`grid h-11 w-11 place-items-center rounded-lg ${accent}`}>
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
      </div>
    </section>
  );
}
