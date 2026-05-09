import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AdminGuard } from 'src/auth/guards/admin.guard';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { AdminService } from './admin.service';
import { CreateDailyRewardDefinitionDto } from './dto/create-daily-reward-definition.dto';
import { CreateCurrencyDefinitionDto } from './dto/create-currency-definition.dto';
import { CreateGameDto } from './dto/create-game.dto';
import { CreateItemDefinitionDto } from './dto/create-item-definition.dto';
import { GameScopedQueryDto } from './dto/game-scoped-query.dto';
import { UpdateDailyRewardDefinitionDto } from './dto/update-daily-reward-definition.dto';
import { UpdateCurrencyDefinitionDto } from './dto/update-currency-definition.dto';
import { UpdateGameDto } from './dto/update-game.dto';
import { UpdateItemDefinitionDto } from './dto/update-item-definition.dto';

@ApiTags('admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, AdminGuard)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @ApiOperation({ summary: 'List all games' })
  @Get('games')
  getGames() {
    return this.adminService.getGames();
  }

  @ApiOperation({ summary: 'Create a new game' })
  @Post('games')
  createGame(@Body() dto: CreateGameDto) {
    return this.adminService.createGame(dto);
  }

  @ApiOperation({ summary: 'Update a game' })
  @Patch('games/:gameId')
  updateGame(@Param('gameId') gameId: string, @Body() dto: UpdateGameDto) {
    return this.adminService.updateGame(gameId, dto);
  }

  @ApiOperation({ summary: 'Delete a game if it has no player data' })
  @Delete('games/:gameId')
  deleteGame(@Param('gameId') gameId: string) {
    return this.adminService.deleteGame(gameId);
  }

  @ApiOperation({ summary: 'List item definitions for a game' })
  @Get('items')
  getItemDefinitions(@Query() query: GameScopedQueryDto) {
    return this.adminService.getItemDefinitions(query.gameKey);
  }

  @ApiOperation({ summary: 'Create an item definition' })
  @Post('items')
  createItemDefinition(@Body() dto: CreateItemDefinitionDto) {
    return this.adminService.createItemDefinition(dto);
  }

  @ApiOperation({ summary: 'Update an item definition' })
  @Patch('items/:itemDefinitionId')
  updateItemDefinition(
    @Param('itemDefinitionId') itemDefinitionId: string,
    @Body() dto: UpdateItemDefinitionDto,
  ) {
    return this.adminService.updateItemDefinition(itemDefinitionId, dto);
  }

  @ApiOperation({ summary: 'Delete an item definition if it is not in use' })
  @Delete('items/:itemDefinitionId')
  deleteItemDefinition(@Param('itemDefinitionId') itemDefinitionId: string) {
    return this.adminService.deleteItemDefinition(itemDefinitionId);
  }

  @ApiOperation({ summary: 'List currency definitions for a game' })
  @Get('currencies')
  getCurrencyDefinitions(@Query() query: GameScopedQueryDto) {
    return this.adminService.getCurrencyDefinitions(query.gameKey);
  }

  @ApiOperation({ summary: 'Create a currency definition' })
  @Post('currencies')
  createCurrencyDefinition(@Body() dto: CreateCurrencyDefinitionDto) {
    return this.adminService.createCurrencyDefinition(dto);
  }

  @ApiOperation({ summary: 'Update a currency definition' })
  @Patch('currencies/:currencyDefinitionId')
  updateCurrencyDefinition(
    @Param('currencyDefinitionId') currencyDefinitionId: string,
    @Body() dto: UpdateCurrencyDefinitionDto,
  ) {
    return this.adminService.updateCurrencyDefinition(currencyDefinitionId, dto);
  }

  @ApiOperation({ summary: 'Delete a currency definition if it is not in use' })
  @Delete('currencies/:currencyDefinitionId')
  deleteCurrencyDefinition(
    @Param('currencyDefinitionId') currencyDefinitionId: string,
  ) {
    return this.adminService.deleteCurrencyDefinition(currencyDefinitionId);
  }

  @ApiOperation({ summary: 'List daily reward definitions for a game' })
  @Get('daily-rewards')
  getDailyRewardDefinitions(@Query() query: GameScopedQueryDto) {
    return this.adminService.getDailyRewardDefinitions(query.gameKey);
  }

  @ApiOperation({ summary: 'Create a daily reward definition' })
  @Post('daily-rewards')
  createDailyRewardDefinition(@Body() dto: CreateDailyRewardDefinitionDto) {
    return this.adminService.createDailyRewardDefinition(dto);
  }

  @ApiOperation({ summary: 'Update a daily reward definition' })
  @Patch('daily-rewards/:dailyRewardDefinitionId')
  updateDailyRewardDefinition(
    @Param('dailyRewardDefinitionId') dailyRewardDefinitionId: string,
    @Body() dto: UpdateDailyRewardDefinitionDto,
  ) {
    return this.adminService.updateDailyRewardDefinition(
      dailyRewardDefinitionId,
      dto,
    );
  }

  @ApiOperation({ summary: 'Delete a daily reward definition' })
  @Delete('daily-rewards/:dailyRewardDefinitionId')
  deleteDailyRewardDefinition(
    @Param('dailyRewardDefinitionId') dailyRewardDefinitionId: string,
  ) {
    return this.adminService.deleteDailyRewardDefinition(dailyRewardDefinitionId);
  }
}
