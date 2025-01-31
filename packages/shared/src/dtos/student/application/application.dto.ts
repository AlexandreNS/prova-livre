import type { SchemaFastify } from '@prova-livre/shared/types/schema.type';

import { StudentApplicationStatus } from '@prova-livre/shared/constants/StudentApplicationStatus';

export const ApplicationListSchema = {
  tags: ['student/application'],
  response: {
    200: {
      type: 'array',
      items: {
        type: 'object',
        required: ['status', 'questionsCount', 'exam', 'application', 'studentApplications'],
        properties: {
          status: { type: 'string', enum: Object.values(StudentApplicationStatus) },
          questionsCount: { type: 'number' },
          application: {
            type: 'object',
            required: ['id', 'startedAt', 'endedAt', 'limitTime'],
            properties: {
              id: { type: 'number' },
              startedAt: { type: 'string' },
              endedAt: { type: 'string' },
              limitTime: { type: ['number', 'null'] },
            },
          },
          exam: {
            type: 'object',
            required: ['id', 'title'],
            properties: {
              id: { type: 'number' },
              title: { type: 'string' },
            },
          },
          studentApplications: {
            type: 'array',
            items: {
              type: 'object',
              required: ['id', 'submittedAt', 'status'],
              properties: {
                id: { type: 'number' },
                status: { type: 'string', enum: Object.values(StudentApplicationStatus) },
                studentScore: { type: ['number', 'null'] },
                submittedAt: { type: ['string', 'null'] },
              },
            },
          },
        },
      },
    },
  },
} as const satisfies SchemaFastify;

export const ApplicationGetSchema = {
  tags: ['student/application'],
  params: {
    type: 'object',
    required: ['applicationId'],
    properties: {
      applicationId: { type: 'number' },
    },
  },
  response: {
    200: {
      type: 'object',
      required: ['status', 'questionsCount', 'exam', 'application', 'studentApplications'],
      properties: {
        status: { type: 'string', enum: Object.values(StudentApplicationStatus) },
        questionsCount: { type: 'number' },
        application: {
          type: 'object',
          required: [
            'id',
            'startedAt',
            'endedAt',
            'attempts',
            'showAnswers',
            'showScores',
            'allowFeedback',
            'limitTime',
          ],
          properties: {
            id: { type: 'number' },
            startedAt: { type: 'string' },
            endedAt: { type: 'string' },
            attempts: { type: 'number' },
            showAnswers: { type: 'boolean' },
            showScores: { type: 'boolean' },
            allowFeedback: { type: 'boolean' },
            limitTime: { type: ['number', 'null'] },
          },
        },
        exam: {
          type: 'object',
          required: ['id', 'title', 'minScore', 'maxScore', 'description'],
          properties: {
            id: { type: 'number' },
            title: { type: 'string' },
            description: { type: 'string' },
            minScore: { type: 'number' },
            maxScore: { type: 'number' },
          },
        },
        studentApplications: {
          type: 'array',
          items: {
            type: 'object',
            required: ['id', 'questions', 'startedAt', 'submittedAt', 'status'],
            properties: {
              id: { type: 'number' },
              status: { type: 'string', enum: Object.values(StudentApplicationStatus) },
              startedAt: { type: ['string', 'null'] },
              submittedAt: { type: ['string', 'null'] },
              studentScore: { type: ['number', 'null'] },
              questions: {
                type: 'array',
                items: {
                  type: 'object',
                  required: [
                    'id',
                    'type',
                    'description',
                    'maxLength',
                    'answer',
                    'correctOptionsCount',
                    'questionScore',
                    'studentScore',
                    'questionOptions',
                  ],
                  properties: {
                    id: { type: 'number' },
                    type: { type: 'string', enum: ['discursive', 'options'] },
                    description: { type: 'string' },
                    maxLength: { type: ['number', 'null'] },
                    answer: { type: ['string', 'null'] },
                    correctOptionsCount: { type: ['number', 'null'] },
                    correctSelectedOptionsCount: { type: ['number', 'null'] },
                    questionScore: { type: 'number' },
                    studentScore: { type: ['number', 'null'] },
                    feedback: { type: ['string', 'null'] },
                    correctionStatus: { type: 'string', enum: ['correct', 'partial', 'incorrect'] },
                    questionOptions: {
                      type: 'array',
                      items: {
                        type: 'object',
                        required: ['id', 'description'],
                        properties: {
                          id: { type: 'number' },
                          description: { type: 'string' },
                          isCorrect: { type: 'boolean' },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
} as const satisfies SchemaFastify;

export const ApplicationCreateSchema = {
  tags: ['student/application'],
  params: {
    type: 'object',
    required: ['applicationId'],
    properties: {
      applicationId: { type: 'number' },
    },
  },
  response: {
    204: {
      type: 'null',
    },
  },
} as const satisfies SchemaFastify;

export const ApplicationUpdateSchema = {
  tags: ['student/application'],
  params: {
    type: 'object',
    required: ['applicationId'],
    properties: {
      applicationId: { type: 'number' },
    },
  },
  body: {
    type: 'object',
    required: ['answers'],
    properties: {
      temp: { type: 'boolean' },
      answers: {
        type: 'array',
        items: {
          type: 'object',
          required: ['questionId', 'answer'],
          properties: {
            questionId: { type: 'number' },
            answer: { type: ['string', 'null'] },
          },
        },
      },
    },
  },
  response: {
    204: {
      type: 'null',
    },
  },
} as const satisfies SchemaFastify;

export const ApplicationFeedbackGetSchema = {
  tags: ['student/application'],
  params: {
    type: 'object',
    required: ['studentApplicationId'],
    properties: {
      studentApplicationId: { type: 'number' },
    },
  },
  response: {
    200: {
      type: 'object',
      required: ['sent'],
      properties: {
        sent: { type: 'boolean' },
      },
    },
  },
} as const satisfies SchemaFastify;

export const ApplicationFeedbackCreateSchema = {
  tags: ['student/application'],
  params: {
    type: 'object',
    required: ['studentApplicationId'],
    properties: {
      studentApplicationId: { type: 'number' },
    },
  },
  body: {
    type: 'object',
    required: ['feedback'],
    properties: {
      feedback: { type: 'array', items: { type: 'string' } },
      descriptionFeedback: { type: 'string' },
    },
  },
  response: {
    204: { type: 'null' },
  },
} as const satisfies SchemaFastify;
