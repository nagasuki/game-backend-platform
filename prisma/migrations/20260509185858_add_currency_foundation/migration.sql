-- CreateTable
CREATE TABLE "CurrencyDefinition" (
    "id" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CurrencyDefinition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CurrencyBalance" (
    "id" TEXT NOT NULL,
    "playerProfileId" TEXT NOT NULL,
    "currencyDefinitionId" TEXT NOT NULL,
    "balance" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CurrencyBalance_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CurrencyDefinition_gameId_code_key" ON "CurrencyDefinition"("gameId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "CurrencyBalance_playerProfileId_currencyDefinitionId_key" ON "CurrencyBalance"("playerProfileId", "currencyDefinitionId");

-- AddForeignKey
ALTER TABLE "CurrencyDefinition" ADD CONSTRAINT "CurrencyDefinition_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CurrencyBalance" ADD CONSTRAINT "CurrencyBalance_playerProfileId_fkey" FOREIGN KEY ("playerProfileId") REFERENCES "PlayerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CurrencyBalance" ADD CONSTRAINT "CurrencyBalance_currencyDefinitionId_fkey" FOREIGN KEY ("currencyDefinitionId") REFERENCES "CurrencyDefinition"("id") ON DELETE CASCADE ON UPDATE CASCADE;
