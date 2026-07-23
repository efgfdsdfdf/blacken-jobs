/**
 * Audit repository module.
 * @module repositories/audit.repository
 */
import { prisma } from '@repo/db';
import type { Prisma, AuditLog } from '@repo/db';

export interface CreateAuditLogInput {
  actorId?: string;
  targetUserId?: string;
  action: string;
  entity: string;
  entityId?: string;
  metadata?: Prisma.InputJsonValue;
  ipAddress?: string;
  userAgent?: string;
}

export interface IAuditRepository {
  create(data: CreateAuditLogInput): Promise<AuditLog>;
  findByUserId(userId: string, page: number, pageSize: number): Promise<{ items: AuditLog[], total: number }>;
  findByEntity(entity: string, entityId: string): Promise<AuditLog[]>;
}

export class AuditRepository implements IAuditRepository {
  async create(data: CreateAuditLogInput) {
    return prisma.auditLog.create({
      data: data as any,
    });
  }

  async findByUserId(userId: string, page: number, pageSize: number) {
    const [items, total] = await Promise.all([
      prisma.auditLog.findMany({
        where: { targetUserId: userId },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.auditLog.count({ where: { targetUserId: userId } }),
    ]);

    return { items, total };
  }

  async findByEntity(entity: string, entityId: string) {
    return prisma.auditLog.findMany({
      where: { entity, entityId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
