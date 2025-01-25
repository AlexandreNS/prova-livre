import type { SchemaRoute } from '@prova-livre/shared/types/schema.type';

import ExamRule from '@prova-livre/frontend/components/ExamRule';
import Icon from '@prova-livre/frontend/components/Icon';
import NoPermission from '@prova-livre/frontend/components/NoPermission';
import State from '@prova-livre/frontend/components/State';
import useAdminAuth from '@prova-livre/frontend/hooks/useAdminAuth';
import useIdParam from '@prova-livre/frontend/hooks/useIdParam';
import useRequest from '@prova-livre/frontend/hooks/useRequest';
import { ExamGetSchema, ExamRulesListSchema } from '@prova-livre/shared/dtos/admin/exam/exam.dto';
import { hasPermissionList } from '@prova-livre/shared/helpers/feature.helper';
import { number } from '@prova-livre/shared/helpers/number.helper';
import { Box, Button, Card, Grid, Text } from '@react-bulk/web';

export default function Page() {
  const { user } = useAdminAuth();
  const examId = useIdParam('examId');

  const [hasWritePerrmission] = hasPermissionList(user?.role, 'Exam-Write');

  const { data: exam } = useRequest<SchemaRoute<typeof ExamGetSchema>>(
    hasWritePerrmission && examId && `/exams/${examId}`,
    {
      autoRevalidate: false,
    },
  );

  const {
    data: examRules,
    revalidate,
    state,
    mutate,
  } = useRequest<SchemaRoute<typeof ExamRulesListSchema>>(
    hasWritePerrmission && examId && `/exams/${examId}/questions`,
    {
      autoRevalidate: false,
    },
  );

  const totalScore = examRules?.reduce((acc, curr) => number(curr.questionsCount) * number(curr.score) + acc, 0);

  const cards = [
    {
      title: 'Qtde. Questões',
      value: examRules?.reduce((acc, curr) => number(curr.questionsCount) + acc, 0),
    },
    {
      title: 'Questões Únicas',
      value: examRules?.reduce((acc, curr) => (curr.questionId ? number(curr.questionsCount) : 0) + acc, 0),
    },
    {
      title: 'Questões Dinâmicas',
      value: examRules?.reduce((acc, curr) => (curr.questionId ? 0 : number(curr.questionsCount)) + acc, 0),
    },
    {
      title: 'Pontuação Total',
      value: totalScore,
    },
  ];

  const handleAddQuestion = async () => {
    // @ts-expect-error
    await mutate((current) => [...current, { _draft: true, id: Date.now() }]);

    Array.from(document.querySelectorAll('.action-save-option')).at(-1)?.scrollIntoView();
  };

  if (!hasWritePerrmission) {
    return <NoPermission />;
  }

  return (
    <>
      {examId && (
        <Box mt="1gap">
          <Button
            align="end"
            startAddon={({ color }) => <Icon color={color} name="Plus" />}
            variant="outline"
            onPress={handleAddQuestion}
          >
            Regra
          </Button>
        </Box>
      )}

      <State {...state}>
        <Grid gap mt="1gap">
          {cards.map(({ title, value }, index) => {
            return (
              <Box key={index} lg="auto" md={3} xs={6}>
                <Card flex bg="blueGray" style={{ lg: { w: 160 } }}>
                  <Text center color="blueGray.contrast" variant="title">
                    {value}
                  </Text>
                  <Text center color="blueGray.contrast" mt={2} variant="secondary">
                    {title}
                  </Text>
                </Card>
              </Box>
            );
          })}
        </Grid>

        {totalScore !== exam?.maxScore && (
          <Card center noWrap row mt="1gap">
            <Icon color="warning" name="WarningCircle" size={20} weight="bold" />
            <Box flex ml="1gap">
              <Text color="warning" weight="500">
                {!exam?.maxScore
                  ? 'Nota total da prova não foi definida.'
                  : `Pontuação total deve ser igual a ${exam?.maxScore}.`}
              </Text>
            </Box>
          </Card>
        )}

        {examId &&
          examRules?.map((examRule) => (
            <ExamRule
              key={examRule.id}
              examId={examId}
              examRule={examRule}
              mutate={mutate}
              onRefresh={async () => {
                await revalidate();
              }}
            />
          ))}
      </State>
    </>
  );
}
