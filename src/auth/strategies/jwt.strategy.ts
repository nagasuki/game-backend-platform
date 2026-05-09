import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'dev-secret',
    });
  }

  async validate(payload: {
    sub: string;
    email: string;
    jti: string;
    exp: number;
  }) {
    const blacklistedToken = await this.prisma.blacklistedAccessToken.findUnique({
      where: { jti: payload.jti },
    });

    if (blacklistedToken) {
      throw new UnauthorizedException('Access token has been revoked');
    }

    return {
      userId: payload.sub,
      email: payload.email,
      tokenId: payload.jti,
      tokenExpiresAt: payload.exp,
    };
  }
}
