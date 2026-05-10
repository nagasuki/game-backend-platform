ALTER TYPE "DailyRewardType" RENAME TO "ScheduledRewardType";

ALTER TABLE "DailyRewardDefinition" RENAME TO "ScheduledRewardDefinition";
ALTER TABLE "DailyRewardProgress" RENAME TO "ScheduledRewardProgress";
ALTER TABLE "DailyRewardClaim" RENAME TO "ScheduledRewardClaim";

ALTER TABLE "ScheduledRewardClaim"
RENAME COLUMN "dailyRewardDefinitionId" TO "scheduledRewardDefinitionId";

ALTER INDEX "DailyRewardDefinition_gameId_scheduleType_sequence_key"
RENAME TO "ScheduledRewardDefinition_gameId_scheduleType_sequence_key";

ALTER INDEX "DailyRewardProgress_playerProfileId_scheduleType_key"
RENAME TO "ScheduledRewardProgress_playerProfileId_scheduleType_key";

ALTER INDEX "DailyRewardClaim_playerProfileId_scheduleType_claimedPeriodStart_key"
RENAME TO "ScheduledRewardClaim_playerProfileId_scheduleType_claimedPeriodStart_key";

ALTER TABLE "ScheduledRewardDefinition"
RENAME CONSTRAINT "DailyRewardDefinition_pkey" TO "ScheduledRewardDefinition_pkey";
ALTER TABLE "ScheduledRewardDefinition"
RENAME CONSTRAINT "DailyRewardDefinition_gameId_fkey" TO "ScheduledRewardDefinition_gameId_fkey";
ALTER TABLE "ScheduledRewardDefinition"
RENAME CONSTRAINT "DailyRewardDefinition_currencyDefinitionId_fkey" TO "ScheduledRewardDefinition_currencyDefinitionId_fkey";
ALTER TABLE "ScheduledRewardDefinition"
RENAME CONSTRAINT "DailyRewardDefinition_itemDefinitionId_fkey" TO "ScheduledRewardDefinition_itemDefinitionId_fkey";

ALTER TABLE "ScheduledRewardProgress"
RENAME CONSTRAINT "DailyRewardProgress_pkey" TO "ScheduledRewardProgress_pkey";
ALTER TABLE "ScheduledRewardProgress"
RENAME CONSTRAINT "DailyRewardProgress_playerProfileId_fkey" TO "ScheduledRewardProgress_playerProfileId_fkey";

ALTER TABLE "ScheduledRewardClaim"
RENAME CONSTRAINT "DailyRewardClaim_pkey" TO "ScheduledRewardClaim_pkey";
ALTER TABLE "ScheduledRewardClaim"
RENAME CONSTRAINT "DailyRewardClaim_playerProfileId_fkey" TO "ScheduledRewardClaim_playerProfileId_fkey";
ALTER TABLE "ScheduledRewardClaim"
RENAME CONSTRAINT "DailyRewardClaim_dailyRewardDefinitionId_fkey" TO "ScheduledRewardClaim_scheduledRewardDefinitionId_fkey";
