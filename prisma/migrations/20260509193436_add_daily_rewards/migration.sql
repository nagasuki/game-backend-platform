-- CreateEnum
CREATE TYPE "DailyRewardType" AS ENUM ('CURRENCY', 'ITEM');

-- CreateTable
CREATE TABLE "DailyRewardDefinition" (
    "id" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "day" INTEGER NOT NULL,
    "rewardType" "DailyRewardType" NOT NULL,
    "amount" INTEGER NOT NULL,
    "currencyDefinitionId" TEXT,
    "itemDefinitionId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DailyRewardDefinition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyRewardProgress" (
    "id" TEXT NOT NULL,
    "playerProfileId" TEXT NOT NULL,
    "currentStreak" INTEGER NOT NULL DEFAULT 0,
    "totalClaims" INTEGER NOT NULL DEFAULT 0,
    "lastClaimedDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DailyRewardProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyRewardClaim" (
    "id" TEXT NOT NULL,
    "playerProfileId" TEXT NOT NULL,
    "dailyRewardDefinitionId" TEXT NOT NULL,
    "claimedForDate" TIMESTAMP(3) NOT NULL,
    "streakDay" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DailyRewardClaim_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DailyRewardDefinition_gameId_day_key" ON "DailyRewardDefinition"("gameId", "day");

-- CreateIndex
CREATE UNIQUE INDEX "DailyRewardProgress_playerProfileId_key" ON "DailyRewardProgress"("playerProfileId");

-- CreateIndex
CREATE UNIQUE INDEX "DailyRewardClaim_playerProfileId_claimedForDate_key" ON "DailyRewardClaim"("playerProfileId", "claimedForDate");

-- AddForeignKey
ALTER TABLE "DailyRewardDefinition" ADD CONSTRAINT "DailyRewardDefinition_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyRewardDefinition" ADD CONSTRAINT "DailyRewardDefinition_currencyDefinitionId_fkey" FOREIGN KEY ("currencyDefinitionId") REFERENCES "CurrencyDefinition"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyRewardDefinition" ADD CONSTRAINT "DailyRewardDefinition_itemDefinitionId_fkey" FOREIGN KEY ("itemDefinitionId") REFERENCES "ItemDefinition"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyRewardProgress" ADD CONSTRAINT "DailyRewardProgress_playerProfileId_fkey" FOREIGN KEY ("playerProfileId") REFERENCES "PlayerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyRewardClaim" ADD CONSTRAINT "DailyRewardClaim_playerProfileId_fkey" FOREIGN KEY ("playerProfileId") REFERENCES "PlayerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyRewardClaim" ADD CONSTRAINT "DailyRewardClaim_dailyRewardDefinitionId_fkey" FOREIGN KEY ("dailyRewardDefinitionId") REFERENCES "DailyRewardDefinition"("id") ON DELETE CASCADE ON UPDATE CASCADE;
