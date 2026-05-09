import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ModifyCurrencyDto } from './dto/modify-currency.dto';

const currencyBalanceSelect = {
  id: true,
  balance: true,
  createdAt: true,
  updatedAt: true,
  currencyDefinition: {
    select: {
      id: true,
      code: true,
      name: true,
      metadata: true,
    },
  },
} as const;

@Injectable()
export class CurrencyService {
  constructor(private readonly prisma: PrismaService) {}

  async getMyBalances(userId: string, gameKey: string) {
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
        currencyBalances: {
          select: currencyBalanceSelect,
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
      balances: playerProfile?.currencyBalances ?? [],
    };
  }

  async addCurrency(userId: string, dto: ModifyCurrencyDto) {
    const game = await this.findGameByKey(dto.gameKey);
    const currencyDefinition = await this.findCurrencyDefinition(
      game.id,
      dto.currencyCode,
    );

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

      const existingBalance = await tx.currencyBalance.findUnique({
        where: {
          playerProfileId_currencyDefinitionId: {
            playerProfileId: playerProfile.id,
            currencyDefinitionId: currencyDefinition.id,
          },
        },
      });

      if (existingBalance) {
        return tx.currencyBalance.update({
          where: { id: existingBalance.id },
          data: {
            balance: {
              increment: dto.amount,
            },
          },
          select: currencyBalanceSelect,
        });
      }

      return tx.currencyBalance.create({
        data: {
          playerProfileId: playerProfile.id,
          currencyDefinitionId: currencyDefinition.id,
          balance: dto.amount,
        },
        select: currencyBalanceSelect,
      });
    });
  }

  async spendCurrency(userId: string, dto: ModifyCurrencyDto) {
    const game = await this.findGameByKey(dto.gameKey);
    const currencyDefinition = await this.findCurrencyDefinition(
      game.id,
      dto.currencyCode,
    );

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

      const existingBalance = await tx.currencyBalance.findUnique({
        where: {
          playerProfileId_currencyDefinitionId: {
            playerProfileId: playerProfile.id,
            currencyDefinitionId: currencyDefinition.id,
          },
        },
      });

      if (!existingBalance) {
        throw new NotFoundException('Currency balance was not found');
      }

      if (existingBalance.balance < dto.amount) {
        throw new BadRequestException('Not enough balance to spend');
      }

      return tx.currencyBalance.update({
        where: { id: existingBalance.id },
        data: {
          balance: {
            decrement: dto.amount,
          },
        },
        select: currencyBalanceSelect,
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

  private async findCurrencyDefinition(gameId: string, currencyCode: string) {
    const currencyDefinition = await this.prisma.currencyDefinition.findUnique({
      where: {
        gameId_code: {
          gameId,
          code: currencyCode,
        },
      },
      select: {
        id: true,
        code: true,
        name: true,
      },
    });

    if (!currencyDefinition) {
      throw new NotFoundException('Currency definition was not found');
    }

    return currencyDefinition;
  }
}
