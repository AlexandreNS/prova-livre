import prisma from '@prova-livre/backend/database';
import { QuestionType } from '@prova-livre/shared/constants/QuestionType';
import { StudentApplicationStatus } from '@prova-livre/shared/constants/StudentApplicationStatus';
import { shuffleSeed } from '@prova-livre/shared/helpers/array.helper';
import { add, date } from '@prova-livre/shared/helpers/date.helper';
import { number } from '@prova-livre/shared/helpers/number.helper';
import { string, stripTags } from '@prova-livre/shared/helpers/string.helper';

export async function getStudentApplication(companyId: number, studentApplicationId: number) {
  const application = await prisma.application.findFirstOrThrow({
    orderBy: [{ startedAt: 'asc' }, { endedAt: 'asc' }],
    where: {
      companyId, // check company
      studentApplications: {
        some: { id: studentApplicationId },
      },
    },
    include: {
      exam: true,
      studentApplications: {
        where: { id: studentApplicationId },
        include: {
          student: true,
          studentApplicationQuestions: {
            orderBy: { id: 'asc' },
            include: {
              question: {
                include: { questionOptions: true },
              },
            },
          },
        },
      },
    },
  });

  let limitTimeAt;
  let isSubmitted;
  let isInitialized;
  let isExpired;
  let isAwaitingCorrection;

  const examRules = await prisma.examRule.findMany({
    where: { examId: application.examId },
    select: { questionsCount: true },
  });

  const questionsCount = examRules.reduce((acc, { questionsCount }) => acc + questionsCount, 0);

  const studentApplications = [];
  for (const studentApplication of application.studentApplications) {
    isAwaitingCorrection = false;
    limitTimeAt = add(studentApplication?.startedAt, { minutes: number(application?.limitTime) });
    isSubmitted = Boolean(studentApplication?.submittedAt);
    isInitialized = Boolean(studentApplication?.startedAt);
    isExpired = number(application?.limitTime) > 0 && limitTimeAt < new Date();

    let studentScoreSum: null | number = null;

    const questions = [];
    for (const saq of studentApplication.studentApplicationQuestions) {
      const { question, answer, questionScore, studentScore } = saq;

      if (saq.question.type === QuestionType.DISCURSIVE && saq.studentScore === null && isSubmitted) {
        isAwaitingCorrection = true;
      }

      const correctionStatus =
        typeof studentScore !== 'number'
          ? null
          : studentScore === number(questionScore)
            ? 'correct'
            : studentScore > 0
              ? 'partial'
              : 'incorrect';

      let correctOptionsCount: null | number = null;
      let correctSelectedOptionsCount: null | number = null;

      // question type rules
      if (question.type === QuestionType.OPTIONS) {
        const selectedOptions = string(answer).split(',').map(number);
        const correctOptions = question.questionOptions.filter(({ isCorrect }) => isCorrect).map(({ id }) => id);

        correctOptionsCount = correctOptions.length;
        correctSelectedOptionsCount = selectedOptions.filter((optionId) => correctOptions.includes(optionId)).length;
      }

      const questionOptions = [];
      for (const questionOption of question.questionOptions) {
        // verificar se vai mostrar o gabarito
        if (!studentApplication.submittedAt) {
          // @ts-expect-error
          delete questionOption.isCorrect;
        }

        questionOptions.push(questionOption);
      }

      // when submitted, sum score
      if (studentApplication.submittedAt) {
        studentScoreSum = number(studentScoreSum) + number(studentScore);
      }

      questions.push({
        ...question,
        studentApplicationQuestionId: saq.id,
        answer,
        correctOptionsCount,
        correctSelectedOptionsCount,
        questionScore,
        studentScore,
        correctionStatus,
        feedback: correctionStatus && isSubmitted && stripTags(saq.feedback) ? saq.feedback : null,
        questionOptions: shuffleSeed(questionOptions, date(studentApplication.createdAt).getTime()),
      });
    }

    studentApplications.push({
      ...studentApplication,
      studentScore: studentScoreSum,
      questions,
      status: isAwaitingCorrection
        ? StudentApplicationStatus.AWAITING_CORRECTION
        : isSubmitted
          ? StudentApplicationStatus.SUBMITTED
          : isExpired
            ? StudentApplicationStatus.EXPIRED
            : isInitialized
              ? StudentApplicationStatus.INITIALIZED
              : application.endedAt <= new Date()
                ? StudentApplicationStatus.ENDED
                : application.startedAt <= new Date()
                  ? StudentApplicationStatus.STARTED
                  : StudentApplicationStatus.WAITING,
    });
  }

  const status = isAwaitingCorrection
    ? StudentApplicationStatus.AWAITING_CORRECTION
    : isSubmitted
      ? StudentApplicationStatus.SUBMITTED
      : isExpired
        ? StudentApplicationStatus.EXPIRED
        : isInitialized
          ? StudentApplicationStatus.INITIALIZED
          : application.endedAt <= new Date()
            ? StudentApplicationStatus.ENDED
            : application.startedAt <= new Date()
              ? StudentApplicationStatus.STARTED
              : StudentApplicationStatus.WAITING;

  return {
    status,
    questionsCount,
    application,
    exam: application.exam,
    studentApplication: studentApplications.at(-1),
  };
}
