import type { SchemaRoute } from '@prova-livre/shared/types/schema.type';

import React, { useEffect, useState } from 'react';

import NoPermission from '@prova-livre/frontend/components/NoPermission';
import PageHeader from '@prova-livre/frontend/components/PageHeader';
import State from '@prova-livre/frontend/components/State';
import { getError } from '@prova-livre/frontend/helpers/api.helper';
import useAdminAuth from '@prova-livre/frontend/hooks/useAdminAuth';
import useRequest from '@prova-livre/frontend/hooks/useRequest';
import ApiAdmin from '@prova-livre/frontend/services/ApiAdmin';
import { SystemSettings } from '@prova-livre/shared/constants/SystemSettings';
import {
  type SystemSettingsListSchema,
  SystemSettingsUpdateSchema,
} from '@prova-livre/shared/dtos/admin/system-settings/system-settings.dto';
import { hasPermissionList } from '@prova-livre/shared/helpers/feature.helper';
import { validate } from '@prova-livre/shared/helpers/form.helper';
import { type AnyObject, type RbkFormEvent, useToaster } from '@react-bulk/core';
import { Box, Button, Card, Checkbox, Collapse, Divider, Form, Grid, Input, Switch, Text } from '@react-bulk/web';

export default function Page() {
  const { user } = useAdminAuth();
  const toaster = useToaster();

  const [showValue, setShowValue] = useState<Record<number, boolean>>({});

  const [hasPermission] = hasPermissionList(user?.role, 'SystemSettings');

  const {
    data: systemSettingsList,
    state,
    revalidate,
  } = useRequest<SchemaRoute<typeof SystemSettingsListSchema>>(hasPermission && `/system-settings`, {
    noCache: true,
    autoRevalidate: false,
  });

  useEffect(() => {
    if (!systemSettingsList) return;

    setShowValue(
      systemSettingsList.reduce(
        (acc, { id, enabled }) => {
          acc[id] = enabled;
          return acc;
        },
        {} as Record<number, boolean>,
      ),
    );
  }, [systemSettingsList]);

  const handleShowValue = (id: number, enabled: boolean) => {
    setShowValue((prev) => ({ ...prev, [id]: enabled }));
  };

  const handleParseValue = (name: string, value: any) => {
    if (name === SystemSettings.ALLOW_OTHER_USERS_TO_CREATE_COMPANIES) {
      return Object.entries(value as Record<string, boolean>)
        .filter(([, value]) => value)
        .map(([key]) => key)
        .join(',');
    }
  };

  const handleSubmitSystemSettings = async (e: RbkFormEvent, data: AnyObject) => {
    data.value = handleParseValue(data.name, data.value);

    const errors = validate({
      formRef: e.form,
      data,
      schema: SystemSettingsUpdateSchema.body,
    });

    e.form.setErrors(errors);
    if (errors) return;

    try {
      await ApiAdmin.put(`/system-settings/${data.id}`, data);
      await revalidate();

      toaster.success('Os dados foram salvos.');
    } catch (err) {
      toaster.error(getError(err));
    }
  };

  if (!hasPermission) {
    return <NoPermission />;
  }

  return (
    <>
      <PageHeader title="Configurações do Sistema" />

      <State {...state}>
        {systemSettingsList?.map((systemSetting) => {
          const isVisible = showValue[systemSetting.id];

          if (systemSetting.name === SystemSettings.ALLOW_OTHER_USERS_TO_CREATE_COMPANIES) {
            const profiles = systemSetting.value?.split(',') || [];

            return (
              <Card key={systemSetting.id} mt="1gap">
                <Form onSubmit={handleSubmitSystemSettings}>
                  <Text variant="subtitle">{systemSetting.description}</Text>

                  <Divider mx="-1gap" my="1gap" />

                  <Input name="id" type="hidden" value={systemSetting.id} />
                  <Input name="name" type="hidden" value={systemSetting.name} />

                  <Grid gap>
                    <Box xs={12}>
                      <Switch
                        checked={systemSetting?.enabled}
                        label="Ativar"
                        mr="0.5gap"
                        name="enabled"
                        size="small"
                        onChange={(e, enabled) => handleShowValue(systemSetting.id, enabled)}
                      />
                    </Box>
                    <Box>
                      <Collapse visible={isVisible}>
                        <Box mt="1gap" xs={12}>
                          <Text bold mb="0.5gap" variant="primary">
                            Perfis:
                          </Text>
                          {[
                            {
                              label: 'Admin',
                              value: 'admin',
                            },
                            {
                              label: 'Titular',
                              value: 'owner',
                            },
                            {
                              label: 'Editor',
                              value: 'editor',
                            },
                            {
                              label: 'Tutor',
                              value: 'tutor',
                            },
                          ].map(({ label, value }, index) => (
                            <Box key={index} ml="1gap">
                              <Checkbox checked={profiles.includes(value)} label={label} name={`value.${value}`} />
                            </Box>
                          ))}
                        </Box>
                      </Collapse>
                    </Box>
                  </Grid>

                  <Divider mx="-1gap" my="1gap" />

                  <Box alignItems="flex-end">
                    <Button type="submit">Salvar</Button>
                  </Box>
                </Form>
              </Card>
            );
          }
        })}
      </State>
    </>
  );
}
