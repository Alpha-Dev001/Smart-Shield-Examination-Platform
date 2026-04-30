-- AlterTable
ALTER TABLE "Answer" ADD COLUMN     "awardedPoints" INTEGER,
ADD COLUMN     "gradedAt" TIMESTAMP(3),
ADD COLUMN     "gradedById" TEXT;

-- AlterTable
ALTER TABLE "Question" ADD COLUMN     "explanation" TEXT,
ADD COLUMN     "order" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "points" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "firstName" TEXT,
ADD COLUMN     "lastName" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Answer_sessionId_studentId_questionId_key" ON "Answer"("sessionId", "studentId", "questionId");

-- CreateIndex
CREATE UNIQUE INDEX "SessionParticipant_sessionId_studentId_key" ON "SessionParticipant"("sessionId", "studentId");

-- AddForeignKey
ALTER TABLE "Answer" ADD CONSTRAINT "Answer_gradedById_fkey" FOREIGN KEY ("gradedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProctoringEvent" ADD CONSTRAINT "ProctoringEvent_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
