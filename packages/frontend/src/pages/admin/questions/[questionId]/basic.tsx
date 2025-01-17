import type { SchemaRoute } from '@prova-livre/shared/types/schema.type';

import { usePropState } from 'react-state-hooks';

import InputHtml from '@prova-livre/frontend/components/InputHtml';
import NoPermission from '@prova-livre/frontend/components/NoPermission';
import State from '@prova-livre/frontend/components/State';
import { getError } from '@prova-livre/frontend/helpers/api.helper';
import useAdminAuth from '@prova-livre/frontend/hooks/useAdminAuth';
import useIdParam from '@prova-livre/frontend/hooks/useIdParam';
import useRequest from '@prova-livre/frontend/hooks/useRequest';
import { useNavigate } from '@prova-livre/frontend/router';
import ApiAdmin from '@prova-livre/frontend/services/ApiAdmin';
import { QuestionType, QuestionTypeString } from '@prova-livre/shared/constants/QuestionType';
import { QuestionCreateSchema, QuestionGetSchema } from '@prova-livre/shared/dtos/admin/question/question.dto';
import { hasPermissionList } from '@prova-livre/shared/helpers/feature.helper';
import { validate } from '@prova-livre/shared/helpers/form.helper';
import { type AnyObject, type RbkFormEvent, useToaster } from '@react-bulk/core';
import { Box, Button, Card, Form, Grid, Input, Label, Select, Switch } from '@react-bulk/web';

export default function Page() {
  const { user } = useAdminAuth();
  const toaster = useToaster();
  const navigate = useNavigate();
  const questionId = useIdParam('questionId');

  const [hasWritePermission] = hasPermissionList(user?.role, 'Question-Write');

  const { data: question, state } = useRequest<SchemaRoute<typeof QuestionGetSchema>>(
    hasWritePermission && questionId && `/questions/${questionId}`,
    {
      noCache: true,
      autoRevalidate: false,
    },
  );

  const [questionType, setQuestionType] = usePropState(question?.type, QuestionType.OPTIONS);

  const handleSubmitQuestion = async (e: RbkFormEvent, data: AnyObject) => {
    const errors = validate({
      formRef: e.form,
      data,
      schema: QuestionCreateSchema.body,
    });

    e.form.setErrors(errors);
    if (errors) return;

    try {
      const response = await ApiAdmin.save('/questions', questionId, data);

      if (!questionId) {
        navigate(`/admin/questions/:questionId${data.type === QuestionType.OPTIONS ? '/options' : ''}`, {
          params: { questionId: response.data.id },
        });
      }

      toaster.success('Os dados foram salvos.');
    } catch (err) {
      toaster.error(getError(err));
    }
  };

  if (!hasWritePermission) {
    return <NoPermission />;
  }

  return (
    <>
      <State {...(questionId ? state : {})}>
        <Form onSubmit={handleSubmitQuestion}>
          <Card mt="1gap">
            <Grid gap>
              {questionId && (
                <Box xs={12}>
                  <Label>Habilitar questão</Label>
                  <Switch required checked={question?.enabled} mt="0.5gap" name="enabled" size="small" />
                </Box>
              )}
              <Box xs={12}>
                <Select
                  required
                  label="Tipo"
                  name="type"
                  value={questionType}
                  options={Object.values(QuestionType).map((type) => ({
                    label: QuestionTypeString[type],
                    value: type,
                  }))}
                  onChange={(_, value) => setQuestionType(value)}
                />
              </Box>
              <Box xs={12}>
                <InputHtml
                  required
                  label="Enunciado"
                  minHeight={250}
                  name="description"
                  value={question?.description}
                />
              </Box>
              {questionType === QuestionType.DISCURSIVE ? (
                <Box xs={12}>
                  <Input label="Limite de Caracteres da Resposta" name="maxLength" value={question?.maxLength} />
                </Box>
              ) : (
                <Box p={0} xs={12}>
                  <Input name="maxLength" type="hidden" value={null} />
                </Box>
              )}
            </Grid>
          </Card>

          <Box mt="1gap">
            <Button align="end" type="submit">
              Salvar
            </Button>
          </Box>
        </Form>
      </State>
    </>
  );
}
