import type { SchemaRoute } from '@prova-livre/shared/types/schema.type';

import State from '@prova-livre/frontend/components/State';
import { getError } from '@prova-livre/frontend/helpers/api.helper';
import useIdParam from '@prova-livre/frontend/hooks/useIdParam';
import useRequest from '@prova-livre/frontend/hooks/useRequest';
import { useNavigate } from '@prova-livre/frontend/router';
import ApiAdmin from '@prova-livre/frontend/services/ApiAdmin';
import {
  CompanyCreateSchema,
  type CompanyGetSchema,
  type CompanyListSchema,
  CompanyUpdateSchema,
} from '@prova-livre/shared/dtos/admin/company/company.dto';
import { validate } from '@prova-livre/shared/helpers/form.helper';
import { type AnyObject, type RbkFormEvent, useToaster } from '@react-bulk/core';
import { Box, Button, Card, Form, Grid, Input } from '@react-bulk/web';
import { object } from 'dot-object';

export default function Page() {
  const toaster = useToaster();
  const navigate = useNavigate();

  const companyId = useIdParam('companyId');

  const { revalidate: revalidateCompanies } = useRequest<SchemaRoute<typeof CompanyListSchema>>('/companies');

  const { data: company, state } = useRequest<SchemaRoute<typeof CompanyGetSchema>>(
    companyId && `/companies/${companyId}`,
    {
      noCache: true,
      autoRevalidate: false,
    },
  );

  const handleSubmitCompany = async (e: RbkFormEvent, data: AnyObject) => {
    data = object(data);

    const errors = validate({
      formRef: e.form,
      data,
      schema: companyId ? CompanyUpdateSchema.body : CompanyCreateSchema.body,
    });

    e.form.setErrors(errors);
    if (errors) return;

    try {
      const response = await ApiAdmin.save('/companies', companyId, data);

      revalidateCompanies();
      navigate('/admin/companies/:companyId', {
        params: { companyId: response.data.id },
      });

      toaster.success('Os dados foram salvos.');
    } catch (err) {
      toaster.error(getError(err));
    }
  };

  return (
    <>
      <State {...(companyId ? state : {})}>
        <Form onSubmit={handleSubmitCompany}>
          <Card mt="1gap">
            <Grid gap>
              <Box xs={12}>
                <Input required label="Nome da Instituição" name="name" value={company?.name} />
              </Box>
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
