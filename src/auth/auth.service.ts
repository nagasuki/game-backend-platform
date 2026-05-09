import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { createHash, randomUUID } from 'node:crypto';
import { PrismaService } from 'src/prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

type SafeUser = {
  id: string;
  email: string;
  username: string;
  isAdmin: boolean;
  createdAt: Date;
};

const safeUserSelect = {
  id: true,
  email: true,
  username: true,
  isAdmin: true,
  createdAt: true,
} as const;

type AuthTokens = {
  access_token: string;
  refresh_token: string;
};

type AuthResponse = AuthTokens & {
  user: SafeUser;
};

@Injectable()
export class AuthService {
    constructor(
      private readonly jwtService: JwtService,
      private readonly prisma: PrismaService,
    ) {}

    async register(registerDto: RegisterDto): Promise<AuthResponse> {
        const existingUser = await this.prisma.user.findUnique({
            where: { email: registerDto.email },
        });

        if (existingUser) {
            throw new ConflictException('Email already exists');
        }

        const passwordHash = await bcrypt.hash(registerDto.password, 10);
        const adminCount = await this.prisma.user.count({
          where: { isAdmin: true },
        });

        const user = await this.prisma.user.create({
            data: {
                email: registerDto.email,
                username: registerDto.username,
                isAdmin: adminCount === 0,
                passwordHash,
            },
            select: safeUserSelect,
        });

        const tokens = await this.generateTokens(user.id, user.email);
        await this.updateRefreshTokenHash(user.id, tokens.refresh_token);

        return {
            ...tokens,
            user: this.toSafeUser(user),
        };
    }

    async login(loginDto: LoginDto): Promise<AuthResponse> {
        const user = await this.prisma.user.findUnique({
            where: { email: loginDto.email },
        });

        if (!user) {
            throw new UnauthorizedException('Invalid email or password');
        }

        const isPasswordValid = await bcrypt.compare(
            loginDto.password,
            user.passwordHash,
        );

        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid email or password');
        }

        const tokens = await this.generateTokens(user.id, user.email);
        await this.updateRefreshTokenHash(user.id, tokens.refresh_token);

        return {
            ...tokens,
            user: this.toSafeUser(user),
        };
    }

    async refresh(refreshToken: string): Promise<AuthResponse> {
        const payload = await this.verifyRefreshToken(refreshToken);

        const user = await this.prisma.user.findUnique({
            where: { id: payload.sub },
        });

        if (!user || !user.refreshTokenHash) {
            throw new UnauthorizedException('Invalid refresh token');
        }

        const isRefreshTokenValid =
            this.hashRefreshToken(refreshToken) === user.refreshTokenHash;

        if (!isRefreshTokenValid) {
            throw new UnauthorizedException('Invalid refresh token');
        }

        const tokens = await this.generateTokens(user.id, user.email);
        await this.updateRefreshTokenHash(user.id, tokens.refresh_token);

        return {
            ...tokens,
            user: this.toSafeUser(user),
        };
    }

    async logout(
        userId: string,
        tokenId: string,
        tokenExpiresAt: number,
    ): Promise<{ message: string }> {
        await this.prisma.blacklistedAccessToken.upsert({
            where: { jti: tokenId },
            update: {
                expiresAt: new Date(tokenExpiresAt * 1000),
            },
            create: {
                jti: tokenId,
                userId,
                expiresAt: new Date(tokenExpiresAt * 1000),
            },
        });

        await this.prisma.user.update({
            where: { id: userId },
            data: { refreshTokenHash: null },
        });

        return {
            message: 'Logged out successfully',
        };
    }

    async getMe(userId: string): Promise<SafeUser> {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: safeUserSelect,
        });

        if (!user) {
            throw new UnauthorizedException('User not found');
        }

        return this.toSafeUser(user);
    }

    private async generateTokens(
        userId: string,
        email: string,
    ): Promise<AuthTokens> {
        const accessPayload = {
            sub: userId,
            email,
            jti: randomUUID(),
        };

        const access_token = await this.jwtService.signAsync(accessPayload, {
            secret: process.env.JWT_SECRET || 'dev-secret',
            expiresIn: '15m',
        });

        const refreshPayload = {
            sub: userId,
            email,
            jti: randomUUID(),
        };

        const refresh_token = await this.jwtService.signAsync(refreshPayload, {
          secret:
              process.env.JWT_REFRESH_SECRET ||
              process.env.JWT_SECRET ||
              'dev-refresh-secret',
          expiresIn: '7d',
        });

        return {
            access_token,
            refresh_token,
        };
    }

    private async updateRefreshTokenHash(
        userId: string,
        refreshToken: string,
    ): Promise<void> {
        const refreshTokenHash = this.hashRefreshToken(refreshToken);

        await this.prisma.user.update({
            where: { id: userId },
            data: { refreshTokenHash },
        });
    }

    private async verifyRefreshToken(
        refreshToken: string,
    ): Promise<{ sub: string; email: string }> {
        try {
            return await this.jwtService.verifyAsync(refreshToken, {
                secret:
                    process.env.JWT_REFRESH_SECRET ||
                    process.env.JWT_SECRET ||
                    'dev-refresh-secret',
            });
        } catch {
            throw new UnauthorizedException('Invalid refresh token');
        }
    }

    private hashRefreshToken(refreshToken: string): string {
        return createHash('sha256').update(refreshToken).digest('hex');
    }

    private toSafeUser(user: {
        id: string;
        email: string;
        username: string;
        isAdmin: boolean;
        createdAt: Date;
    }): SafeUser {
        return {
            id: user.id,
            email: user.email,
            username: user.username,
            isAdmin: user.isAdmin,
            createdAt: user.createdAt,
        };
    }
}
