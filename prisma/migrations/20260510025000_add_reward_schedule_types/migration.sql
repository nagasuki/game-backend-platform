-- CreateEnum
CREATE TYPE "RewardScheduleType" AS ENUM ('DAILY', 'WEEKLY', 'YEARLY');

-- Drop old unique indexes before reshaping keys
DROP INDEX "DailyRewardClaim_playerProfileId_claimedForDate_key";
DROP INDEX "DailyRewardDefinition_gameId_day_key";
DROP INDEX "DailyRewardProgress_playerProfileId_key";

-- DailyRewardDefinition: promote daily-only schedule into generic scheduled rewards
ALTER TABLE "DailyRewardDefinition"
ADD COLUMN "scheduleType" "RewardScheduleType" NOT NULL DEFAULT 'DAILY',
ADD COLUMN "sequence" INTEGER;

UPDATE "DailyRewardDefinition"
SET "sequence" = "day";

ALTER TABLE "DailyRewardDefinition"
ALTER COLUMN "sequence" SET NOT NULL;

ALTER TABLE "DailyRewardDefinition"
DROP COLUMN "day";

CREATE UNIQUE INDEX "DailyRewardDefinition_gameId_scheduleType_sequence_key"
ON "DailyRewardDefinition"("gameId", "scheduleType", "sequence");

-- DailyRewardProgress: split progress by schedule type and preserve old daily data
ALTER TABLE "DailyRewardProgress"
ADD COLUMN "scheduleType" "RewardScheduleType" NOT NULL DEFAULT 'DAILY',
ADD COLUMN "lastClaimedAt" TIMESTAMP(3),
ADD COLUMN "lastClaimedPeriodStart" TIMESTAMP(3);

UPDATE "DailyRewardProgress"
SET
  "lastClaimedAt" = "lastClaimedDate",
  "lastClaimedPeriodStart" = CASE
    WHEN "lastClaimedDate" IS NULL THEN NULL
    ELSE date_trunc('day', "lastClaimedDate")
  END;

ALTER TABLE "DailyRewardProgress"
DROP COLUMN "lastClaimedDate";

CREATE UNIQUE INDEX "DailyRewardProgress_playerProfileId_scheduleType_key"
ON "DailyRewardProgress"("playerProfileId", "scheduleType");

-- DailyRewardClaim: preserve old daily claims and make claims unique per schedule period
ALTER TABLE "DailyRewardClaim"
ADD COLUMN "scheduleType" "RewardScheduleType" NOT NULL DEFAULT 'DAILY',
ADD COLUMN "claimedPeriodStart" TIMESTAMP(3),
ADD COLUMN "streakStep" INTEGER,
ADD COLUMN "claimedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

UPDATE "DailyRewardClaim"
SET
  "claimedPeriodStart" = date_trunc('day', "claimedForDate"),
  "streakStep" = "streakDay",
  "claimedAt" = "createdAt";

ALTER TABLE "DailyRewardClaim"
ALTER COLUMN "claimedPeriodStart" SET NOT NULL,
ALTER COLUMN "streakStep" SET NOT NULL;

ALTER TABLE "DailyRewardClaim"
DROP COLUMN "claimedForDate",
DROP COLUMN "streakDay";

CREATE UNIQUE INDEX "DailyRewardClaim_playerProfileId_scheduleType_claimedPeriodStart_key"
ON "DailyRewardClaim"("playerProfileId", "scheduleType", "claimedPeriodStart");
