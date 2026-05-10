import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Prisma } from '../../generated/prisma';
import { PrismaService } from 'src/prisma/prisma.service';
import { RewardScheduleTypeDto } from './dto/scheduled-reward-query.dto';

const scheduledRewardDefinitionSelect = {
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

type ScheduledRewardDefinition = Prisma.ScheduledRewardDefinitionGetPayload<{
  select: typeof scheduledRewardDefinitionSelect;
}>;

@Injectable()
export class ScheduledRewardsService {
  constructor(private readonly prisma: PrismaService) {}

  async getMyScheduledRewards(
    userId: string,
    gameKey: string,
    scheduleType: RewardScheduleTypeDto,
  ) {
    const game = await this.findActiveGameByKey(gameKey);
    const rewardDefinitions = await this.getRewardDefinitions(game.id, scheduleType);

    if (rewardDefinitions.length === 0) {
      throw new NotFoundException(
        `${scheduleType.toLowerCase()} reward definitions were not found for this game`,
      );
    }

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
        scheduledRewardProgress: {
          where: {
            scheduleType,
          },
          select: {
            currentStreak: true,
            totalClaims: true,
            lastClaimedAt: true,
            lastClaimedPeriodStart: true,
            updatedAt: true,
          },
          take: 1,
        },
      },
    });

    const progress = playerProfile?.scheduledRewardProgress[0] ?? null;
    const currentPeriodStart = this.getPeriodStart(new Date(), scheduleType);
    const alreadyClaimedCurrentPeriod =
      this.isSameTimestamp(progress?.lastClaimedPeriodStart, currentPeriodStart);
    const nextStreak = this.getNextStreak(
      progress?.lastClaimedPeriodStart,
      progress?.currentStreak ?? 0,
      currentPeriodStart,
      scheduleType,
    );
    const nextRewardSequence = this.getRewardSequence(
      nextStreak,
      rewardDefinitions.length,
    );
    const nextReward =
      rewardDefinitions.find(
        (definition) => definition.sequence === nextRewardSequence,
      ) ?? null;

    return {
      game: {
        id: game.id,
        key: game.key,
        name: game.name,
      },
      scheduleType,
      playerProfile: playerProfile
        ? {
            id: playerProfile.id,
            displayName: playerProfile.displayName,
          }
        : null,
      progress: {
        currentStreak: progress?.currentStreak ?? 0,
        totalClaims: progress?.totalClaims ?? 0,
        lastClaimedAt: progress?.lastClaimedAt ?? null,
        lastClaimedPeriodStart: progress?.lastClaimedPeriodStart ?? null,
        alreadyClaimedCurrentPeriod,
        nextRewardSequence,
      },
      nextReward,
      rewards: rewardDefinitions,
    };
  }

  async claimScheduledReward(
    userId: string,
    gameKey: string,
    scheduleType: RewardScheduleTypeDto,
  ) {
    const game = await this.findActiveGameByKey(gameKey);
    const rewardDefinitions = await this.getRewardDefinitions(game.id, scheduleType);

    if (rewardDefinitions.length === 0) {
      throw new NotFoundException(
        `${scheduleType.toLowerCase()} reward definitions were not found for this game`,
      );
    }

    const currentPeriodStart = this.getPeriodStart(new Date(), scheduleType);

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

      const existingProgress = await tx.scheduledRewardProgress.findUnique({
        where: {
          playerProfileId_scheduleType: {
            playerProfileId: playerProfile.id,
            scheduleType,
          },
        },
      });

      if (
        existingProgress?.lastClaimedPeriodStart &&
        this.isSameTimestamp(
          existingProgress.lastClaimedPeriodStart,
          currentPeriodStart,
        )
      ) {
        throw new BadRequestException(
          `${scheduleType.toLowerCase()} reward has already been claimed for the current period`,
        );
      }

      const nextStreak = this.getNextStreak(
        existingProgress?.lastClaimedPeriodStart,
        existingProgress?.currentStreak ?? 0,
        currentPeriodStart,
        scheduleType,
      );
      const rewardSequence = this.getRewardSequence(
        nextStreak,
        rewardDefinitions.length,
      );
      const rewardDefinition =
        rewardDefinitions.find(
          (definition) => definition.sequence === rewardSequence,
        ) ?? null;

      if (!rewardDefinition) {
        throw new NotFoundException(
          `${scheduleType.toLowerCase()} reward definition for this sequence was not found`,
        );
      }

      await this.grantReward(tx, playerProfile.id, rewardDefinition);

      await tx.scheduledRewardClaim.create({
        data: {
          playerProfileId: playerProfile.id,
          scheduledRewardDefinitionId: rewardDefinition.id,
          scheduleType,
          claimedPeriodStart: currentPeriodStart,
          streakStep: nextStreak,
        },
      });

      const progress = existingProgress
        ? await tx.scheduledRewardProgress.update({
            where: {
              playerProfileId_scheduleType: {
                playerProfileId: playerProfile.id,
                scheduleType,
              },
            },
            data: {
              currentStreak: nextStreak,
              totalClaims: {
                increment: 1,
              },
              lastClaimedAt: new Date(),
              lastClaimedPeriodStart: currentPeriodStart,
            },
          })
        : await tx.scheduledRewardProgress.create({
            data: {
              playerProfileId: playerProfile.id,
              scheduleType,
              currentStreak: nextStreak,
              totalClaims: 1,
              lastClaimedAt: new Date(),
              lastClaimedPeriodStart: currentPeriodStart,
            },
          });

      return {
        game: {
          id: game.id,
          key: game.key,
          name: game.name,
        },
        scheduleType,
        reward: rewardDefinition,
        progress: {
          currentStreak: progress.currentStreak,
          totalClaims: progress.totalClaims,
          lastClaimedAt: progress.lastClaimedAt,
          lastClaimedPeriodStart: progress.lastClaimedPeriodStart,
          rewardSequence,
        },
      };
    });
  }

  async getMyRewardHistory(
    userId: string,
    gameKey: string,
    scheduleType: RewardScheduleTypeDto,
    limit = 10,
  ) {
    const game = await this.findActiveGameByKey(gameKey);
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
      },
    });

    if (!playerProfile) {
      return {
        game: {
          id: game.id,
          key: game.key,
          name: game.name,
        },
        scheduleType,
        playerProfile: null,
        claims: [],
      };
    }

    const claims = await this.prisma.scheduledRewardClaim.findMany({
      where: {
        playerProfileId: playerProfile.id,
        scheduleType,
      },
      orderBy: {
        claimedAt: 'desc',
      },
      take: limit,
      select: {
        id: true,
        scheduleType: true,
        claimedAt: true,
        claimedPeriodStart: true,
        streakStep: true,
        scheduledRewardDefinition: {
          select: scheduledRewardDefinitionSelect,
        },
      },
    });

    return {
      game: {
        id: game.id,
        key: game.key,
        name: game.name,
      },
      scheduleType,
      playerProfile: {
        id: playerProfile.id,
        displayName: playerProfile.displayName,
      },
      claims,
    };
  }

  private async grantReward(
    tx: Prisma.TransactionClient,
    playerProfileId: string,
    rewardDefinition: ScheduledRewardDefinition,
  ) {
    if (rewardDefinition.rewardType === 'CURRENCY') {
      if (!rewardDefinition.currencyDefinition) {
        throw new BadRequestException(
          'Scheduled reward currency definition is missing',
        );
      }

      const existingBalance = await tx.currencyBalance.findUnique({
        where: {
          playerProfileId_currencyDefinitionId: {
            playerProfileId,
            currencyDefinitionId: rewardDefinition.currencyDefinition.id,
          },
        },
      });

      if (existingBalance) {
        await tx.currencyBalance.update({
          where: { id: existingBalance.id },
          data: {
            balance: {
              increment: rewardDefinition.amount,
            },
          },
        });

        return;
      }

      await tx.currencyBalance.create({
        data: {
          playerProfileId,
          currencyDefinitionId: rewardDefinition.currencyDefinition.id,
          balance: rewardDefinition.amount,
        },
      });

      return;
    }

    if (!rewardDefinition.itemDefinition) {
      throw new BadRequestException('Scheduled reward item definition is missing');
    }

    if (!rewardDefinition.itemDefinition.stackable) {
      throw new BadRequestException(
        'Scheduled reward item definition must be stackable in this v1 implementation',
      );
    }

    const existingEntry = await tx.inventoryEntry.findUnique({
      where: {
        playerProfileId_itemDefinitionId: {
          playerProfileId,
          itemDefinitionId: rewardDefinition.itemDefinition.id,
        },
      },
    });

    if (existingEntry) {
      await tx.inventoryEntry.update({
        where: { id: existingEntry.id },
        data: {
          quantity: {
            increment: rewardDefinition.amount,
          },
        },
      });

      return;
    }

    await tx.inventoryEntry.create({
      data: {
        playerProfileId,
        itemDefinitionId: rewardDefinition.itemDefinition.id,
        quantity: rewardDefinition.amount,
      },
    });
  }

  private async getRewardDefinitions(
    gameId: string,
    scheduleType: RewardScheduleTypeDto,
  ) {
    return this.prisma.scheduledRewardDefinition.findMany({
      where: {
        gameId,
        scheduleType,
      },
      orderBy: {
        sequence: 'asc',
      },
      select: scheduledRewardDefinitionSelect,
    });
  }

  private async findActiveGameByKey(gameKey: string) {
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

  private getPeriodStart(date: Date, scheduleType: RewardScheduleTypeDto) {
    const year = date.getUTCFullYear();
    const month = date.getUTCMonth();
    const day = date.getUTCDate();

    if (scheduleType === RewardScheduleTypeDto.DAILY) {
      return new Date(Date.UTC(year, month, day));
    }

    if (scheduleType === RewardScheduleTypeDto.WEEKLY) {
      const currentDay = date.getUTCDay();
      const diffToMonday = currentDay === 0 ? 6 : currentDay - 1;
      return new Date(Date.UTC(year, month, day - diffToMonday));
    }

    return new Date(Date.UTC(year, 0, 1));
  }

  private getPreviousPeriodStart(
    currentPeriodStart: Date,
    scheduleType: RewardScheduleTypeDto,
  ) {
    const previous = new Date(currentPeriodStart);

    if (scheduleType === RewardScheduleTypeDto.DAILY) {
      previous.setUTCDate(previous.getUTCDate() - 1);
      return previous;
    }

    if (scheduleType === RewardScheduleTypeDto.WEEKLY) {
      previous.setUTCDate(previous.getUTCDate() - 7);
      return previous;
    }

    previous.setUTCFullYear(previous.getUTCFullYear() - 1);
    return previous;
  }

  private isSameTimestamp(
    left: Date | null | undefined,
    right: Date | null | undefined,
  ) {
    if (!left || !right) {
      return false;
    }

    return left.getTime() === right.getTime();
  }

  private getNextStreak(
    lastClaimedPeriodStart: Date | null | undefined,
    currentStreak: number,
    currentPeriodStart: Date,
    scheduleType: RewardScheduleTypeDto,
  ) {
    if (!lastClaimedPeriodStart) {
      return 1;
    }

    const previousPeriodStart = this.getPreviousPeriodStart(
      currentPeriodStart,
      scheduleType,
    );

    if (this.isSameTimestamp(lastClaimedPeriodStart, previousPeriodStart)) {
      return currentStreak + 1;
    }

    return 1;
  }

  private getRewardSequence(streakStep: number, rewardDefinitionCount: number) {
    return ((streakStep - 1) % rewardDefinitionCount) + 1;
  }
}
