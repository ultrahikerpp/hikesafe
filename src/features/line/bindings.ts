import { randomBytes as nodeRandomBytes } from 'node:crypto';

export type LineSourceType = 'user' | 'group' | 'room';

interface SavedCode {
  userId: string;
  code: string;
  expiresAt: Date;
}

interface ConsumedCode {
  code: string;
  ownerLineUserId: string;
  sourceType: LineSourceType;
  sourceId: string;
  now: Date;
}

export interface BindingRepository {
  saveCode(value: SavedCode): Promise<void>;
  consumeCode(value: ConsumedCode): Promise<boolean>;
}

interface BindingDependencies {
  repository?: BindingRepository;
  now?: () => Date;
  randomBytes?: () => Uint8Array;
}

const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

const databaseRepository: BindingRepository = {
  async saveCode(value) {
    const [{ db }, { lineBindings }] = await Promise.all([
      import('@/src/db/client'),
      import('@/src/db/schema'),
    ]);
    await db.insert(lineBindings).values({
      userId: value.userId,
      bindingCode: value.code,
      codeExpiresAt: value.expiresAt,
    });
  },

  async consumeCode(value) {
    const [{ and, eq, gt, isNull }, { db }, { lineBindings, users }] =
      await Promise.all([
        import('drizzle-orm'),
        import('@/src/db/client'),
        import('@/src/db/schema'),
      ]);
    const [candidate] = await db
      .select({ id: lineBindings.id, lineUserId: users.lineUserId })
      .from(lineBindings)
      .innerJoin(users, eq(lineBindings.userId, users.id))
      .where(
        and(
          eq(lineBindings.bindingCode, value.code),
          gt(lineBindings.codeExpiresAt, value.now),
          isNull(lineBindings.boundAt),
          isNull(lineBindings.revokedAt),
        ),
      )
      .limit(1);
    if (!candidate || candidate.lineUserId !== value.ownerLineUserId) return false;

    const updated = await db
      .update(lineBindings)
      .set({
        sourceType: value.sourceType,
        sourceId: value.sourceId,
        bindingCode: null,
        boundAt: value.now,
      })
      .where(
        and(
          eq(lineBindings.id, candidate.id),
          eq(lineBindings.bindingCode, value.code),
          gt(lineBindings.codeExpiresAt, value.now),
          isNull(lineBindings.boundAt),
          isNull(lineBindings.revokedAt),
        ),
      )
      .returning({ id: lineBindings.id });
    return updated.length === 1;
  },
};

export const createBindingCode = async (
  userId: string,
  dependencies: BindingDependencies = {},
) => {
  const now = (dependencies.now ?? (() => new Date()))();
  const bytes = (dependencies.randomBytes ?? (() => nodeRandomBytes(6)))();
  const code = Array.from(bytes.slice(0, 6), (byte) => alphabet[byte % alphabet.length]).join('');
  const expiresAt = new Date(now.getTime() + 10 * 60 * 1_000);
  await (dependencies.repository ?? databaseRepository).saveCode({
    userId,
    code,
    expiresAt,
  });
  return { code, expiresAt };
};

export const consumeBindingCode = async (
  value: ConsumedCode,
  repository: BindingRepository = databaseRepository,
) => repository.consumeCode(value);
