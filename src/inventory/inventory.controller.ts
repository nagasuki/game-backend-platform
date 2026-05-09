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
import { InventoryQueryDto } from './dto/inventory-query.dto';
import { ModifyInventoryDto } from './dto/modify-inventory.dto';
import { InventoryService } from './inventory.service';

@ApiTags('inventory')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @ApiOperation({ summary: 'Get the current user inventory for a specific game' })
  @Get('me')
  getMyInventory(
    @Req() req: Request & { user: { userId: string } },
    @Query() query: InventoryQueryDto,
  ) {
    return this.inventoryService.getMyInventory(req.user.userId, query.gameKey);
  }

  @ApiOperation({ summary: 'Add stackable items to the current user inventory' })
  @Post('add')
  addItem(
    @Req() req: Request & { user: { userId: string } },
    @Body() dto: ModifyInventoryDto,
  ) {
    return this.inventoryService.addItem(req.user.userId, dto);
  }

  @ApiOperation({ summary: 'Remove stackable items from the current user inventory' })
  @Post('remove')
  removeItem(
    @Req() req: Request & { user: { userId: string } },
    @Body() dto: ModifyInventoryDto,
  ) {
    return this.inventoryService.removeItem(req.user.userId, dto);
  }
}
