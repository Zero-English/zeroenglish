-- Backfill CombinedExamResult from the legacy QuizResults and
-- VocabularyExamResult tables. Data-only migration (no schema change).
--
-- QuizResults rows keep their original ids (columns map 1:1).
-- VocabularyExamResult rows get freshly assigned ids so the two (overlapping)
-- source id spaces never collide; derived scoring fields are computed from the
-- legacy word join tables (questionCount = correct + incorrect words,
-- correctAnswers/totalScore = correct words, timeTotalQuiz = timePerWord * total).

-- 1) Advance the identity sequence past every legacy quiz-result id so the
--    ids we assign to vocabulary results below can never collide.
SELECT setval(
    '"CombinedExamResult_id_seq"',
    GREATEST((SELECT COALESCE(MAX("id"), 1) FROM "QuizResults"),
             (SELECT COALESCE(MAX("id"), 1) FROM "VocabularyExamResult")),
    true
);

-- 2) Copy every legacy quiz result 1:1 (KEEP original ids).
INSERT INTO "CombinedExamResult"
    ("id", "userId", "clientId", "examId", "title", "mode", "quizTypeId",
     "questionCount", "levels", "timePerQuestion", "timeTotalQuiz",
     "scheduleEnabled", "scheduledOpeningTime", "scheduledClosingTime",
     "correctAnswers", "scoreInPercent", "totalScore", "status",
     "isFirstAttempt", "createdAt", "updatedAt")
SELECT "id", "userId", "clientId", "examId", "title", "mode", "quizTypeId",
       "questionCount", "levels", "timePerQuestion", "timeTotalQuiz",
       "scheduleEnabled", "scheduledOpeningTime", "scheduledClosingTime",
       "correctAnswers", "scoreInPercent", "totalScore", "status",
       "isFirstAttempt", "createdAt", "updatedAt"
FROM "QuizResults";

-- 3) Assign fresh ids to vocabulary exam results.
CREATE TEMP TABLE _vocab_id_map (old_id INT PRIMARY KEY, new_id INT);

INSERT INTO _vocab_id_map (old_id, new_id)
SELECT "id", nextval('"CombinedExamResult_id_seq"')
FROM "VocabularyExamResult"
ORDER BY "id";

INSERT INTO "CombinedExamResult"
    ("id", "userId", "correctAnswers", "scoreInPercent", "createdAt",
     "updatedAt", "levels", "timePerQuestion", "quizTypeId", "examId",
     "clientId", "title", "mode", "timeTotalQuiz", "scheduleEnabled",
     "status", "isFirstAttempt", "questionCount", "totalScore")
SELECT m.new_id,
       v."userId",
       COALESCE(cw.cnt, 0),
       v."scoreInPercent",
       v."createdAt",
       v."updatedAt",
       COALESCE(v."levels", '{}'::"Levels"[]),
       v."timePerWord",
       v."quizTypeId",
       NULL,
       NULL,
       'Vocabulary Exam',
       'PRACTICE'::"QuizMode",
       v."timePerWord" * (COALESCE(cw.cnt, 0) + COALESCE(iw.cnt, 0)),
       false,
       'SUBMITTED'::"QuizResultStatus",
       true,
       COALESCE(cw.cnt, 0) + COALESCE(iw.cnt, 0),
       COALESCE(cw.cnt, 0)
FROM _vocab_id_map m
JOIN "VocabularyExamResult" v ON v."id" = m.old_id
LEFT JOIN (
    SELECT "A", count(*) AS cnt FROM "_CorrectWords" GROUP BY "A"
) cw ON cw."A" = m.old_id
LEFT JOIN (
    SELECT "A", count(*) AS cnt FROM "_InCorrectWords" GROUP BY "A"
) iw ON iw."A" = m.old_id;

-- 4) Migrate the m2m relations. Legacy orientations:
--    _CorrectQuizQuestion / _IncorrectQuizQuestion: A = QuizQuestion, B = QuizResults
--    _CorrectWords / _InCorrectWords:               A = VocabularyExamResult, B = Word
INSERT INTO "_CombinedExamCorrectQuestions" ("A", "B")
SELECT r."id", c."A"
FROM "QuizResults" r
JOIN "_CorrectQuizQuestion" c ON c."B" = r."id";

INSERT INTO "_CombinedExamIncorrectQuestions" ("A", "B")
SELECT r."id", c."A"
FROM "QuizResults" r
JOIN "_IncorrectQuizQuestion" c ON c."B" = r."id";

INSERT INTO "_CombinedExamCorrectWords" ("A", "B")
SELECT m.new_id, w."B"
FROM _vocab_id_map m
JOIN "_CorrectWords" w ON w."A" = m.old_id;

INSERT INTO "_CombinedExamIncorrectWords" ("A", "B")
SELECT m.new_id, w."B"
FROM _vocab_id_map m
JOIN "_InCorrectWords" w ON w."A" = m.old_id;

-- 5) Keep the identity sequence ahead of every explicitly-set id.
SELECT setval(
    '"CombinedExamResult_id_seq"',
    GREATEST((SELECT MAX("id") FROM "CombinedExamResult"), 1),
    true
);

DROP TABLE _vocab_id_map;