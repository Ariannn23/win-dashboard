import type { Prisma } from '@prisma/client';
import { withAuthContext } from './prisma';

export async function listProfiles(userId: string) {
  return withAuthContext(userId, (tx) =>
    tx.profile.findMany({
      orderBy: { created_at: 'asc' },
    }),
  );
}

export async function updateProfile(
  adminUserId: string,
  profileId: string,
  data: Pick<Prisma.ProfileUncheckedUpdateInput, 'nombres' | 'correo' | 'correo_recuperacion' | 'rol' | 'activo'>,
) {
  return withAuthContext(adminUserId, (tx) =>
    tx.profile.update({
      where: { id: profileId },
      data,
    }),
  );
}

export async function toggleProfile(adminUserId: string, profileId: string) {
  return withAuthContext(adminUserId, async (tx) => {
    const current = await tx.profile.findUniqueOrThrow({
      where: { id: profileId },
    });

    return tx.profile.update({
      where: { id: profileId },
      data: { activo: !current.activo },
    });
  });
}
