import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ModifyInventoryDto } from './dto/modify-inventory.dto';

const inventoryEntrySelect = {
  id: true,
  quantity: true,
  createdAt: true,
  updatedAt: true,
  itemDefinition: {
    select: {
      id: true,
      code: true,
      name: true,
      type: true,
      stackable: true,
      metadata: true,
    },
  },
} as const;

@Injectable()
export class InventoryService {
  constructor(private readonly prisma: PrismaService) {}

  async getMyInventory(userId: string, gameKey: string) {
    const game = await this.findGameByKey(gameKey);

    const playerProfile = await this.prisma.playerProfile.findUnique({
      where: {
        userId_gameId: {
          userId,
          gameId: game.id,
        },
      },
      select: {
        id: true,
        displayName: true,
        createdAt: true,
        updatedAt: true,
        inventoryEntries: {
          select: inventoryEntrySelect,
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    });

    return {
      game: {
        id: game.id,
        key: game.key,
        name: game.name,
      },
      playerProfile: playerProfile
        ? {
            id: playerProfile.id,
            displayName: playerProfile.displayName,
            createdAt: playerProfile.createdAt,
            updatedAt: playerProfile.updatedAt,
          }
        : null,
      items: playerProfile?.inventoryEntries ?? [],
    };
  }

  async addItem(userId: string, dto: ModifyInventoryDto) {
    const game = await this.findGameByKey(dto.gameKey);
    const itemDefinition = await this.findStackableItemDefinition(game.id, dto.itemCode);

    return this.prisma.$transaction(async (tx) => {
      let playerProfile = await tx.playerProfile.findUnique({
        where: {
          userId_gameId: {
            userId,
            gameId: game.id,
          },
        },
      });

      if (!playerProfile) {
        const user = await tx.user.findUnique({
          where: { id: userId },
          select: {
            username: true,
          },
        });

        playerProfile = await tx.playerProfile.create({
          data: {
            userId,
            gameId: game.id,
            displayName: user?.username,
          },
        });
      }

      const existingEntry = await tx.inventoryEntry.findUnique({
        where: {
          playerProfileId_itemDefinitionId: {
            playerProfileId: playerProfile.id,
            itemDefinitionId: itemDefinition.id,
          },
        },
      });

      if (existingEntry) {
        await tx.inventoryEntry.update({
          where: { id: existingEntry.id },
          data: {
            quantity: {
              increment: dto.quantity,
            },
          },
        });
      } else {
        await tx.inventoryEntry.create({
          data: {
            playerProfileId: playerProfile.id,
            itemDefinitionId: itemDefinition.id,
            quantity: dto.quantity,
          },
        });
      }

      return tx.inventoryEntry.findUnique({
        where: {
          playerProfileId_itemDefinitionId: {
            playerProfileId: playerProfile.id,
            itemDefinitionId: itemDefinition.id,
          },
        },
        select: inventoryEntrySelect,
      });
    });
  }

  async removeItem(userId: string, dto: ModifyInventoryDto) {
    const game = await this.findGameByKey(dto.gameKey);
    const itemDefinition = await this.findStackableItemDefinition(game.id, dto.itemCode);

    return this.prisma.$transaction(async (tx) => {
      const playerProfile = await tx.playerProfile.findUnique({
        where: {
          userId_gameId: {
            userId,
            gameId: game.id,
          },
        },
      });

      if (!playerProfile) {
        throw new NotFoundException('Player profile for this game was not found');
      }

      const existingEntry = await tx.inventoryEntry.findUnique({
        where: {
          playerProfileId_itemDefinitionId: {
            playerProfileId: playerProfile.id,
            itemDefinitionId: itemDefinition.id,
          },
        },
      });

      if (!existingEntry) {
        throw new NotFoundException('Inventory item was not found');
      }

      if (existingEntry.quantity < dto.quantity) {
        throw new BadRequestException('Not enough item quantity to remove');
      }

      if (existingEntry.quantity === dto.quantity) {
        await tx.inventoryEntry.delete({
          where: { id: existingEntry.id },
        });

        return {
          removed: true,
          itemCode: itemDefinition.code,
          quantity: 0,
        };
      }

      return tx.inventoryEntry.update({
        where: { id: existingEntry.id },
        data: {
          quantity: {
            decrement: dto.quantity,
          },
        },
        select: inventoryEntrySelect,
      });
    });
  }

  private async findGameByKey(gameKey: string) {
    const game = await this.prisma.game.findUnique({
      where: { key: gameKey },
      select: {
        id: true,
        key: true,
        name: true,
        isActive: true,
      },
    });

    if (!game || !game.isActive) {
      throw new NotFoundException('Game was not found or is inactive');
    }

    return game;
  }

  private async findStackableItemDefinition(gameId: string, itemCode: string) {
    const itemDefinition = await this.prisma.itemDefinition.findUnique({
      where: {
        gameId_code: {
          gameId,
          code: itemCode,
        },
      },
      select: {
        id: true,
        code: true,
        name: true,
        type: true,
        stackable: true,
      },
    });

    if (!itemDefinition) {
      throw new NotFoundException('Item definition was not found');
    }

    if (!itemDefinition.stackable) {
      throw new BadRequestException(
        'This inventory API currently supports stackable items only',
      );
    }

    return itemDefinition;
  }
}
