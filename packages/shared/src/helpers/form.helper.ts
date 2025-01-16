import type { SchemaBase } from '@prova-livre/shared/types/schema.type';
import type { AnyObject } from '@react-bulk/core';

import { buildYup } from 'schema-to-yup';
import * as yup from 'yup';

export { yup };

export function validate({
  schema,
  extra,
  data,
  formRef,
}: {
  data?: AnyObject;
  extra?: yup.ObjectShape;
  formRef?: any;
  schema?: SchemaBase;
}) {
  const errors: Record<string, string> = {};

  // TODO: remover este workaround quando a lib schema-to-yup aceitar array no "type"
  if (schema && typeof schema === 'object' && schema?.properties) {
    schema = JSON.parse(JSON.stringify(schema)) as typeof schema;

    for (const prop in schema.properties) {
      // @ts-expect-error
      const type = schema.properties[prop].type;

      if (!Array.isArray(type)) {
        continue;
      }

      if (type.includes('null')) {
        // @ts-expect-error
        schema.properties[prop].nullable = true;
        // @ts-expect-error
        schema.properties[prop].type = type.filter((item) => item !== 'null').at(0);
      }
    }
  }

  const schemas = [schema && buildYup(schema, {}), extra && yup.object().shape(extra)].filter(Boolean);

  for (const yupSchema of schemas) {
    if (!yupSchema) continue;

    try {
      yupSchema.validateSync(data, { abortEarly: false });
    } catch (err: any) {
      Object.assign(
        errors,
        Object.fromEntries(
          (err as yup.ValidationError).inner
            .filter((item) => item.path)
            .map((item) => {
              return [item.path?.replace(/^\["/, '')?.replace(/"]$/, '')?.replace(/\[\d]/g, ''), item.message];
            }),
        ),
      );
    }
  }

  if (!Object.keys(errors).length) {
    return null;
  }

  if (formRef) {
    formRef?.target?.querySelector(`[name="${Object.keys(errors).at(0)}"]`)?.focus();
  }

  return errors;
}
