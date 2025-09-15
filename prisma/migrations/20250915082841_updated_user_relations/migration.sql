-- AlterTable
ALTER TABLE "public"."Poll" ADD COLUMN     "userId" TEXT,
ALTER COLUMN "isPublished" SET DEFAULT true;

-- AlterTable
ALTER TABLE "public"."PollOption" ADD COLUMN     "pollId" TEXT;

-- AddForeignKey
ALTER TABLE "public"."Poll" ADD CONSTRAINT "Poll_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PollOption" ADD CONSTRAINT "PollOption_pollId_fkey" FOREIGN KEY ("pollId") REFERENCES "public"."Poll"("id") ON DELETE SET NULL ON UPDATE CASCADE;
