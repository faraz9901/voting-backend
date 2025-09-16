/*
  Warnings:

  - Made the column `userId` on table `Poll` required. This step will fail if there are existing NULL values in that column.
  - Made the column `pollId` on table `PollOption` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "public"."Poll" DROP CONSTRAINT "Poll_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."PollOption" DROP CONSTRAINT "PollOption_pollId_fkey";

-- AlterTable
ALTER TABLE "public"."Poll" ALTER COLUMN "userId" SET NOT NULL;

-- AlterTable
ALTER TABLE "public"."PollOption" ALTER COLUMN "pollId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."Poll" ADD CONSTRAINT "Poll_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PollOption" ADD CONSTRAINT "PollOption_pollId_fkey" FOREIGN KEY ("pollId") REFERENCES "public"."Poll"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
