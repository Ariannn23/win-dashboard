export function SkeletonBlock({ className }: { className?: string }) {
  return <div className={['animate-pulse rounded-[14px] bg-[#F1E3DA]', className].filter(Boolean).join(' ')} />;
}

export function CardsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: count }, (_, index) => (
        <article key={index} className="rounded-[20px] border border-[#EDE4DC] bg-white p-5 shadow-[0_14px_34px_rgba(91,47,20,0.045)]">
          <div className="flex items-center gap-4">
            <SkeletonBlock className="h-12 w-12 rounded-full" />
            <div className="flex-1 space-y-2">
              <SkeletonBlock className="h-3 w-24" />
              <SkeletonBlock className="h-7 w-28" />
              <SkeletonBlock className="h-3 w-20" />
            </div>
          </div>
        </article>
      ))}
    </section>
  );
}

export function TableSkeleton({ rows = 6, columns = 6 }: { rows?: number; columns?: number }) {
  return (
    <section className="overflow-hidden rounded-[20px] border border-[#EDE4DC] bg-white shadow-[0_14px_34px_rgba(91,47,20,0.045)]">
      <div className="border-b border-[#EDE4DC] bg-[#FFF8F3] px-5 py-4">
        <SkeletonBlock className="h-4 w-44" />
      </div>
      <div className="divide-y divide-[#F3EAE3]">
        {Array.from({ length: rows }, (_, rowIndex) => (
          <div key={rowIndex} className="grid gap-4 px-5 py-4" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
            {Array.from({ length: columns }, (_, columnIndex) => (
              <SkeletonBlock key={columnIndex} className="h-4 w-full" />
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}

export function PageSkeleton({ cards = 4, tableRows = 6, tableColumns = 6 }: { cards?: number; tableRows?: number; tableColumns?: number }) {
  return (
    <div className="space-y-6">
      <section className="flex flex-col justify-between gap-4 xl:flex-row xl:items-end">
        <div className="space-y-3">
          <SkeletonBlock className="h-8 w-52" />
          <SkeletonBlock className="h-4 w-80 max-w-full" />
        </div>
        <SkeletonBlock className="h-11 w-36" />
      </section>
      <CardsSkeleton count={cards} />
      <section className="rounded-[20px] border border-[#EDE4DC] bg-white p-5 shadow-[0_14px_34px_rgba(91,47,20,0.045)]">
        <div className="grid gap-4 md:grid-cols-4">
          <SkeletonBlock className="h-12 md:col-span-2" />
          <SkeletonBlock className="h-12" />
          <SkeletonBlock className="h-12" />
        </div>
      </section>
      <TableSkeleton rows={tableRows} columns={tableColumns} />
    </div>
  );
}
