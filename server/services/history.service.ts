import { withAuthContext } from './prisma.js';

export async function listStatusHistory(userId: string) {
  return withAuthContext(userId, (tx) =>
    tx.statusHistory.findMany({
      orderBy: { created_at: 'desc' },
      include: {
        venta: true,
        usuario: true,
      },
    }),
  );
}

export async function listSaleHistory(userId: string, saleId: string) {
  return withAuthContext(userId, (tx) =>
    tx.statusHistory.findMany({
      where: { venta_id: saleId },
      orderBy: { created_at: 'desc' },
      include: {
        usuario: true,
      },
    }),
  );
}
