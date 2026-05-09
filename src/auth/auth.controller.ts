import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { AuthService } from './auth.service';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'Register a new user' })
  @Post('register')
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @ApiOperation({ summary: 'Login and receive tokens' })
  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @ApiOperation({ summary: 'Refresh access and refresh tokens' })
  @Post('refresh')
  refresh(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refresh(refreshTokenDto.refreshToken);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout immediately and blacklist current access token' })
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  logout(
    @Req() req: Request & {
      user: { userId: string; tokenId: string; tokenExpiresAt: number };
    },
  ) {
    return this.authService.logout(
      req.user.userId,
      req.user.tokenId,
      req.user.tokenExpiresAt,
    );
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current authenticated user' })
  @UseGuards(JwtAuthGuard)
  @Get('me')
  getMe(@Req() req: Request & { user: { userId: string } }) {
    return this.authService.getMe(req.user.userId);
  }
}
