import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CurrencyQueryDto } from './dto/currency-query.dto';
import { ModifyCurrencyDto } from './dto/modify-currency.dto';
import { CurrencyService } from './currency.service';

@ApiTags('currency')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('currency')
export class CurrencyController {
  constructor(private readonly currencyService: CurrencyService) {}

  @ApiOperation({ summary: 'Get the current user currency balances for a specific game' })
  @Get('me')
  getMyBalances(
    @Req() req: Request & { user: { userId: string } },
    @Query() query: CurrencyQueryDto,
  ) {
    return this.currencyService.getMyBalances(req.user.userId, query.gameKey);
  }

  @ApiOperation({ summary: 'Add currency to the current user balance' })
  @Post('add')
  addCurrency(
    @Req() req: Request & { user: { userId: string } },
    @Body() dto: ModifyCurrencyDto,
  ) {
    return this.currencyService.addCurrency(req.user.userId, dto);
  }

  @ApiOperation({ summary: 'Spend currency from the current user balance' })
  @Post('spend')
  spendCurrency(
    @Req() req: Request & { user: { userId: string } },
    @Body() dto: ModifyCurrencyDto,
  ) {
    return this.currencyService.spendCurrency(req.user.userId, dto);
  }
}
