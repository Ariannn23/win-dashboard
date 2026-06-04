import {
  BarChart3,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Download,
  FileText,
  Filter,
  TrendingUp,
  UsersRound,
  WalletCards,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { useAuth } from '@/app/providers/AuthProvider';
import { useCrm } from '@/app/providers/CrmProvider';
import { formatMoney, monthKey, percentChange } from '@/shared/lib/format';
import { planGroup, saleAmount } from '@/shared/lib/sales';
import { ComboBox, type SelectOption } from '@/shared/ui/FormControls';
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
  const [supervisor, setSupervisor] = useState('TODOS');
  const [advisor, setAdvisor] = useState('TODOS');
  const [district, setDistrict] = useState('TODOS');
  const [monthWindow, setMonthWindow] = useState(Math.floor(now.getMonth() / 3) * 3);

  if (!user) return null;
  if (isLoading) return <PageSkeleton cards={5} tableRows={5} tableColumns={7} />;

  const sales = visibleSales(user);
  const monthOptions = Array.from({ length: 12 }, (_, index) => `${currentYear}-${String(index + 1).padStart(2, '0')}`);
  const districts = Array.from(new Set(sales.map((sale) => sale.distrito))).sort();
  const supervisors = profiles.filter((profile) => profile.rol === 'SUPERVISOR');
  const advisors = profiles.filter((profile) => profile.rol === 'ASESOR');

  const filteredSales = useMemo(() => {
    return sales.filter((sale) => {
      const createdMonth = monthKey(new Date(sale.created_at));
      const matchesMonth = months.includes(createdMonth);
      const matchesSupervisor = supervisor === 'TODOS' || sale.supervisor_id === supervisor;
      const matchesAdvisor = advisor === 'TODOS' || sale.asesor_id === advisor;
      const matchesDistrict = district === 'TODOS' || sale.distrito === district;
      return matchesMonth && matchesSupervisor && matchesAdvisor && matchesDistrict;
    });
  }, [advisor, district, months, sales, supervisor]);

  const previousSales = useMemo(() => {
    const previousKeys = previousMonthKeys(months);
    return sales.filter((sale) => {
      const createdMonth = monthKey(new Date(sale.created_at));
      const matchesMonth = previousKeys.includes(createdMonth);
      const matchesSupervisor = supervisor === 'TODOS' || sale.supervisor_id === supervisor;
      const matchesAdvisor = advisor === 'TODOS' || sale.asesor_id === advisor;
      const matchesDistrict = district === 'TODOS' || sale.distrito === district;
      return matchesMonth && matchesSupervisor && matchesAdvisor && matchesDistrict;
    });
  }, [advisor, district, months, sales, supervisor]);

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
      const monthSales = filteredSales.filter((sale) => monthKey(new Date(sale.created_at)) === key);
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
  }, [filteredSales, monthOptions]);

  const selectedMonthRows = monthlyRows.filter((row) => months.includes(row.key));
  const advisorRows = advisors
    .map((profile) => {
      const advisorSales = filteredSales.filter((sale) => sale.asesor_id === profile.id);
      return {
        name: profile.nombres,
        sales: advisorSales.length,
        revenue: advisorSales.reduce((sum, sale) => sum + saleAmount(sale), 0),
      };
    })
    .filter((row) => row.sales > 0 || row.revenue > 0)
    .sort((a, b) => b.revenue - a.revenue);

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
        <div className="grid items-end gap-4 xl:grid-cols-[310px_0.75fr_0.95fr_0.95fr_0.95fr_auto]">
          <MonthCarousel
            monthOptions={monthOptions}
            monthWindow={monthWindow}
            selectedMonths={months}
            onPrevious={() => setMonthWindow((value) => Math.max(0, value - 3))}
            onNext={() => setMonthWindow((value) => Math.min(9, value + 3))}
            onToggleMonth={toggleMonth}
          />
          <ReportSelect
            label="Tipo"
            value={reportType}
            onChange={(value) => setReportType(value as ReportType)}
            options={[
              { value: 'VENTAS', label: 'Ventas' },
              { value: 'CLIENTES', label: 'Clientes' },
              { value: 'ASESORES', label: 'Asesores' },
              { value: 'PLANES', label: 'Planes' },
            ]}
          />
          <ReportSelect
            label="Supervisor"
            value={supervisor}
            onChange={setSupervisor}
            options={[{ value: 'TODOS', label: 'Todos' }, ...supervisors.map((profile) => ({ value: profile.id, label: profile.nombres }))]}
          />
          <ReportSelect
            label="Asesor"
            value={advisor}
            onChange={setAdvisor}
            options={[{ value: 'TODOS', label: 'Todos' }, ...advisors.map((profile) => ({ value: profile.id, label: profile.nombres }))]}
          />
          <ReportSelect
            label="Distrito"
            value={district}
            onChange={setDistrict}
            options={[{ value: 'TODOS', label: 'Todos' }, ...districts.map((item) => ({ value: item, label: item }))]}
          />
          <div className="flex items-end">
            <button className="flex h-12 items-center gap-2 rounded-[14px] bg-gradient-to-r from-[#F24A00] to-[#C94A00] px-5 text-sm font-extrabold text-white shadow-[0_14px_22px_rgba(201,74,0,0.22)]" type="button">
              <Filter className="h-4 w-4" aria-hidden="true" />
              Generar
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
        <article className="rounded-[20px] border border-[#EDE4DC] bg-white p-5 shadow-[0_14px_34px_rgba(91,47,20,0.045)]">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-extrabold text-[#1F1F1F]">Evolucion mensual</h2>
            <span className="text-xs font-extrabold text-[#8A7F78]">{currentYear}</span>
          </div>
          <div className="mt-5 h-[260px]">
            <LineChart rows={monthlyRows} selectedMonths={months} />
          </div>
        </article>

        <article className="rounded-[20px] border border-[#EDE4DC] bg-white p-5 shadow-[0_14px_34px_rgba(91,47,20,0.045)]">
          <h2 className="text-base font-extrabold text-[#1F1F1F]">Ventas por asesor</h2>
          <div className="mt-5 h-[260px]">
            <AdvisorBars rows={advisorRows} />
          </div>
        </article>
      </section>

      <section className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <article className="rounded-[20px] border border-[#EDE4DC] bg-white p-5 shadow-[0_14px_34px_rgba(91,47,20,0.045)]">
          <h2 className="text-base font-extrabold text-[#1F1F1F]">Distribucion por plan</h2>
          <PlanDonut rows={planRows} total={filteredSales.length} />
        </article>

        <article className="rounded-[20px] border border-[#EDE4DC] bg-white p-5 shadow-[0_14px_34px_rgba(91,47,20,0.045)]">
          <h2 className="text-base font-extrabold text-[#1F1F1F]">Top asesores</h2>
          <div className="mt-4 space-y-3">
            {(advisorRows.length ? advisorRows : [{ name: 'Sin ventas en el periodo', sales: 0, revenue: 0 }]).slice(0, 5).map((row, index) => (
              <div key={row.name} className="flex items-center justify-between rounded-[14px] border border-[#F3EAE3] px-4 py-3">
                <div className="flex items-center gap-3">
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-[#FFF2E7] text-xs font-extrabold text-[#C94A00]">{index + 1}</span>
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
              {exportRows.map((row) => (
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

function LineChart({ rows, selectedMonths }: { rows: Array<{ key: string; label: string; revenue: number }>; selectedMonths: string[] }) {
  const max = Math.max(...rows.map((row) => row.revenue), 1);
  const points = rows
    .map((row, index) => {
      const x = (index / Math.max(rows.length - 1, 1)) * 100;
      const y = 92 - (row.revenue / max) * 82;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div className="flex h-full flex-col">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-full w-full overflow-visible">
        {[20, 40, 60, 80].map((line) => (
          <line key={line} x1="0" x2="100" y1={line} y2={line} stroke="#F1DAC8" strokeWidth="0.35" />
        ))}
        <polyline points={points} fill="none" stroke="#F24A00" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
        {rows.map((row, index) => {
          const x = (index / Math.max(rows.length - 1, 1)) * 100;
          const y = 92 - (row.revenue / max) * 82;
          return (
            <circle
              key={row.key}
              cx={x}
              cy={y}
              r={selectedMonths.includes(row.key) ? 2.2 : 1.4}
              fill={selectedMonths.includes(row.key) ? '#C94A00' : '#FFB48A'}
              vectorEffect="non-scaling-stroke"
            />
          );
        })}
      </svg>
      <div className="mt-2 grid grid-cols-12 text-center text-[11px] font-bold text-[#8A7F78]">
        {rows.map((row) => (
          <span key={row.key}>{row.label}</span>
        ))}
      </div>
    </div>
  );
}

function AdvisorBars({ rows }: { rows: Array<{ name: string; revenue: number }> }) {
  const visibleRows = rows.length ? rows.slice(0, 6) : [{ name: 'Sin datos', revenue: 0 }];
  const max = Math.max(...visibleRows.map((row) => row.revenue), 1);

  return (
    <div className="flex h-full items-end gap-4">
      {visibleRows.map((row) => (
        <div key={row.name} className="flex h-full flex-1 flex-col justify-end gap-2">
          <div className="flex flex-1 items-end">
            <div
              className="w-full rounded-t-[12px] bg-gradient-to-t from-[#C94A00] to-[#FF7A1A]"
              style={{ height: `${Math.max(8, (row.revenue / max) * 100)}%` }}
            />
          </div>
          <p className="line-clamp-2 min-h-8 text-center text-[11px] font-bold text-[#4B3024]">{row.name}</p>
        </div>
      ))}
    </div>
  );
}

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
