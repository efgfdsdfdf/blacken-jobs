/**
 * User repository module.
 * @module repositories/user.repository
 */
import { prisma } from '@repo/db';
import type { Prisma, User, Profile, UserSettings } from '@repo/db';

export interface IUserRepository {
  findById(id: string): Promise<(User & { profile: Profile | null, settings: UserSettings | null }) | null>;
  findByEmail(email: string): Promise<User | null>;
  findBySupabaseId(supabaseId: string): Promise<(User & { profile: Profile | null, settings: UserSettings | null }) | null>;
  create(data: { email: string; supabaseId: string; firstName?: string; lastName?: string }): Promise<User>;
  updateProfile(userId: string, data: Partial<Profile>): Promise<Profile>;
  updateSettings(userId: string, data: Partial<UserSettings>): Promise<UserSettings>;
  softDelete(id: string): Promise<User>;
}

export class UserRepository implements IUserRepository {
  async findById(id: string) {
    return prisma.user.findUnique({
      where: { id, deletedAt: null },
      include: { profile: true, settings: true },
    });
  }

  async findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email, deletedAt: null },
    });
  }

  async findBySupabaseId(supabaseId: string) {
    return prisma.user.findUnique({
      where: { supabaseId, deletedAt: null },
      include: { profile: true, settings: true },
    });
  }

  async create(data: { email: string; supabaseId: string; firstName?: string; lastName?: string }) {
    return prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: data.email,
          supabaseId: data.supabaseId,
        },
      });

      await tx.profile.create({
        data: {
          userId: user.id,
          firstName: data.firstName,
          lastName: data.lastName,
        },
      });

      await tx.userSettings.create({
        data: {
          userId: user.id,
        },
      });

      return user;
    });
  }

  async updateProfile(userId: string, data: Partial<Profile>) {
    return prisma.profile.upsert({
      where: { userId },
      update: data,
      create: { ...data, userId } as any,
    });
  }

  async updateSettings(userId: string, data: Partial<UserSettings>) {
    return prisma.userSettings.upsert({
      where: { userId },
      update: data,
      create: { ...data, userId } as any,
    });
  }

  async softDelete(id: string) {
    return prisma.user.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
