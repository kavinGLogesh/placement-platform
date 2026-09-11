import { UserRepository, userRepository } from '../repositories/user.repository.js';
import { verifyPassword } from '../utils/password.util.js';
import {
  generateAccessToken,
  generateRefreshToken,
  getRefreshTokenExpiry,
} from '../utils/jwt.util.js';
import {
  LoginDto,
  RefreshDto,
  LogoutDto,
  AuthResponseData,
  CurrentUserDto,
} from '../types/auth.types.js';
import { AppError } from '../middleware/errorHandler.js';

export class AuthService {
  constructor(private readonly userRepo: UserRepository = userRepository) {}

  /**
   * Authenticates user credentials and issues Access + Refresh tokens
   */
  async login(dto: LoginDto): Promise<AuthResponseData> {
    const user = await this.userRepo.findByEmail(dto.email);

    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    if (!user.isActive) {
      throw new AppError('Account is deactivated. Please contact support.', 401);
    }

    const isPasswordValid = await verifyPassword(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new AppError('Invalid email or password', 401);
    }

    // Generate tokens
    const accessToken = generateAccessToken({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    const refreshTokenString = generateRefreshToken();
    const expiresAt = getRefreshTokenExpiry();

    await this.userRepo.createRefreshToken(user.id, refreshTokenString, expiresAt);

    return {
      user: this.userRepo.toDto(user),
      accessToken,
      refreshToken: refreshTokenString,
    };
  }

  /**
   * Refreshes access token using valid, non-revoked refresh token
   */
  async refreshToken(dto: RefreshDto): Promise<{ accessToken: string; refreshToken: string }> {
    const tokenRecord = await this.userRepo.findRefreshToken(dto.refreshToken);

    if (!tokenRecord) {
      throw new AppError('Invalid refresh token', 401);
    }

    if (tokenRecord.isRevoked) {
      throw new AppError('Refresh token has been revoked', 401);
    }

    if (new Date() > new Date(tokenRecord.expiresAt)) {
      throw new AppError('Refresh token has expired', 401);
    }

    const user = await this.userRepo.findById(tokenRecord.userId);
    if (!user || !user.isActive) {
      throw new AppError('User not found or deactivated', 401);
    }

    // Revoke used refresh token for rotation
    await this.userRepo.revokeRefreshToken(dto.refreshToken);

    // Issue new pair
    const newAccessToken = generateAccessToken({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    const newRefreshToken = generateRefreshToken();
    await this.userRepo.createRefreshToken(user.id, newRefreshToken, getRefreshTokenExpiry());

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  /**
   * Revokes refresh token on user logout
   */
  async logout(dto: LogoutDto): Promise<void> {
    if (dto.refreshToken) {
      await this.userRepo.revokeRefreshToken(dto.refreshToken);
    }
  }

  /**
   * Retrieves profile details for currently authenticated user
   */
  async getCurrentUser(userId: string): Promise<CurrentUserDto> {
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }
    return this.userRepo.toDto(user);
  }
}

export const authService = new AuthService();
