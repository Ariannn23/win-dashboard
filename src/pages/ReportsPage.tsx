import {
  BarChart3,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Download,
  Eraser,
  FileText,
  Filter,
  Timer,
  TrendingUp,
  Trophy,
  UsersRound,
  WalletCards,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/app/providers/AuthProvider';
import { useCrm } from '@/app/providers/CrmProvider';
import { formatMoney, monthKey, percentChange } from '@/shared/lib/format';
import { planGroup, saleAmount } from '@/shared/lib/sales';
import { ComboBox, type SelectOption } from '@/shared/ui/FormControls';
import { PAGE_SIZE, Pagination } from '@/shared/ui/Pagination';
import { PageSkeleton } from '@/shared/ui/Skeleton';
import { useToast } from '@/shared/ui/Toast';

type ReportType = 'VENTAS' | 'CLIENTES' | 'ASESORES' | 'PLANES';

const monthLabels = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
const fullMonthLabels = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];

function previousMonthKeys(keys: string[]) {
  return keys.map((key) => {
    const [year, month] = key.split('-').map(Number);
    const date = new Date(year, month - 2, 1);
    return monthKey(date);
  });
}

export function ReportsPage() {
  const { user } = useAuth();
  const { isLoading, profiles, visibleSales } = useCrm();
  const { showToast } = useToast();
  const now = new Date();
  const currentYear = now.getFullYear();
  const defaultMonth = monthKey(now);
  const [months, setMonths] = useState<string[]>([defaultMonth]);
  const [reportType, setReportType] = useState<ReportType>('VENTAS');
  const [advisor, setAdvisor] = useState('TODOS');
  const [monthWindow, setMonthWindow] = useState(Math.floor(now.getMonth() / 3) * 3);
  const [page, setPage] = useState(1);

  if (!user) return null;
  if (isLoading) return <PageSkeleton cards={5} tableRows={5} tableColumns={7} />;

  const sales = visibleSales(user);
  const monthOptions = Array.from({ length: 12 }, (_, index) => `${currentYear}-${String(index + 1).padStart(2, '0')}`);
  const districts = Array.from(new Set(sales.map((sale) => sale.distrito))).sort();
  const supervisors = profiles.filter((profile) => profile.rol === 'SUPERVISOR');
  const advisors = profiles.filter((profile) => profile.rol === 'ASESOR');

  const scopedSales = useMemo(() => {
    return sales.filter((sale) => {
      const matchesAdvisor = advisor === 'TODOS' || sale.asesor_id === advisor;
      return matchesAdvisor;
    });
  }, [advisor, sales]);

  const filteredSales = useMemo(() => {
    return scopedSales.filter((sale) => months.includes(monthKey(new Date(sale.created_at))));
  }, [months, scopedSales]);

  const previousSales = useMemo(() => {
    const previousKeys = previousMonthKeys(months);
    return scopedSales.filter((sale) => {
      const createdMonth = monthKey(new Date(sale.created_at));
      const matchesMonth = previousKeys.includes(createdMonth);
      return matchesMonth;
    });
  }, [months, scopedSales]);

  const report = useMemo(() => {
    const totalRevenue = filteredSales.reduce((sum, sale) => sum + saleAmount(sale), 0);
    const previousRevenue = previousSales.reduce((sum, sale) => sum + saleAmount(sale), 0);
    const completed = filteredSales.filter((sale) => sale.estado === 'INSTALADO').length;
    const previousCompleted = previousSales.filter((sale) => sale.estado === 'INSTALADO').length;
    const conversion = filteredSales.length ? (completed / filteredSales.length) * 100 : 0;
    const previousConversion = previousSales.length
      ? (previousCompleted / previousSales.length) * 100
      : 0;
    const avgTicket = filteredSales.length ? totalRevenue / filteredSales.length : 0;
    const previousAvgTicket = previousSales.length ? previousRevenue / previousSales.length : 0;
    const pendingRevenue = filteredSales
      .filter((sale) => sale.estado !== 'INSTALADO' && sale.estado !== 'CANCELADO' && sale.estado !== 'RECHAZADO')
      .reduce((sum, sale) => sum + saleAmount(sale), 0);
    const previousPendingRevenue = previousSales
      .filter((sale) => sale.estado !== 'INSTALADO' && sale.estado !== 'CANCELADO' && sale.estado !== 'RECHAZADO')
      .reduce((sum, sale) => sum + saleAmount(sale), 0);

    return {
      totalRevenue,
      completed,
      conversion,
      avgTicket,
      pendingRevenue,
      revenueChange: percentChange(totalRevenue, previousRevenue),
      completedChange: percentChange(completed, previousCompleted),
      conversionChange: conversion - previousConversion,
      avgTicketChange: percentChange(avgTicket, previousAvgTicket),
      pendingChange: percentChange(pendingRevenue, previousPendingRevenue),
    };
  }, [filteredSales, previousSales]);

  const monthlyRows = useMemo(() => {
    return monthOptions.map((key, index) => {
      const monthSales = scopedSales.filter((sale) => monthKey(new Date(sale.created_at)) === key);
      const revenue = monthSales.reduce((sum, sale) => sum + saleAmount(sale), 0);
      const completed = monthSales.filter((sale) => sale.estado === 'INSTALADO').length;
      const pending = monthSales.filter((sale) => sale.estado !== 'INSTALADO').length;
      return {
        key,
        label: monthLabels[index] ?? fullMonthLabels[index],
        sales: monthSales.length,
        clients: new Set(monthSales.map((sale) => sale.numero_documento)).size,
        revenue,
        completed,
        pending,
        conversion: monthSales.length ? (completed / monthSales.length) * 100 : 0,
      };
    });
  }, [monthOptions, scopedSales]);

  const selectedMonthRows = monthlyRows.filter((row) => months.includes(row.key));
  const advisorRows = profiles
    .filter((p) => p.rol === 'ASESOR')
    .map((profile) => {
      const profileSales = filteredSales.filter((sale) => sale.asesor_id === profile.id);
      return {
        name: profile.nombres,
        sales: profileSales.length,
        revenue: profileSales.reduce((sum, sale) => sum + saleAmount(sale), 0),
      };
    })
    .sort((a, b) => b.sales - a.sales);

  const districtRows = Array.from(
    filteredSales.reduce((map, sale) => {
      const key = sale.distrito || 'Sin distrito';
      const current = map.get(key) ?? { name: key, sales: 0, revenue: 0 };
      current.sales += 1;
      current.revenue += saleAmount(sale);
      map.set(key, current);
      return map;
    }, new Map<string, { name: string; sales: number; revenue: number }>()),
  )
    .map(([, value]) => value)
    .sort((a, b) => b.sales - a.sales);

  const planRows = Array.from(
    filteredSales.reduce((map, sale) => {
      const key = planGroup(sale.plan_contratar);
      const current = map.get(key) ?? { name: key, sales: 0, revenue: 0 };
      current.sales += 1;
      current.revenue += saleAmount(sale);
      map.set(key, current);
      return map;
    }, new Map<string, { name: string; sales: number; revenue: number }>()),
  )
    .map(([, value]) => value)
    .sort((a, b) => b.sales - a.sales);

  const exportRows = selectedMonthRows.length ? selectedMonthRows : monthlyRows;
  const totalPages = Math.max(1, Math.ceil(exportRows.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pagedExportRows = exportRows.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const selectedLabel = months
    .slice()
    .sort()
    .map((key) => {
      const monthIndex = Number(key.split('-')[1]) - 1;
      return fullMonthLabels[monthIndex];
    })
    .join(', ');

  const toggleMonth = (key: string) => {
    setMonths((current) => {
      if (current.includes(key) && current.length > 1) return current.filter((item) => item !== key);
      if (current.includes(key)) return current;
      return [...current, key].sort();
    });
  };

  useEffect(() => {
    setPage(1);
  }, [advisor, months, reportType]);

  const exportCsv = () => {
    const header = ['Mes', 'Ventas', 'Clientes nuevos', 'Monto vendido', 'Completadas', 'Pendientes', 'Conversion'];
    const body = exportRows.map((row) => [
      row.label,
      row.sales,
      row.clients,
      row.revenue.toFixed(2),
      row.completed,
      row.pending,
      `${row.conversion.toFixed(1)}%`,
    ]);
    const csv = [header, ...body]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `reporte-${currentYear}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    showToast({ title: 'CSV generado', detail: 'El reporte se descargo correctamente.', tone: 'success' });
  };

  const exportPdf = () => {
    const htmlRows = exportRows
      .map(
        (row) => `
          <tr>
            <td>${row.label}</td>
            <td>${row.sales}</td>
            <td>${row.clients}</td>
            <td>${formatMoney(row.revenue)}</td>
            <td>${row.completed}</td>
            <td>${row.pending}</td>
            <td>${row.conversion.toFixed(1)}%</td>
          </tr>
        `,
      )
      .join('');
    const popup = window.open('', '_blank', 'width=960,height=720');
    if (!popup) {
      showToast({ title: 'No se pudo abrir el PDF', detail: 'Permite ventanas emergentes para exportar.', tone: 'warning' });
      return;
    }
    popup.document.write(`
      <html>
        <head>
          <title>Reporte comercial</title>
          <style>
            body { font-family: Arial, sans-serif; color: #1f1f1f; padding: 28px; }
            h1 { color: #c94a00; margin-bottom: 4px; }
            .muted { color: #6b625c; margin-top: 0; }
            .kpis { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin: 24px 0; }
            .kpi { border: 1px solid #eadbd0; border-radius: 12px; padding: 14px; }
            .kpi span { color: #6b625c; font-size: 12px; font-weight: 700; text-transform: uppercase; }
            .kpi strong { display: block; font-size: 20px; margin-top: 6px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 12px; }
            th, td { border-bottom: 1px solid #eadbd0; padding: 10px; text-align: left; }
            th { background: #fff2e7; color: #4b3024; text-transform: uppercase; font-size: 10px; }
          </style>
        </head>
        <body>
          <h1>Reporte comercial</h1>
          <p class="muted">Periodo: ${selectedLabel || 'Sin seleccion'}</p>
          <section class="kpis">
            <div class="kpi"><span>Ventas totales</span><strong>${formatMoney(report.totalRevenue)}</strong></div>
            <div class="kpi"><span>Completadas</span><strong>${report.completed}</strong></div>
            <div class="kpi"><span>Conversion</span><strong>${report.conversion.toFixed(1)}%</strong></div>
            <div class="kpi"><span>Ticket promedio</span><strong>${formatMoney(report.avgTicket)}</strong></div>
          </section>
          <table>
            <thead>
              <tr><th>Mes</th><th>Ventas</th><th>Clientes</th><th>Monto</th><th>Completadas</th><th>Pendientes</th><th>Conversion</th></tr>
            </thead>
            <tbody>${htmlRows}</tbody>
          </table>
          <script>window.print();</script>
        </body>
      </html>
    `);
    popup.document.close();
    showToast({ title: 'PDF preparado', detail: 'Se abrio una vista imprimible del reporte.', tone: 'info' });
  };

  return (
    <div className="space-y-6">
      <section className="flex flex-col justify-between gap-4 xl:flex-row xl:items-end">
        <div className="flex items-start gap-4">
          <div className="grid h-11 w-11 place-items-center rounded-[14px] bg-[#FFF2E7] text-[#C94A00]">
            <BarChart3 className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-[26px] font-extrabold tracking-[-0.025em] text-[#1F1F1F]">Reportes</h1>
            <p className="mt-1.5 text-sm font-semibold text-[#6B625C]">
              Analiza ventas, clientes, asesores y rendimiento comercial.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={exportPdf}
            className="flex h-11 items-center gap-2 rounded-[14px] border border-[#E8D8CC] bg-white px-5 text-sm font-extrabold text-[#4B3024] hover:bg-[#FFF2E7]"
          >
            <FileText className="h-4 w-4" aria-hidden="true" />
            Exportar PDF
          </button>
          <button
            type="button"
            onClick={exportCsv}
            className="flex h-11 items-center gap-2 rounded-[14px] border border-[#E8D8CC] bg-white px-5 text-sm font-extrabold text-[#4B3024] hover:bg-[#FFF2E7]"
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            Exportar CSV
          </button>
        </div>
      </section>

      <section className="rounded-[20px] border border-[#EDE4DC] bg-white p-5 shadow-[0_14px_34px_rgba(91,47,20,0.045)]">
        <div className={`grid items-end gap-4 ${user.rol === 'ASESOR' ? 'xl:grid-cols-[310px_1fr_auto]' : 'xl:grid-cols-[310px_0.75fr_1fr_auto]'}`}>
          <MonthCarousel
            monthOptions={monthOptions}
            monthWindow={monthWindow}
            selectedMonths={months}
            onPrevious={() => setMonthWindow((value) => Math.max(0, value - 3))}
            onNext={() => setMonthWindow((value) => Math.min(9, value + 3))}
            onToggleMonth={toggleMonth}
          />
          <ReportSelect
            label="Tipo de reporte"
            value={reportType}
            onChange={(value) => setReportType(value as ReportType)}
            options={[
              { value: 'VENTAS', label: 'General de ventas' },
              { value: 'CLIENTES', label: 'Clientes' },
              { value: 'ASESORES', label: 'Rendimiento de asesores' },
              { value: 'PLANES', label: 'Planes' },
            ]}
          />
          {user.rol !== 'ASESOR' && (
            <ReportSelect
              label="Asesor"
              value={advisor}
              onChange={setAdvisor}
              options={[{ value: 'TODOS', label: 'Todos' }, ...advisors.map((profile) => ({ value: profile.id, label: profile.nombres }))]}
            />
          )}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                setMonths([monthOptions[0].key]);
                setReportType('VENTAS');
                setAdvisor('TODOS');
              }}
              className="flex h-12 items-center gap-2 rounded-[14px] border border-[#E8D8CC] bg-white px-5 text-sm font-extrabold text-[#6B625C] hover:bg-[#FFF2E7] hover:text-[#A83B00]"
            >
              <Eraser className="h-4 w-4" aria-hidden="true" />
              Limpiar
            </button>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <ReportKpi icon={TrendingUp} label="Ventas totales" value={formatMoney(report.totalRevenue)} change={report.revenueChange} />
        <ReportKpi icon={CheckCircle2} label="Ventas completadas" value={report.completed} change={report.completedChange} />
        <ReportKpi icon={BarChart3} label="Conversion" value={`${report.conversion.toFixed(1)}%`} change={report.conversionChange} />
        <ReportKpi icon={WalletCards} label="Ticket promedio" value={formatMoney(report.avgTicket)} change={report.avgTicketChange} />
        <ReportKpi icon={Calendar} label="Pipeline pendiente" value={formatMoney(report.pendingRevenue)} change={report.pendingChange} negativeIsGood={false} />
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="h-full">
          <MonthlyEvolutionChart rows={monthlyRows} selectedMonths={months} />
        </div>

        <article className="rounded-[20px] border border-[#EDE4DC] bg-white p-5 shadow-[0_14px_34px_rgba(91,47,20,0.045)] flex flex-col">
          <h2 className="text-base font-extrabold text-[#1F1F1F]">Top Asesores (Todas las ventas)</h2>
          <div className="mt-5 flex-1 overflow-y-auto hidden-scrollbar h-[260px] space-y-3 pr-1">
            {(advisorRows.length ? advisorRows : [{ name: 'Sin ventas en el periodo', sales: 0, revenue: 0 }]).map((row, index) => (
              <div key={row.name} className="flex items-center justify-between rounded-[14px] border border-[#F3EAE3] px-4 py-3">
                <div className="flex items-center gap-3">
                  <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-extrabold ${
                    index === 0 && row.sales > 0
                      ? 'bg-gradient-to-br from-[#FFB84D] to-[#F28B00] text-white shadow-[0_4px_10px_rgba(242,139,0,0.3)]'
                      : 'bg-[#FFF2E7] text-[#C94A00]'
                  }`}>
                    {index === 0 && row.sales > 0 ? (
                      <Trophy className="h-3.5 w-3.5" aria-hidden="true" />
                    ) : (
                      index + 1
                    )}
                  </span>
                  <div>
                    <p className="text-sm font-extrabold text-[#1F1F1F]">{row.name}</p>
                    <p className="text-xs font-semibold text-[#8A7F78]">{row.sales} ventas registradas</p>
                  </div>
                </div>
                <span className="text-sm font-extrabold text-[#4B3024]">{formatMoney(row.revenue)}</span>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <article className="rounded-[20px] border border-[#EDE4DC] bg-white p-5 shadow-[0_14px_34px_rgba(91,47,20,0.045)]">
          <h2 className="text-base font-extrabold text-[#1F1F1F]">Distribucion por plan</h2>
          <PlanDonut rows={planRows} total={filteredSales.length} />
        </article>

        <article className="rounded-[20px] border border-[#EDE4DC] bg-white p-5 shadow-[0_14px_34px_rgba(91,47,20,0.045)]">
          <h2 className="text-base font-extrabold text-[#1F1F1F]">Top distritos</h2>
          <div className="mt-4 space-y-3">
            {(districtRows.length ? districtRows : [{ name: 'Sin ventas en el periodo', sales: 0, revenue: 0 }]).slice(0, 5).map((row, index) => (
              <div key={row.name} className="flex items-center justify-between rounded-[14px] border border-[#F3EAE3] px-4 py-3">
                <div className="flex items-center gap-3">
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#FFF2E7] text-xs font-extrabold text-[#C94A00]">
                    {index + 1}
                  </span>
                  <div>
                    <p className="text-sm font-extrabold text-[#1F1F1F]">{row.name}</p>
                    <p className="text-xs font-semibold text-[#8A7F78]">{row.sales} ventas</p>
                  </div>
                </div>
                <span className="text-sm font-extrabold text-[#4B3024]">{formatMoney(row.revenue)}</span>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="overflow-hidden rounded-[20px] border border-[#EDE4DC] bg-white shadow-[0_14px_34px_rgba(91,47,20,0.045)]">
        <div className="border-b border-[#EDE4DC] px-5 py-4">
          <h2 className="text-base font-extrabold text-[#1F1F1F]">Resumen de rendimiento</h2>
          <p className="mt-1 text-xs font-semibold text-[#8A7F78]">
            Periodo: {selectedLabel || 'Selecciona al menos un mes'}
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-sm">
            <thead>
              <tr className="bg-[#FFFCFA] text-left text-[11px] font-extrabold uppercase tracking-[0.08em] text-[#8A7F78]">
                <th className="px-5 py-4">Mes</th>
                <th className="px-5 py-4">Ventas</th>
                <th className="px-5 py-4">Clientes nuevos</th>
                <th className="px-5 py-4">Monto vendido</th>
                <th className="px-5 py-4">Completadas</th>
                <th className="px-5 py-4">Pendientes</th>
                <th className="px-5 py-4">Conversion</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F3EAE3]">
              {pagedExportRows.map((row) => (
                <tr key={row.key} className="hover:bg-[#FFFCFA]">
                  <td className="px-5 py-4 font-extrabold text-[#1F1F1F]">{row.label}</td>
                  <td className="px-5 py-4 font-semibold text-[#4B3024]">{row.sales}</td>
                  <td className="px-5 py-4 font-semibold text-[#4B3024]">{row.clients}</td>
                  <td className="px-5 py-4 font-semibold text-[#4B3024]">{formatMoney(row.revenue)}</td>
                  <td className="px-5 py-4 font-semibold text-[#4B3024]">{row.completed}</td>
                  <td className="px-5 py-4 font-semibold text-[#4B3024]">{row.pending}</td>
                  <td className="px-5 py-4 font-extrabold text-[#C94A00]">{row.conversion.toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination page={currentPage} totalItems={exportRows.length} itemLabel="registros" onPageChange={setPage} />
      </section>
    </div>
  );
}

function ReportSelect({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: SelectOption[] }) {
  return (
    <label className="block">
      <span className="text-xs font-extrabold uppercase tracking-[0.08em] text-[#8A7F78]">{label}</span>
      <div className="mt-2">
        <ComboBox value={value} onChange={onChange} options={options} />
      </div>
    </label>
  );
}

function MonthCarousel({
  monthOptions,
  monthWindow,
  selectedMonths,
  onPrevious,
  onNext,
  onToggleMonth,
}: {
  monthOptions: string[];
  monthWindow: number;
  selectedMonths: string[];
  onPrevious: () => void;
  onNext: () => void;
  onToggleMonth: (key: string) => void;
}) {
  const visibleMonths = monthOptions.slice(monthWindow, monthWindow + 3);
  const windowLabel = `${fullMonthLabels[monthWindow]} - ${fullMonthLabels[Math.min(monthWindow + 2, 11)]}`;

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-extrabold uppercase tracking-[0.08em] text-[#8A7F78]">Meses del reporte</span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onPrevious}
            disabled={monthWindow === 0}
            title="Meses anteriores"
            className="grid h-8 w-8 place-items-center rounded-[10px] border border-[#E8D8CC] bg-white text-[#6B625C] transition hover:bg-[#FFF2E7] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={onNext}
            disabled={monthWindow >= 9}
            title="Meses siguientes"
            className="grid h-8 w-8 place-items-center rounded-[10px] border border-[#E8D8CC] bg-white text-[#6B625C] transition hover:bg-[#FFF2E7] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>
      <div className="mt-2 rounded-[16px] border border-[#E8D8CC] bg-[#FFFCFA] p-2.5">
        <div className="grid grid-cols-3 gap-2">
          {visibleMonths.map((key) => {
            const monthIndex = Number(key.split('-')[1]) - 1;
            const active = selectedMonths.includes(key);
            return (
              <button
                key={key}
                type="button"
                onClick={() => onToggleMonth(key)}
                className={`h-11 rounded-[12px] text-sm font-extrabold transition ${
                  active
                    ? 'bg-[#C94A00] text-white shadow-[0_10px_18px_rgba(201,74,0,0.18)]'
                    : 'border border-[#E8D8CC] bg-white text-[#6B625C] hover:bg-[#FFF2E7] hover:text-[#C94A00]'
                }`}
              >
                {monthLabels[monthIndex]}
              </button>
            );
          })}
        </div>
        <p className="mt-2 text-center text-[11px] font-bold text-[#8A7F78]">{windowLabel}</p>
      </div>
    </div>
  );
}

function ReportKpi({
  icon: Icon,
  label,
  value,
  change,
  negativeIsGood = false,
}: {
  icon: typeof TrendingUp;
  label: string;
  value: number | string;
  change: number;
  negativeIsGood?: boolean;
}) {
  const positive = negativeIsGood ? change <= 0 : change >= 0;
  return (
    <article className="flex h-[106px] items-center gap-4 rounded-[20px] border border-[#EDE4DC] bg-white p-5 shadow-[0_14px_34px_rgba(91,47,20,0.045)]">
      <div className="grid h-12 w-12 place-items-center rounded-full bg-[#FFF2E7] text-[#C94A00]">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-extrabold uppercase tracking-[0.08em] text-[#8A7F78]">{label}</p>
        <p className="mt-1 truncate text-xl font-extrabold text-[#1F1F1F]">{value}</p>
        <p className={`mt-1 text-xs font-extrabold ${positive ? 'text-[#009A4E]' : 'text-[#D64545]'}`}>
          {change >= 0 ? '↑' : '↓'} {Math.abs(change).toFixed(1)}% vs periodo anterior
        </p>
      </div>
    </article>
  );
}

type EvolutionMetric = 'sales' | 'revenue';

function MonthlyEvolutionChart({
  rows,
  selectedMonths,
}: {
  rows: Array<{ key: string; label: string; sales: number; revenue: number; completed: number }>;
  selectedMonths: string[];
}) {
  const [activeMetric, setActiveMetric] = useState<EvolutionMetric>('sales');
  const [hoveredMonth, setHoveredMonth] = useState<string | null>(null);
  const activeMetricRows = rows.filter(r => selectedMonths.includes(r.key));
  const totalSales = activeMetricRows.reduce((sum, row) => sum + row.sales, 0);
  const totalRevenue = activeMetricRows.reduce((sum, row) => sum + row.revenue, 0);
  const values = rows.map((row) => (activeMetric === 'sales' ? row.sales : row.revenue));
  const max = Math.max(...values, 1);
  const chartWidth = 720;
  const chartHeight = 252;
  const paddingX = 34;
  const top = 28;
  const bottom = 202;
  const points = rows.map((row, index) => {
    const value = activeMetric === 'sales' ? row.sales : row.revenue;
    const x = paddingX + (index / Math.max(rows.length - 1, 1)) * (chartWidth - paddingX * 2);
    const y = bottom - (value / max) * (bottom - top);
    return { ...row, value, x, y };
  });
  const activePoint =
    points.find((point) => point.key === hoveredMonth) ??
    points.find((point) => selectedMonths.includes(point.key)) ??
    points[points.length - 1];
  const hoveredPoint = points.find((point) => point.key === hoveredMonth);
  let tooltip = null;
  if (hoveredPoint) {
    const boxWidth = 100;
    const boxHeight = 48;
    const tX = Math.min(Math.max(hoveredPoint.x - boxWidth / 2, paddingX), chartWidth - paddingX - boxWidth);
    const tY = Math.max(hoveredPoint.y - boxHeight - 12, 6);
    tooltip = { x: tX, y: tY, width: boxWidth, height: boxHeight, centerX: tX + boxWidth / 2 };
  }
  const linePath = smoothPath(points);
  const areaPath = `${linePath} L ${points[points.length - 1]?.x ?? paddingX} ${bottom} L ${points[0]?.x ?? paddingX} ${bottom} Z`;

  return (
    <div className="overflow-hidden rounded-[18px] border border-[#E8D8CC] bg-white">
      <div className="grid border-b border-[#EDE4DC] lg:grid-cols-[1fr_320px]">
        <div className="px-5 py-4">
          <p className="text-base font-extrabold text-[#1F1F1F]">Comparativo mensual</p>
          <p className="mt-1 text-sm font-semibold text-[#6B625C]">
            Ventas y monto acumulado por mes.
          </p>
        </div>
        <div className="grid grid-cols-2 border-t border-[#EDE4DC] lg:border-l lg:border-t-0">
          <MetricToggle
            active={activeMetric === 'sales'}
            label="Ventas"
            value={totalSales.toLocaleString('es-PE')}
            onClick={() => setActiveMetric('sales')}
          />
          <MetricToggle
            active={activeMetric === 'revenue'}
            label="Monto"
            value={formatMoney(totalRevenue)}
            onClick={() => setActiveMetric('revenue')}
          />
        </div>
      </div>

      <div className="px-4 pb-5 pt-6">
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="h-[260px] w-full"
          role="img"
          aria-label="Evolucion mensual del reporte"
          onMouseLeave={() => setHoveredMonth(null)}
        >
          <defs>
            <linearGradient id="monthlyLineFill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#F24A00" stopOpacity="0.18" />
              <stop offset="68%" stopColor="#FFB48A" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#FFF7F1" stopOpacity="0" />
            </linearGradient>
          </defs>
          {[0, 1, 2, 3, 4].map((index) => {
            const y = top + (index / 4) * (bottom - top);
            return (
              <line
                key={y}
                x1={paddingX}
                x2={chartWidth - paddingX}
                y1={y}
                y2={y}
                stroke="#F1DAC8"
                strokeWidth="1"
                strokeDasharray={index === 4 ? '0' : '4 8'}
              />
            );
          })}
          <path d={areaPath} fill="url(#monthlyLineFill)" />
          <path d={linePath} fill="none" stroke="#F24A00" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          {points.map((point) => {
            const selected = selectedMonths.includes(point.key);
            const active = activePoint?.key === point.key;
            return (
              <g key={point.key}>
                <rect
                  x={point.x - 24}
                  y={top}
                  width="48"
                  height={bottom - top}
                  fill="transparent"
                  onMouseEnter={() => setHoveredMonth(point.key)}
                />
                <circle
                  cx={point.x}
                  cy={point.y}
                  r={active ? 6 : selected ? 5 : 4}
                  fill={selected ? '#C94A00' : '#FFB48A'}
                  stroke="#FFFFFF"
                  strokeWidth="3"
                />
                <text
                  x={point.x}
                  y={chartHeight - 16}
                  textAnchor="middle"
                  className={`text-[12px] font-bold ${selected ? 'fill-[#C94A00]' : 'fill-[#8A7F78]'}`}
                >
                  {point.label}
                </text>
              </g>
            );
          })}
          {hoveredPoint && tooltip && (
            <g className="pointer-events-none">
              <line x1={hoveredPoint.x} x2={hoveredPoint.x} y1={top} y2={bottom} stroke="#F1DAC8" strokeWidth="1" strokeDasharray="4 8" />
              <rect
                x={tooltip.x}
                y={tooltip.y}
                width={tooltip.width}
                height={tooltip.height}
                rx="12"
                fill="#FFFBF8"
                stroke="#F1DAC8"
                style={{ filter: 'drop-shadow(0px 8px 12px rgba(91,47,20,0.12))' }}
              />
              <text
                x={tooltip.centerX}
                y={tooltip.y + 20}
                textAnchor="middle"
                className="fill-[#4B3024] text-[11px] font-extrabold"
              >
                {hoveredPoint.label}
              </text>
              <text
                x={tooltip.centerX}
                y={tooltip.y + 36}
                textAnchor="middle"
                className="fill-[#C94A00] text-[12px] font-extrabold"
              >
                {activeMetric === 'sales' ? `${hoveredPoint.value} ventas` : formatMoney(hoveredPoint.value)}
              </text>
            </g>
          )}
        </svg>
      </div>
    </div>
  );
}

function smoothPath(points: Array<{ x: number; y: number }>) {
  if (!points.length) return '';
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

  return points.reduce((path, point, index, items) => {
    if (index === 0) return `M ${point.x} ${point.y}`;

    const previous = items[index - 1];
    const controlDistance = (point.x - previous.x) / 2;
    return `${path} C ${previous.x + controlDistance} ${previous.y}, ${point.x - controlDistance} ${point.y}, ${point.x} ${point.y}`;
  }, '');
}

function MetricToggle({
  active,
  label,
  value,
  onClick,
}: {
  active: boolean;
  label: string;
  value: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`min-w-[150px] px-5 py-4 text-left transition ${
        active ? 'bg-[#FFF2E7]' : 'bg-white hover:bg-[#FFFCFA]'
      }`}
    >
      <span className="text-xs font-extrabold uppercase tracking-[0.08em] text-[#8A7F78]">{label}</span>
      <span className="mt-1 block truncate text-lg font-extrabold text-[#1F1F1F]">{value}</span>
    </button>
  );
}

// Removed AdvisorBars component

function PlanDonut({ rows, total }: { rows: Array<{ name: string; sales: number }>; total: number }) {
  const colors = ['#F24A00', '#FF7A1A', '#FFB84D', '#6B625C', '#E8D8CC'];
  let cursor = 0;
  const gradient = rows.length
    ? rows
        .slice(0, 5)
        .map((row, index) => {
          const start = cursor;
          const value = total ? (row.sales / total) * 100 : 0;
          cursor += value;
          return `${colors[index]} ${start}% ${cursor}%`;
        })
        .join(', ')
    : '#E8D8CC 0% 100%';

  return (
    <div className="mt-5 grid gap-5 md:grid-cols-[180px_1fr] md:items-center">
      <div
        className="mx-auto grid h-[170px] w-[170px] place-items-center rounded-full"
        style={{ background: `conic-gradient(${gradient})` }}
      >
        <div className="grid h-[96px] w-[96px] place-items-center rounded-full bg-white text-center">
          <div>
            <p className="text-2xl font-extrabold text-[#1F1F1F]">{total}</p>
            <p className="text-xs font-bold text-[#6B625C]">ventas</p>
          </div>
        </div>
      </div>
      <div className="space-y-3">
        {(rows.length ? rows : [{ name: 'Sin datos', sales: 0 }]).slice(0, 5).map((row, index) => (
          <div key={row.name} className="flex items-center justify-between gap-3 text-sm">
            <span className="flex items-center gap-2 font-semibold text-[#4B3024]">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: colors[index] ?? '#E8D8CC' }} />
              {row.name}
            </span>
            <span className="font-extrabold text-[#1F1F1F]">{total ? ((row.sales / total) * 100).toFixed(0) : 0}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
