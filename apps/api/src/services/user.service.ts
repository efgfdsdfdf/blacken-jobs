/**
 * User service module.
 * @module services/user.service
 */
import { UserRepository } from '../repositories/user.repository';
import { AuditService } from './audit.service';
import { NotFoundError, ConflictError } from '../utils/errors';

export class UserService {
  private userRepository: UserRepository;
  private auditService: AuditService;

  constructor() {
    this.userRepository = new UserRepository();
    this.auditService = new AuditService();
  }

  async getUserById(id: string) {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundError('User not found');
    }
    return user;
  }

  async getUserBySupabaseId(supabaseId: string) {
    const user = await this.userRepository.findBySupabaseId(supabaseId);
    if (!user) {
      throw new NotFoundError('User not found');
    }
    return user;
  }

  async createUser(data: { email: string; supabaseId: string; firstName?: string; lastName?: string }) {
    const existing = await this.userRepository.findByEmail(data.email);
    if (existing) {
      throw new ConflictError('User with this email already exists');
    }

    const user = await this.userRepository.create(data);

    await this.auditService.log({
      action: 'USER_CREATED',
      entity: 'USER',
      entityId: user.id,
      targetUserId: user.id,
    });

    return user;
  }

  async updateProfile(userId: string, data: any, actorId?: string, ipAddress?: string, userAgent?: string) {
    const profile = await this.userRepository.updateProfile(userId, data);
    
    await this.auditService.log({
      actorId: actorId || userId,
      targetUserId: userId,
      action: 'PROFILE_UPDATED',
      entity: 'PROFILE',
      metadata: data,
      ipAddress,
      userAgent,
    });

    return profile;
  }

  async updateSettings(userId: string, data: any, actorId?: string, ipAddress?: string, userAgent?: string) {
    const settings = await this.userRepository.updateSettings(userId, data);
    
    await this.auditService.log({
      actorId: actorId || userId,
      targetUserId: userId,
      action: 'SETTINGS_UPDATED',
      entity: 'SETTINGS',
      metadata: data,
      ipAddress,
      userAgent,
    });

    return settings;
  }

  async softDeleteUser(userId: string, actorId?: string, ipAddress?: string, userAgent?: string) {
    const user = await this.userRepository.softDelete(userId);
    
    await this.auditService.log({
      actorId: actorId || userId,
      targetUserId: userId,
      action: 'USER_DELETED',
      entity: 'USER',
      entityId: userId,
      ipAddress,
      userAgent,
    });

    return user;
  }
}
