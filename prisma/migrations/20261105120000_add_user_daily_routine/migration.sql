-- CreateTable
CREATE TABLE "UserDailyRoutine" (
    "userId" INTEGER NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "timezone" TEXT DEFAULT 'Asia/Dhaka',
    "targets" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserDailyRoutine_pkey" PRIMARY KEY ("userId")
);

-- AddForeignKey
ALTER TABLE "UserDailyRoutine" ADD CONSTRAINT "UserDailyRoutine_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
