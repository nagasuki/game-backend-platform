import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCurrencyDefinitionDto } from './dto/create-currency-definition.dto';
import {
  CreateScheduledRewardDefinitionDto,
  ScheduledRewardTypeDto,
} from './dto/create-scheduled-reward-definition.dto';
import { RewardScheduleTypeDto } from './dto/create-scheduled-reward-definition.dto';
import { CreateGameDto } from './dto/create-game.dto';
import { CreateItemDefinitionDto } from './dto/create-item-definition.dto';
import { UpdateScheduledRewardDefinitionDto } from './dto/update-scheduled-reward-definition.dto';
import { UpdateCurrencyDefinitionDto } from './dto/update-currency-definition.dto';
import { UpdateGameDto } from './dto/update-game.dto';
import { UpdateItemDefinitionDto } from './dto/update-item-definition.dto';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  private readonly scheduledRewardDefinitionSelect = {
    id: true,
    scheduleType: true,
    sequence: true,
    rewardType: true,
    amount: true,
    metadata: true,
    currencyDefinition: {
      select: {
        id: true,
        code: true,
        name: true,
      },
    },
    itemDefinition: {
      select: {
        id: true,
        code: true,
        name: true,
        type: true,
        stackable: true,
      },
    },
  } as const;

  async getGames() {
    return this.prisma.game.findMany({
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  async createGame(dto: CreateGameDto) {
    const existingGame = await this.prisma.game.findUnique({
      where: { key: dto.key },
    });

    if (existingGame) {
      throw new ConflictException('Game key already exists');
    }

    return this.prisma.game.create({
      data: {
        key: dto.key,
        name: dto.name,
        isActive: dto.isActive ?? true,
        metadata: dto.metadata as any,
      },
    });
  }

  async updateGame(gameId: string, dto: UpdateGameDto) {
    await this.ensureGameExists(gameId);

    return this.prisma.game.update({
      where: { id: gameId },
      data: {
        ...(dto.name !== undefined ? { name: dto.name } : {}),
        ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
        ...(dto.metadata !== undefined ? { metadata: dto.metadata as any } : {}),
      },
    });
  }

  async deleteGame(gameId: string) {
    const game = await this.prisma.game.findUnique({
      where: { id: gameId },
      include: {
        _count: {
          select: {
            playerProfiles: true,
            itemDefinitions: true,
            currencyDefinitions: true,
            scheduledRewardDefinitions: true,
          },
        },
      },
    });

    if (!game) {
      throw new NotFoundException('Game was not found');
    }

    if (game._count.playerProfiles > 0) {
      throw new ConflictException(
        'Cannot delete a game that already has player profiles',
      );
    }

    return this.prisma.game.delete({
      where: { id: gameId },
    });
  }

  async getItemDefinitions(gameKey: string) {
    const game = await this.findGameByKey(gameKey);

    return this.prisma.itemDefinition.findMany({
      where: { gameId: game.id },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  async createItemDefinition(dto: CreateItemDefinitionDto) {
    const game = await this.findGameByKey(dto.gameKey);

    const existingItem = await this.prisma.itemDefinition.findUnique({
      where: {
        gameId_code: {
          gameId: game.id,
          code: dto.code,
        },
      },
    });

    if (existingItem) {
      throw new ConflictException('Item code already exists in this game');
    }

    return this.prisma.itemDefinition.create({
      data: {
        gameId: game.id,
        code: dto.code,
        name: dto.name,
        type: dto.type,
        stackable: dto.stackable ?? true,
        metadata: dto.metadata as any,
      },
    });
  }

  async updateItemDefinition(
    itemDefinitionId: string,
    dto: UpdateItemDefinitionDto,
  ) {
    await this.ensureItemDefinitionExists(itemDefinitionId);

    return this.prisma.itemDefinition.update({
      where: { id: itemDefinitionId },
      data: {
        ...(dto.name !== undefined ? { name: dto.name } : {}),
        ...(dto.type !== undefined ? { type: dto.type } : {}),
        ...(dto.stackable !== undefined ? { stackable: dto.stackable } : {}),
        ...(dto.metadata !== undefined ? { metadata: dto.metadata as any } : {}),
      },
    });
  }

  async deleteItemDefinition(itemDefinitionId: string) {
    const itemDefinition = await this.prisma.itemDefinition.findUnique({
      where: { id: itemDefinitionId },
      include: {
        _count: {
          select: {
            inventoryEntries: true,
          },
        },
      },
    });

    if (!itemDefinition) {
      throw new NotFoundException('Item definition was not found');
    }

    if (itemDefinition._count.inventoryEntries > 0) {
      throw new ConflictException(
        'Cannot delete an item definition that is already in player inventories',
      );
    }

    const rewardUsage = await this.prisma.scheduledRewardDefinition.count({
      where: { itemDefinitionId },
    });

    if (rewardUsage > 0) {
      throw new ConflictException(
        'Cannot delete an item definition that is used by daily rewards',
      );
    }

    return this.prisma.itemDefinition.delete({
      where: { id: itemDefinitionId },
    });
  }

  async getCurrencyDefinitions(gameKey: string) {
    const game = await this.findGameByKey(gameKey);

    return this.prisma.currencyDefinition.findMany({
      where: { gameId: game.id },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  async createCurrencyDefinition(dto: CreateCurrencyDefinitionDto) {
    const game = await this.findGameByKey(dto.gameKey);

    const existingCurrency = await this.prisma.currencyDefinition.findUnique({
      where: {
        gameId_code: {
          gameId: game.id,
          code: dto.code,
        },
      },
    });

    if (existingCurrency) {
      throw new ConflictException('Currency code already exists in this game');
    }

    return this.prisma.currencyDefinition.create({
      data: {
        gameId: game.id,
        code: dto.code,
        name: dto.name,
        metadata: dto.metadata as any,
      },
    });
  }

  async updateCurrencyDefinition(
    currencyDefinitionId: string,
    dto: UpdateCurrencyDefinitionDto,
  ) {
    await this.ensureCurrencyDefinitionExists(currencyDefinitionId);

    return this.prisma.currencyDefinition.update({
      where: { id: currencyDefinitionId },
      data: {
        ...(dto.name !== undefined ? { name: dto.name } : {}),
        ...(dto.metadata !== undefined ? { metadata: dto.metadata as any } : {}),
      },
    });
  }

  async deleteCurrencyDefinition(currencyDefinitionId: string) {
    const currencyDefinition = await this.prisma.currencyDefinition.findUnique({
      where: { id: currencyDefinitionId },
      include: {
        _count: {
          select: {
            currencyBalances: true,
          },
        },
      },
    });

    if (!currencyDefinition) {
      throw new NotFoundException('Currency definition was not found');
    }

    if (currencyDefinition._count.currencyBalances > 0) {
      throw new ConflictException(
        'Cannot delete a currency definition that already has player balances',
      );
    }

    const rewardUsage = await this.prisma.scheduledRewardDefinition.count({
      where: { currencyDefinitionId },
    });

    if (rewardUsage > 0) {
      throw new ConflictException(
        'Cannot delete a currency definition that is used by daily rewards',
      );
    }

    return this.prisma.currencyDefinition.delete({
      where: { id: currencyDefinitionId },
    });
  }

  async getScheduledRewardDefinitions(
    gameKey: string,
    scheduleType?: RewardScheduleTypeDto,
  ) {
    const game = await this.findGameByKey(gameKey);

    return this.prisma.scheduledRewardDefinition.findMany({
      where: {
        gameId: game.id,
        ...(scheduleType ? { scheduleType } : {}),
      },
      orderBy: [{ scheduleType: 'asc' }, { sequence: 'asc' }],
      select: this.scheduledRewardDefinitionSelect,
    });
  }

  async createScheduledRewardDefinition(dto: CreateScheduledRewardDefinitionDto) {
    const game = await this.findGameByKey(dto.gameKey);
    const existingDefinition = await this.prisma.scheduledRewardDefinition.findUnique({
      where: {
        gameId_scheduleType_sequence: {
          gameId: game.id,
          scheduleType: dto.scheduleType,
          sequence: dto.sequence,
        },
      },
      select: { id: true },
    });

    if (existingDefinition) {
      throw new ConflictException(
        'Reward sequence already exists for this schedule type in this game',
      );
    }

    const rewardTarget = await this.resolveRewardTarget(
      game.id,
      dto.rewardType,
      dto.currencyCode,
      dto.itemCode,
    );

    return this.prisma.scheduledRewardDefinition.create({
      data: {
        gameId: game.id,
        scheduleType: dto.scheduleType,
        sequence: dto.sequence,
        rewardType: dto.rewardType,
        amount: dto.amount,
        currencyDefinitionId: rewardTarget.currencyDefinitionId,
        itemDefinitionId: rewardTarget.itemDefinitionId,
        metadata: dto.metadata as any,
      },
      select: this.scheduledRewardDefinitionSelect,
    });
  }

  async updateScheduledRewardDefinition(
    scheduledRewardDefinitionId: string,
    dto: UpdateScheduledRewardDefinitionDto,
  ) {
    const existingDefinition = await this.prisma.scheduledRewardDefinition.findUnique({
      where: { id: scheduledRewardDefinitionId },
      select: {
        id: true,
        gameId: true,
        scheduleType: true,
        sequence: true,
        rewardType: true,
      },
    });

    if (!existingDefinition) {
      throw new NotFoundException('Daily reward definition was not found');
    }

    const nextScheduleType = dto.scheduleType ?? existingDefinition.scheduleType;

    if (
      (dto.sequence !== undefined && dto.sequence !== existingDefinition.sequence) ||
      nextScheduleType !== existingDefinition.scheduleType
    ) {
      const conflictingDefinition = await this.prisma.scheduledRewardDefinition.findUnique({
        where: {
          gameId_scheduleType_sequence: {
            gameId: existingDefinition.gameId,
            scheduleType: nextScheduleType,
            sequence: dto.sequence ?? existingDefinition.sequence,
          },
        },
        select: { id: true },
      });

      if (conflictingDefinition) {
        throw new ConflictException(
          'Reward sequence already exists for this schedule type in this game',
        );
      }
    }

    const nextRewardType = dto.rewardType ?? existingDefinition.rewardType;
    const rewardTarget = await this.resolveRewardTarget(
      existingDefinition.gameId,
      nextRewardType,
      dto.currencyCode,
      dto.itemCode,
      true,
    );

    return this.prisma.scheduledRewardDefinition.update({
      where: { id: scheduledRewardDefinitionId },
      data: {
        ...(dto.scheduleType !== undefined
          ? { scheduleType: dto.scheduleType }
          : {}),
        ...(dto.sequence !== undefined ? { sequence: dto.sequence } : {}),
        ...(dto.amount !== undefined ? { amount: dto.amount } : {}),
        ...(dto.rewardType !== undefined
          ? { rewardType: dto.rewardType }
          : {}),
        ...(rewardTarget.currencyDefinitionId !== undefined
          ? { currencyDefinitionId: rewardTarget.currencyDefinitionId }
          : {}),
        ...(rewardTarget.itemDefinitionId !== undefined
          ? { itemDefinitionId: rewardTarget.itemDefinitionId }
          : {}),
        ...(dto.metadata !== undefined ? { metadata: dto.metadata as any } : {}),
      },
      select: this.scheduledRewardDefinitionSelect,
    });
  }

  async deleteScheduledRewardDefinition(scheduledRewardDefinitionId: string) {
    const scheduledRewardDefinition = await this.prisma.scheduledRewardDefinition.findUnique({
      where: { id: scheduledRewardDefinitionId },
      include: {
        _count: {
          select: {
            claims: true,
          },
        },
      },
    });

    if (!scheduledRewardDefinition) {
      throw new NotFoundException('Scheduled reward definition was not found');
    }

    if (scheduledRewardDefinition._count.claims > 0) {
      throw new ConflictException(
        'Cannot delete a scheduled reward definition that already has claims',
      );
    }

    return this.prisma.scheduledRewardDefinition.delete({
      where: { id: scheduledRewardDefinitionId },
    });
  }

  private async findGameByKey(gameKey: string) {
    const game = await this.prisma.game.findUnique({
      where: { key: gameKey },
    });

    if (!game) {
      throw new NotFoundException('Game was not found');
    }

    return game;
  }

  private async ensureGameExists(gameId: string) {
    const game = await this.prisma.game.findUnique({
      where: { id: gameId },
      select: { id: true },
    });

    if (!game) {
      throw new NotFoundException('Game was not found');
    }
  }

  private async ensureItemDefinitionExists(itemDefinitionId: string) {
    const itemDefinition = await this.prisma.itemDefinition.findUnique({
      where: { id: itemDefinitionId },
      select: { id: true },
    });

    if (!itemDefinition) {
      throw new NotFoundException('Item definition was not found');
    }
  }

  private async ensureCurrencyDefinitionExists(currencyDefinitionId: string) {
    const currencyDefinition = await this.prisma.currencyDefinition.findUnique({
      where: { id: currencyDefinitionId },
      select: { id: true },
    });

    if (!currencyDefinition) {
      throw new NotFoundException('Currency definition was not found');
    }
  }

  private async resolveRewardTarget(
    gameId: string,
    rewardType: string,
    currencyCode?: string,
    itemCode?: string,
    allowNoChange = false,
  ) {
    if (rewardType === ScheduledRewardTypeDto.CURRENCY) {
      if (!currencyCode) {
        if (allowNoChange && itemCode === undefined) {
          return {
            currencyDefinitionId: undefined,
            itemDefinitionId: undefined,
          };
        }

        throw new ConflictException(
          'currencyCode is required for currency scheduled rewards',
        );
      }

      const currencyDefinition = await this.prisma.currencyDefinition.findUnique({
        where: {
          gameId_code: {
            gameId,
            code: currencyCode,
          },
        },
        select: { id: true },
      });

      if (!currencyDefinition) {
        throw new NotFoundException('Currency definition was not found');
      }

      return {
        currencyDefinitionId: currencyDefinition.id,
        itemDefinitionId: null,
      };
    }

    if (!itemCode) {
      if (allowNoChange && currencyCode === undefined) {
        return {
          currencyDefinitionId: undefined,
          itemDefinitionId: undefined,
        };
      }

      throw new ConflictException('itemCode is required for item scheduled rewards');
    }

    const itemDefinition = await this.prisma.itemDefinition.findUnique({
      where: {
        gameId_code: {
          gameId,
          code: itemCode,
        },
      },
      select: {
        id: true,
        stackable: true,
      },
    });

    if (!itemDefinition) {
      throw new NotFoundException('Item definition was not found');
    }

    if (!itemDefinition.stackable) {
      throw new ConflictException(
        'Scheduled reward items must be stackable in this v1 implementation',
      );
    }

    return {
      currencyDefinitionId: null,
      itemDefinitionId: itemDefinition.id,
    };
  }
}
