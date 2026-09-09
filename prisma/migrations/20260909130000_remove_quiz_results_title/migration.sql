-- Reconcile the live database with schema.prisma: QuizResults no longer
-- stores a denormalized title (it lives on QuizExam). Fresh databases never
-- had this column, hence the IF EXISTS guard.
ALTER TABLE "QuizResults" DROP COLUMN IF EXISTS "title";