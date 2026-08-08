import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { MailService } from '../mail/mail.service';
import { UnauthorizedException, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

jest.mock('bcryptjs', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

// ─── Mock dependencies ────────────────────────────────────────────────────────

const mockUsersService = {
  findByEmail: jest.fn(),
  create: jest.fn(),
  findById: jest.fn(),
  updateRefreshToken: jest.fn(),
  setVerificationCode: jest.fn(),
  findByVerificationCode: jest.fn(),
  activateAccount: jest.fn(),
  setResetPasswordCode: jest.fn(),
  findByResetCode: jest.fn(),
  updateProfile: jest.fn(),
};

const mockJwtService = {
  sign: jest.fn(() => 'mock-token'),
  verify: jest.fn(),
};

const mockConfigService = {
  get: jest.fn((key: string) => {
    const config: Record<string, string> = {
      'jwt.accessSecret': 'test-access-secret',
      'jwt.accessExpiresIn': '15m',
      'jwt.refreshSecret': 'test-refresh-secret',
      'jwt.refreshExpiresIn': '7d',
      appUrl: 'https://cms.hieurury.id.vn',
    };
    return config[key] ?? null;
  }),
};

const mockMailService = {
  sendOtpEmail: jest.fn().mockResolvedValue(undefined),
  sendVerifyEmail: jest.fn().mockResolvedValue(undefined),
  sendResetPasswordEmail: jest.fn().mockResolvedValue(undefined),
  sendMail: jest.fn().mockResolvedValue(undefined),
};

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('AuthService (Unit Tests)', () => {
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: MailService, useValue: mockMailService },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  // ─── login ────────────────────────────────────────────────────────────────

  describe('login', () => {
    it('should throw UnauthorizedException if user not found', async () => {
      mockUsersService.findByEmail.mockResolvedValue(null);

      await expect(
        authService.login({ email: 'test@test.com', password: 'password' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if password is wrong', async () => {
      const mockUser = {
        _id: 'userId',
        email: 'test@test.com',
        password: 'hashedPassword',
        isEmailVerified: true,
      };
      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        authService.login({ email: 'test@test.com', password: 'wrongPassword' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should return requiresVerification if email not verified', async () => {
      const mockUser = {
        _id: { toString: () => 'userId' },
        email: 'test@test.com',
        password: 'hashedPassword',
        name: 'Test',
        isEmailVerified: false,
      };
      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-otp');
      mockUsersService.setVerificationCode.mockResolvedValue(undefined);

      const result = await authService.login({
        email: 'test@test.com',
        password: 'password',
      });

      expect(result).toHaveProperty('requiresVerification', true);
      expect(result).toHaveProperty('userId');
    });

    it('should return tokens on successful login with verified email', async () => {
      const mockUser = {
        _id: { toString: () => 'userId' },
        email: 'test@test.com',
        password: 'hashedPassword',
        name: 'Test User',
        isEmailVerified: true,
      };
      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-refresh');
      mockUsersService.updateRefreshToken.mockResolvedValue(undefined);

      const result = await authService.login({
        email: 'test@test.com',
        password: 'password',
      });

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
    });
  });

  // ─── register ─────────────────────────────────────────────────────────────

  describe('register', () => {
    it('should throw ConflictException if verified user already exists', async () => {
      mockUsersService.findByEmail.mockResolvedValue({
        _id: 'existingId',
        isEmailVerified: true,
      });

      await expect(
        authService.register({ email: 'test@test.com', password: 'password' }),
      ).rejects.toThrow(ConflictException);
    });

    it('should create account and return userId for new user', async () => {
      mockUsersService.findByEmail.mockResolvedValue(null);
      const mockUser = {
        _id: { toString: () => 'newUserId' },
        email: 'test@test.com',
        name: 'test',
      };
      mockUsersService.create.mockResolvedValue(mockUser);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-value');
      mockUsersService.setVerificationCode.mockResolvedValue(undefined);

      const result = await authService.register({
        email: 'test@test.com',
        password: 'password',
      });

      expect(result).toHaveProperty('userId', 'newUserId');
      expect(result).toHaveProperty('message');
    });
  });
});
