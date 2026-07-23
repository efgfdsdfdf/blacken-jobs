/**
 * Audit service module.
 * @module services/audit.service
 */
import { AuditRepository, CreateAuditLogInput } from '../repositories/audit.repository';

export class AuditService {
  private auditRepository: AuditRepository;

  constructor() {
    this.auditRepository = new AuditRepository();
  }

  async log(params: CreateAuditLogInput) {
    return this.auditRepository.create(params);
  }

  async getLogsForUser(userId: string, page: number, pageSize: number) {
    const { items, total } = await this.auditRepository.findByUserId(userId, page, pageSize);
    return {
      items,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }
}
