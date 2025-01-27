import prisma from '@prova-livre/backend/database';
import { QuestionType } from '@prova-livre/shared/constants/QuestionType';
import { StudentApplicationStatus } from '@prova-livre/shared/constants/StudentApplicationStatus';
import { add } from '@prova-livre/shared/helpers/date.helper';
import { number } from '@prova-livre/shared/helpers/number.helper';

export async function listStudentApplications(companyId: number, studentId: number, applicationId?: number) {
  const studentApplications = await prisma.studentApplication.findMany({
    orderBy: { id: 'asc' },
    where: {
      studentId,
      applicationId,
      application: { companyId },
    },
    include: {
      application: {
        include: {
          exam: true,
        },
      },
      studentApplicationQuestions: {
        include: {
          question: true,
        },
      },
    },
  });

  const applicationClass = await prisma.applicationClass.findFirst({
    where: {
      applicationId,
      application: { companyId },
      class: {
        companyId,
        classStudents: {
          some: { studentId },
        },
      },
    },
  });

  if (!applicationClass && studentApplications.length === 0) {
    return [];
  }

  if (applicationClass && studentApplications.length === 0) {
    return [{ status: 'waiting' }]; // todo: corrigir status para alunos com turmas
  }

  const studentApplicationsResult = [];
  for (const studentApplication of studentApplications) {
    const { application, studentApplicationQuestions } = studentApplication;
    const limitTimeAt = add(studentApplication?.startedAt, { minutes: number(application?.limitTime) });
    const isSubmitted = Boolean(studentApplication?.submittedAt);
    const isInitialized = Boolean(studentApplication?.startedAt);
    const isExpired = number(application?.limitTime) > 0 && limitTimeAt < new Date();

    let status;
    let studentScoreSum = 0;
    for (const saq of studentApplicationQuestions) {
      if (saq.question.type === QuestionType.DISCURSIVE && !saq.corretorUserId) {
        status = StudentApplicationStatus.AWAITING_CORRECTION;
      }

      studentScoreSum += number(saq.studentScore);
    }

    status =
      status || isSubmitted
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

    studentApplicationsResult.push({
      status,
      studentScore: status === StudentApplicationStatus.SUBMITTED ? studentScoreSum : null,
      startedAt: studentApplication.startedAt,
      submittedAt: studentApplication.submittedAt,
      maxScore: application.exam.maxScore,
      minScore: application.exam.minScore,
    });
  }

  return studentApplicationsResult;
}
