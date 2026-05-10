import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';
import { PrismaClient } from '../generated/prisma';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is not set');
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

async function main() {
  const adminPasswordHash = await bcrypt.hash('Admin123!', 10);

  await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {
      username: 'admin',
      isAdmin: true,
      passwordHash: adminPasswordHash,
    },
    create: {
      email: 'admin@example.com',
      username: 'admin',
      isAdmin: true,
      passwordHash: adminPasswordHash,
    },
  });

  const game = await prisma.game.upsert({
    where: { key: 'rpg-01' },
    update: {
      name: 'RPG Demo',
      isActive: true,
      metadata: {
        genre: 'rpg',
        environment: 'demo',
      } as any,
    },
    create: {
      key: 'rpg-01',
      name: 'RPG Demo',
      isActive: true,
      metadata: {
        genre: 'rpg',
        environment: 'demo',
      } as any,
    },
  });

  const itemDefinitions = [
    {
      code: 'potion_small',
      name: 'Small Potion',
      type: 'consumable',
      stackable: true,
      metadata: {
        heal: 50,
        rarity: 'common',
      },
    },
    {
      code: 'gem_red',
      name: 'Red Gem',
      type: 'material',
      stackable: true,
      metadata: {
        rarity: 'rare',
      },
    },
    {
      code: 'iron_sword',
      name: 'Iron Sword',
      type: 'weapon',
      stackable: false,
      metadata: {
        attack: 10,
        rarity: 'common',
      },
    },
  ];

  for (const item of itemDefinitions) {
    await prisma.itemDefinition.upsert({
      where: {
        gameId_code: {
          gameId: game.id,
          code: item.code,
        },
      },
      update: {
        name: item.name,
        type: item.type,
        stackable: item.stackable,
        metadata: item.metadata as any,
      },
      create: {
        gameId: game.id,
        code: item.code,
        name: item.name,
        type: item.type,
        stackable: item.stackable,
        metadata: item.metadata as any,
      },
    });
  }

  const currencyDefinitions = [
    {
      code: 'gold',
      name: 'Gold',
      metadata: {
        softCurrency: true,
      },
    },
    {
      code: 'gem',
      name: 'Gem',
      metadata: {
        premiumCurrency: true,
      },
    },
  ];

  for (const currency of currencyDefinitions) {
    await prisma.currencyDefinition.upsert({
      where: {
        gameId_code: {
          gameId: game.id,
          code: currency.code,
        },
      },
      update: {
        name: currency.name,
        metadata: currency.metadata as any,
      },
      create: {
        gameId: game.id,
        code: currency.code,
        name: currency.name,
        metadata: currency.metadata as any,
      },
    });
  }

  const goldCurrency = await prisma.currencyDefinition.findUniqueOrThrow({
    where: {
      gameId_code: {
        gameId: game.id,
        code: 'gold',
      },
    },
    select: { id: true },
  });

  const gemCurrency = await prisma.currencyDefinition.findUniqueOrThrow({
    where: {
      gameId_code: {
        gameId: game.id,
        code: 'gem',
      },
    },
    select: { id: true },
  });

  const potionItem = await prisma.itemDefinition.findUniqueOrThrow({
    where: {
      gameId_code: {
        gameId: game.id,
        code: 'potion_small',
      },
    },
    select: { id: true },
  });

  const scheduledRewardDefinitions = [
    {
      scheduleType: 'DAILY' as const,
      sequence: 1,
      rewardType: 'CURRENCY' as const,
      amount: 100,
      currencyDefinitionId: goldCurrency.id,
      itemDefinitionId: null,
      metadata: {
        label: 'Starter Gold',
      },
    },
    {
      scheduleType: 'DAILY' as const,
      sequence: 2,
      rewardType: 'ITEM' as const,
      amount: 2,
      currencyDefinitionId: null,
      itemDefinitionId: potionItem.id,
      metadata: {
        label: 'Potion Bundle',
      },
    },
    {
      scheduleType: 'DAILY' as const,
      sequence: 3,
      rewardType: 'CURRENCY' as const,
      amount: 1,
      currencyDefinitionId: gemCurrency.id,
      itemDefinitionId: null,
      metadata: {
        label: 'Premium Gem',
      },
    },
    {
      scheduleType: 'WEEKLY' as const,
      sequence: 1,
      rewardType: 'CURRENCY' as const,
      amount: 500,
      currencyDefinitionId: goldCurrency.id,
      itemDefinitionId: null,
      metadata: {
        label: 'Weekly Gold Chest',
      },
    },
    {
      scheduleType: 'WEEKLY' as const,
      sequence: 2,
      rewardType: 'ITEM' as const,
      amount: 5,
      currencyDefinitionId: null,
      itemDefinitionId: potionItem.id,
      metadata: {
        label: 'Weekly Potion Pack',
      },
    },
    {
      scheduleType: 'YEARLY' as const,
      sequence: 1,
      rewardType: 'CURRENCY' as const,
      amount: 10,
      currencyDefinitionId: gemCurrency.id,
      itemDefinitionId: null,
      metadata: {
        label: 'Yearly Gem Bonus',
      },
    },
  ];

  for (const reward of scheduledRewardDefinitions) {
    await prisma.scheduledRewardDefinition.upsert({
      where: {
        gameId_scheduleType_sequence: {
          gameId: game.id,
          scheduleType: reward.scheduleType,
          sequence: reward.sequence,
        },
      },
      update: {
        rewardType: reward.rewardType,
        amount: reward.amount,
        currencyDefinitionId: reward.currencyDefinitionId,
        itemDefinitionId: reward.itemDefinitionId,
        metadata: reward.metadata as any,
      },
      create: {
        gameId: game.id,
        scheduleType: reward.scheduleType,
        sequence: reward.sequence,
        rewardType: reward.rewardType,
        amount: reward.amount,
        currencyDefinitionId: reward.currencyDefinitionId,
        itemDefinitionId: reward.itemDefinitionId,
        metadata: reward.metadata as any,
      },
    });
  }

  console.log(
    `Seeded game ${game.key} with ${itemDefinitions.length} item definitions, ${currencyDefinitions.length} currency definitions, and ${scheduledRewardDefinitions.length} scheduled reward definitions`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
