import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { MailService } from './mail.service';
import { UnauthorizedException, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
jest.mock('bcryptjs', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

// Mock dependencies
const mockUsersService = {
  findByEmail: jest.fn(),
  create: jest.fn(),
  findById: jest.fn(),
  updateRefreshToken: jest.fn(),
};

const mockJwtService = {
  sign: jest.fn(() => 'token'),
};

const mockConfigService = {
  get: jest.fn((key: string) => {
    switch (key) {
      case 'JWT_ACCESS_EXPIRES_IN':
        return '15m';
      case 'JWT_REFRESH_EXPIRES_IN':
        return '7d';
      case 'CLIENT_URL':
        return 'http://localhost:5173';
      default:
        return null;
    }
  }),
};

const mockMailService = {
  sendPasswordResetEmail: jest.fn(),
};

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
      };
      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        authService.login({
          email: 'test@test.com',
          password: 'wrongPassword',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should return tokens and user if login succeeds', async () => {
      const mockUser = {
        _id: { toString: () => 'userId' },
        email: 'test@test.com',
        password: 'hashedPassword',
        name: 'Test User',
      };
      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await authService.login({
        email: 'test@test.com',
        password: 'password',
      });

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result.user.email).toEqual('test@test.com');
      expect(mockUsersService.updateRefreshToken).toHaveBeenCalled();
    });
  });

  describe('register', () => {
    it('should throw ConflictException if user already exists', async () => {
      mockUsersService.findByEmail.mockResolvedValue({ _id: 'existingId' });

      await expect(
        authService.register({
          name: 'Test',
          email: 'test@test.com',
          password: 'password',
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('should successfully register a new user', async () => {
      mockUsersService.findByEmail.mockResolvedValue(null);
      const mockUser = {
        _id: { toString: () => 'userId' },
        email: 'test@test.com',
        name: 'Test',
      };
      mockUsersService.create.mockResolvedValue(mockUser);

      const result = await authService.register({
        name: 'Test',
        email: 'test@test.com',
        password: 'password',
      });

      expect(result).toHaveProperty('accessToken');
      expect(result.user.name).toEqual('Test');
    });
  });
});
