import type { Prisma, SaleStatus } from '@prisma/client';
import { withAuthContext } from './prisma.js';

export async function listSalesForUser(userId: string) {
  return withAuthContext(userId, (tx) =>
    tx.sale.findMany({
      orderBy: { created_at: 'desc' },
      include: {
        asesor: true,
        supervisor: true,
        creador: true,
      },
    }),
  );
}

export async function createSale(userId: string, data: Omit<Prisma.SaleUncheckedCreateInput, 'creado_por'>) {
  return withAuthContext(userId, (tx) =>
    tx.sale.create({
      data: {
        ...data,
        creado_por: userId,
        estado: 'PENDIENTE_GRABACION',
      },
    }),
  );
}

export async function updateSale(userId: string, saleId: string, data: Prisma.SaleUncheckedUpdateInput) {
  return withAuthContext(userId, (tx) =>
    tx.sale.update({
      where: { id: saleId },
      data,
    }),
  );
}

export async function changeSaleStatus(
  userId: string,
  saleId: string,
  status: SaleStatus,
  comment = '',
) {
  return withAuthContext(userId, async (tx) => {
    await tx.$executeRaw`select set_config('app.estado_comentario', ${comment}, true)`;

    const sale = await tx.sale.update({
      where: { id: saleId },
      data: { estado: status },
    });

    const history = await tx.statusHistory.findFirst({
      where: { venta_id: saleId },
      orderBy: { created_at: 'desc' },
      include: { usuario: true },
    });

    return { sale, history };
  });
}
