-- CreateTable
CREATE TABLE "BlacklistedAccessToken" (
    "id" TEXT NOT NULL,
    "jti" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BlacklistedAccessToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BlacklistedAccessToken_jti_key" ON "BlacklistedAccessToken"("jti");
