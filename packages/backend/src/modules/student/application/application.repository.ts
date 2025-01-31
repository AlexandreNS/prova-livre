import { QuestionTypeEnum } from '@prisma/client';
import prisma from '@prova-livre/backend/database';
import HttpException from '@prova-livre/backend/exceptions/http.exception';
import { ErrorCodeString } from '@prova-livre/shared/constants/ErrorCode';
import { QuestionType } from '@prova-livre/shared/constants/QuestionType';
import { StudentApplicationStatus } from '@prova-livre/shared/constants/StudentApplicationStatus';
import { shuffle, shuffleSeed } from '@prova-livre/shared/helpers/array.helper';
import { add, date } from '@prova-livre/shared/helpers/date.helper';
import { number } from '@prova-livre/shared/helpers/number.helper';
import { string, stripTags } from '@prova-livre/shared/helpers/string.helper';

export async function listStudentApplications(companyId: number, studentId: number, applicationId?: number) {
  const applicationsStudent = await prisma.application.findMany({
    orderBy: [{ startedAt: 'asc' }, { endedAt: 'asc' }],
    where: {
      companyId, // check company
      id: applicationId,
      studentApplications: {
        some: { applicationId, studentId },
      },
    },
    include: {
      exam: true,
      studentApplications: {
        where: { studentId },
        include: {
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

  const applicationsClass = await prisma.application.findMany({
    orderBy: [{ startedAt: 'asc' }, { endedAt: 'asc' }],
    where: {
      companyId, // check company
      id: applicationId,
      studentApplications: {
        none: { studentId },
      },
      applicationClasses: {
        some: {
          class: {
            classStudents: {
              some: { studentId },
            },
          },
        },
      },
    },
    include: {
      exam: true,
      studentApplications: {
        where: { studentId },
        include: {
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

  const applicationsResolved = [];
  const applications = [...applicationsStudent, ...applicationsClass];

  for (const application of applications) {
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
          if (!application.showAnswers || !studentApplication.submittedAt) {
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

    applicationsResolved.push({
      status,
      questionsCount,
      application,
      exam: application.exam,
      studentApplications,
    });
  }

  return applicationsResolved;
}

export async function applicationIsAvailableOrThrow(companyId: number, applicationId: number) {
  const application = await prisma.application.findFirstOrThrow({
    where: {
      companyId, // check company
      id: applicationId,
    },
  });

  if (application.startedAt > new Date()) {
    throw new HttpException('A avaliação ainda não foi iniciada');
  }

  if (application.endedAt < new Date()) {
    throw new HttpException('A avaliação já foi encerrada');
  }

  return true;
}

export async function generateStudentApplication(companyId: number, studentId: number, applicationId: number) {
  const application = await prisma.application.findFirstOrThrow({
    where: {
      companyId, // check company
      id: applicationId,
    },
  });

  const studentApplication = await prisma.studentApplication.findFirst({
    where: {
      studentId,
      applicationId,
      startedAt: null,
    },
  });

  if (!studentApplication) {
    const studentApplications = await prisma.studentApplication.findMany({
      where: {
        studentId,
        applicationId,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    if (studentApplications.length >= application.attempts) {
      throw new HttpException(ErrorCodeString.APPLICATION_NO_ATTEMPTS_LEFT);
    }

    if (studentApplications.length && !studentApplications.at(-1)?.submittedAt) {
      throw new HttpException(ErrorCodeString.APPLICATION_RUNNING_ATTEMPTS);
    }
  }

  const { examId } = application;

  let questions: {
    questionId: number;
    questionScore: number;
  }[] = [];

  const examRules = await prisma.examRule.findMany({
    where: {
      exam: { companyId }, // check company
      examId,
    },
    orderBy: {
      questionId: 'asc',
    },
  });

  for (const examRule of examRules) {
    if (examRule.questionId) {
      // already added
      if (questions.find(({ questionId }) => examRule.questionId === questionId)) {
        throw new HttpException(`${ErrorCodeString.WRONG_EXAM_CONFIG} (E1).`);
      }

      questions.push({
        questionId: examRule.questionId,
        questionScore: number(examRule.score),
      });

      continue;
    }

    const examRuleCategories = await prisma.examRuleCategory.findMany({
      where: {
        category: { companyId }, // check company
        examRule: { exam: { companyId } }, // check company
        examRuleId: examRule.id,
      },
      select: {
        categoryId: true,
      },
    });

    const examRuleQuestions = await prisma.question.findMany({
      where: {
        enabled: true,
        id: { notIn: questions.map(({ questionId }) => questionId) },
        type: examRule.questionType ?? undefined,
        AND: examRuleCategories.map(({ categoryId }) => ({
          questionCategories: { some: { categoryId } },
        })),
      },
      select: {
        id: true,
      },
    });

    if (examRuleQuestions.length < examRule.questionsCount) {
      throw new HttpException(`${ErrorCodeString.WRONG_EXAM_CONFIG} (E2).`);
    }

    for (let i = 0; i < examRule.questionsCount; i++) {
      questions.push({
        questionId: examRuleQuestions.shift()!.id,
        questionScore: number(examRule.score),
      });
    }
  }

  questions = shuffle(questions);

  const data = {
    studentId,
    applicationId,
    startedAt: new Date(),
    studentApplicationQuestions: {
      create: questions,
    },
  };

  if (studentApplication) {
    await prisma.studentApplication.update({
      where: { id: studentApplication?.id },
      data,
    });
  } else {
    await prisma.studentApplication.create({
      data,
    });
  }
}

export async function answerStudentApplication(data: {
  answers: {
    answer: null | string;
    questionId: number;
  }[];
  applicationId: number;
  companyId: number;
  isSubmitting?: boolean;
  studentId: number;
}) {
  const { applicationId, companyId, answers, studentId, isSubmitting } = data;

  const studentApplication = await prisma.studentApplication.findFirstOrThrow({
    where: {
      student: { studentCompanies: { some: { studentId, companyId } } }, // check company
      application: { companyId }, // check company
      studentId,
      applicationId,
      submittedAt: null,
    },
    include: {
      application: true,
      studentApplicationQuestions: true,
    },
  });

  const limitTimeAt = add(studentApplication?.startedAt, {
    minutes: number(studentApplication.application?.limitTime),
  });

  // is expired?
  if (number(studentApplication.application?.limitTime) > 0 && limitTimeAt < new Date()) {
    throw new HttpException('O tempo de avaliação terminou');
  }

  for (const item of answers) {
    let { questionId, answer } = item;

    // Default values
    let studentScore: null | number = null;

    const studentApplicationQuestion = await prisma.studentApplicationQuestion.findFirstOrThrow({
      where: {
        studentApplicationId: studentApplication.id,
        questionId: questionId,
      },
    });

    const question = await prisma.question.findFirstOrThrow({
      where: {
        companyId, // check company
        id: questionId,
      },
      include: {
        questionOptions: true,
        questionCategories: { select: { category: true } },
      },
    });

    if (question.maxLength && typeof answer === 'string') {
      answer = answer.substring(0, question.maxLength);
    }

    if (isSubmitting) {
      if (question.type === QuestionTypeEnum.options) {
        studentScore = 0;

        const selectedOptions = string(answer).split(',').map(number).sort();
        const correctOptions = question.questionOptions
          .filter(({ isCorrect }) => isCorrect)
          .map(({ id }) => id)
          .sort();

        if (correctOptions.toString() === selectedOptions.toString()) {
          studentScore = studentApplicationQuestion.questionScore;
        }
      }
    }

    await prisma.studentApplicationQuestion.update({
      where: { id: studentApplicationQuestion.id },
      data: {
        answer,
        studentScore,
      },
    });
  }

  if (isSubmitting) {
    await prisma.studentApplication.update({
      where: { id: studentApplication.id },
      data: { submittedAt: new Date() },
    });
  }
}
