import { Test } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { UserRole } from '../users/entities/user.entity';

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: Partial<Record<keyof UsersService, jest.Mock>>;
  let jwtService: Partial<Record<keyof JwtService, jest.Mock>>;

  beforeEach(async () => {
    usersService = {
      findByEmail: jest.fn(),
      create: jest.fn(),
    };
    jwtService = {
      signAsync: jest.fn().mockResolvedValue('signed-jwt-token'),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    authService = moduleRef.get(AuthService);
  });

  describe('register', () => {
    it('hashes the password and creates the user as role=user', async () => {
      (usersService.create as jest.Mock).mockImplementation(async (data) => ({
        id: '1',
        ...data,
      }));

      const result = await authService.register({
        email: 'test@example.com',
        name: 'Test',
        password: 'plainPassword123',
      });

      const createArgs = (usersService.create as jest.Mock).mock.calls[0][0];
      expect(createArgs.password).not.toBe('plainPassword123');
      expect(await bcrypt.compare('plainPassword123', createArgs.password)).toBe(
        true,
      );
      expect(createArgs.role).toBe(UserRole.USER);
      expect(result).not.toHaveProperty('password');
    });
  });

  describe('login', () => {
    it('returns an access token for valid credentials', async () => {
      const hashed = await bcrypt.hash('correct-password', 10);
      (usersService.findByEmail as jest.Mock).mockResolvedValue({
        id: '1',
        email: 'test@example.com',
        name: 'Test',
        role: UserRole.USER,
        password: hashed,
      });

      const result = await authService.login({
        email: 'test@example.com',
        password: 'correct-password',
      });

      expect(result.access_token).toBe('signed-jwt-token');
      expect(result.user).not.toHaveProperty('password');
    });

    it('throws UnauthorizedException for a wrong password', async () => {
      const hashed = await bcrypt.hash('correct-password', 10);
      (usersService.findByEmail as jest.Mock).mockResolvedValue({
        id: '1',
        email: 'test@example.com',
        password: hashed,
        role: UserRole.USER,
      });

      await expect(
        authService.login({ email: 'test@example.com', password: 'wrong-password' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('throws UnauthorizedException when the user does not exist', async () => {
      (usersService.findByEmail as jest.Mock).mockResolvedValue(null);

      await expect(
        authService.login({ email: 'nobody@example.com', password: 'whatever' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
