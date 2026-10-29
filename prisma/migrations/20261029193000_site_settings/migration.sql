-- CreateTable
CREATE TABLE IF NOT EXISTS "site_setting" (
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "site_setting_pkey" PRIMARY KEY ("key")
);
