import { prisma } from '../config/prisma.config.js';
import { Role, CurrentUserDto } from '../types/auth.types.js';
import { hashPassword } from '../utils/password.util.js';

export interface UserRecord {
  id: string;
  email: string;
  passwordHash: string;
  role: Role;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  student?: {
    id: string;
    userId: string;
    registerNumber: string;
    department: string;
    batchYear: number;
    cgpa: number | null;
  } | null;
}

export interface RefreshTokenRecord {
  id: string;
  token: string;
  userId: string;
  isRevoked: boolean;
  expiresAt: Date;
  createdAt: Date;
}

// In-memory fallback cache for isolated testing / offline mode
class InMemoryUserStore {
  private users: Map<string, UserRecord> = new Map();
  private refreshTokens: Map<string, RefreshTokenRecord> = new Map();
  private initialized = false;

  async initialize(): Promise<void> {
    if (this.initialized) return;

    // Seed default accounts
    const superAdminHash = await hashPassword('SuperAdmin@123');
    const placementAdminHash = await hashPassword('PlacementAdmin@123');
    const studentHash = await hashPassword('Student@123');

    const superAdmin: UserRecord = {
      id: 'usr-super-admin-001',
      email: 'superadmin@placement.edu',
      passwordHash: superAdminHash,
      role: Role.SUPER_ADMIN,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const placementAdmin: UserRecord = {
      id: 'usr-placement-admin-001',
      email: 'placementadmin@placement.edu',
      passwordHash: placementAdminHash,
      role: Role.PLACEMENT_ADMIN,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const studentUser: UserRecord = {
      id: 'usr-student-001',
      email: 'student@placement.edu',
      passwordHash: studentHash,
      role: Role.STUDENT,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      student: {
        id: 'stu-001',
        userId: 'usr-student-001',
        registerNumber: '2026CS101',
        department: 'Computer Science & Engineering',
        batchYear: 2026,
        cgpa: 8.92,
      },
    };

    this.users.set(superAdmin.email.toLowerCase(), superAdmin);
    this.users.set(placementAdmin.email.toLowerCase(), placementAdmin);
    this.users.set(studentUser.email.toLowerCase(), studentUser);
    this.initialized = true;
  }

  findByEmail(email: string): UserRecord | null {
    return this.users.get(email.toLowerCase()) || null;
  }

  findById(id: string): UserRecord | null {
    for (const u of this.users.values()) {
      if (u.id === id) return u;
    }
    return null;
  }

  saveRefreshToken(record: RefreshTokenRecord): void {
    this.refreshTokens.set(record.token, record);
  }

  findRefreshToken(token: string): RefreshTokenRecord | null {
    return this.refreshTokens.get(token) || null;
  }

  revokeRefreshToken(token: string): void {
    const record = this.refreshTokens.get(token);
    if (record) {
      record.isRevoked = true;
    }
  }
}

export class UserRepository {
  private memStore = new InMemoryUserStore();

  constructor() {
    // Proactively initialize memory store
    this.memStore.initialize().catch((err) => console.error('Error init memStore:', err));
  }

  async findByEmail(email: string): Promise<UserRecord | null> {
    if (process.env.NODE_ENV === 'test') {
      await this.memStore.initialize();
      return this.memStore.findByEmail(email);
    }
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: { student: true },
    });
    return (user as unknown as UserRecord) || null;
  }

  async findById(id: string): Promise<UserRecord | null> {
    if (process.env.NODE_ENV === 'test') {
      await this.memStore.initialize();
      return this.memStore.findById(id);
    }
    const user = await prisma.user.findUnique({
      where: { id },
      include: { student: true },
    });
    return (user as unknown as UserRecord) || null;
  }

  async createRefreshToken(userId: string, token: string, expiresAt: Date): Promise<RefreshTokenRecord> {
    const record: RefreshTokenRecord = {
      id: `rt-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
      token,
      userId,
      isRevoked: false,
      expiresAt,
      createdAt: new Date(),
    };

    if (process.env.NODE_ENV === 'test') {
      this.memStore.saveRefreshToken(record);
      return record;
    }

    const created = await prisma.refreshToken.create({
      data: {
        token,
        userId,
        expiresAt,
      },
    });
    return created as RefreshTokenRecord;
  }

  async findRefreshToken(token: string): Promise<RefreshTokenRecord | null> {
    if (process.env.NODE_ENV === 'test') {
      return this.memStore.findRefreshToken(token);
    }
    const record = await prisma.refreshToken.findUnique({
      where: { token },
    });
    return (record as RefreshTokenRecord) || null;
  }

  async revokeRefreshToken(token: string): Promise<void> {
    if (process.env.NODE_ENV === 'test') {
      this.memStore.revokeRefreshToken(token);
      return;
    }
    await prisma.refreshToken.update({
      where: { token },
      data: { isRevoked: true },
    });
  }

  toDto(user: UserRecord): CurrentUserDto {
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      student: user.student
        ? {
            id: user.student.id,
            registerNumber: user.student.registerNumber,
            department: user.student.department,
            batchYear: user.student.batchYear,
            cgpa: user.student.cgpa,
          }
        : null,
    };
  }
}

export const userRepository = new UserRepository();
