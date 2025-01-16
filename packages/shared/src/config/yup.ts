import { yup } from '@prova-livre/shared/helpers/form.helper';
import { unmask } from '@prova-livre/shared/helpers/string.helper';

declare module 'yup' {
  interface StringSchema {
    cep(): StringSchema;
    cnpj(): StringSchema;
    cpf(): StringSchema;
    phone(digits?: number): StringSchema;
    requiredIf(isRequired: boolean, message?: string): StringSchema;
  }
  interface DateSchema {
    requiredIf(isRequired: boolean, message?: string): DateSchema;
  }
}

const locale: yup.LocaleObject = {
  array: {
    length: ({ length }) => `Deve ter ${length} ${length === 1 ? 'item' : 'itens'}`,
    max: ({ max }) => `Deve ter no máximo ${max} ${max === 1 ? 'item' : 'itens'}`,
    min: ({ min }) => `Deve ter no mínimo ${min} ${min === 1 ? 'item' : 'itens'}`,
  },

  boolean: {
    isValue: 'Deve ser ${value}',
  },

  date: {
    max: 'Deve ser anterior a ${max}',
    min: 'Deve ser posterior a ${min}',
  },

  mixed: {
    default: 'Valor inválido',
    defined: 'Deve ser definido',
    notNull: 'Não pode ser vazio',
    notOneOf: 'Não deve ter esses valores: ${values}',
    notType: ({ originalValue, type, value }) => {
      const isCast = originalValue != null && originalValue !== value;
      let msg =
        `Deve ser do tipo \`${type}\`, ` +
        `mas o valor final foi: \`${yup.printValue(value, true)}\`` +
        (isCast ? ` (cast do valor \`${yup.printValue(originalValue, true)}\`).` : '.');

      if (value === null) {
        msg += '\n Se a intenção era usar "null" como um valor em branco marque o esquema como `.nullable()`';
      }

      return msg;
    },
    required: 'Campo obrigatório',
    oneOf: 'Deve ter um desses valores: ${values}',
  },

  number: {
    integer: 'Deve ser um número inteiro',
    lessThan: 'Deve ser menor que ${less}',
    max: 'Deve ser menor ou igual a ${max}',
    min: 'Deve ser maior ou igual a ${min}',
    moreThan: 'Deve ser maior que ${more}',
    negative: 'Deve ser um número negativo',
    positive: 'Deve ser um número positivo',
  },

  object: {
    noUnknown: 'Tem chaves desconhecidas: ${unknown}',
  },

  string: {
    email: 'Deve ser um e-mail válido',
    length: ({ length }) => `Deve ter exatamente ${length} ${length === 1 ? 'caractere' : 'caracteres'}`,
    lowercase: 'Deve estar em letras minúsculas',
    matches: 'Deve corresponder ao padrão: "${regex}"',
    max: ({ max }) => `Deve ter no máximo ${max} ${max === 1 ? 'caractere' : 'caracteres'}`,
    min: ({ min }) => `Deve ter no mínimo ${min} ${min === 1 ? 'caractere' : 'caracteres'}`,
    trim: 'Não deve conter espaços no início nem no fim',
    uppercase: 'Deve estar em letras maiúsculas',
    url: 'Deve ser uma URL válida',
    uuid: 'Deve ser um UUID válido',
  },
};

yup.setLocale(locale);

yup.addMethod(yup.string, 'phone', function phone(digits?: number) {
  return this.test({
    name: 'phone',
    message: digits ? `Deve ser DDD + ${digits - 2} dígitos` : 'Deve ser um telefone válido',
    test: (value) => (digits ? [digits] : [10, 11]).includes(unmask(value).length),
  });
});

yup.addMethod(yup.string, 'cep', function cep() {
  return this.test({
    name: 'cep',
    message: 'Deve ter 8 dígitos',
    test: (value) => unmask(value).length === 8,
  });
});

yup.addMethod(yup.string, 'cpf', function cpf() {
  return this.test({
    name: 'cpf',
    message: 'CPF inválido',
    test: (value) => {
      const cpf = unmask(value);

      if (cpf.length !== 11) {
        return false;
      }

      if (
        [
          '00000000000',
          '11111111111',
          '22222222222',
          '33333333333',
          '44444444444',
          '55555555555',
          '66666666666',
          '77777777777',
          '88888888888',
          '99999999999',
        ].includes(cpf)
      ) {
        return false;
      }

      let soma = 0;
      let resto;

      for (let i = 1; i <= 9; i++) {
        soma = soma + parseInt(cpf.substring(i - 1, i)) * (11 - i);
      }

      resto = (soma * 10) % 11;

      if (resto === 10 || resto === 11) {
        resto = 0;
      }

      if (resto !== parseInt(cpf.substring(9, 10))) {
        return false;
      }

      soma = 0;
      for (let i = 1; i <= 10; i++) {
        soma = soma + parseInt(cpf.substring(i - 1, i)) * (12 - i);
      }

      resto = (soma * 10) % 11;
      if (resto === 10 || resto === 11) {
        resto = 0;
      }

      if (resto !== parseInt(cpf.substring(10, 11))) {
        return false;
      }

      return true;
    },
  });
});

yup.addMethod(yup.string, 'cnpj', function cnpj() {
  return this.test({
    name: 'cnpj',
    message: `CNPJ inválido `,
    test: (value) => {
      const cnpj = unmask(value);

      if (cnpj.length !== 14) {
        return false;
      }

      // Validar DVs
      let tamanho = cnpj.length - 2;
      let numeros = cnpj.substring(0, tamanho);
      const digitos = cnpj.substring(tamanho);
      let soma = 0;
      let pos = tamanho - 7;

      for (let i = tamanho; i >= 1; i--) {
        // @ts-ignore
        soma += numeros.charAt(tamanho - i) * pos--;
        if (pos < 2) pos = 9;
      }

      let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);

      if (resultado.toString() !== digitos.charAt(0)) {
        return false;
      }

      tamanho = tamanho + 1;
      numeros = cnpj.substring(0, tamanho);
      soma = 0;
      pos = tamanho - 7;

      for (let i = tamanho; i >= 1; i--) {
        // @ts-ignore
        soma += numeros.charAt(tamanho - i) * pos--;
        if (pos < 2) pos = 9;
      }

      resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);

      if (resultado.toString() !== digitos.charAt(1)) {
        return false;
      }

      return true;
    },
  });
});

yup.addMethod(yup.string, 'requiredIf', function requiredIf(isRequired: boolean, message?: string) {
  return this.test({
    name: 'requiredIf',
    message: message ?? locale.mixed?.required,
    test: (value) => !isRequired || Boolean(value),
  });
});

yup.addMethod(yup.date, 'requiredIf', function requiredIf(isRequired: boolean, message?: string) {
  return this.test({
    name: 'requiredIf',
    message: message ?? locale.mixed?.required,
    test: (value) => !isRequired || Boolean(value),
  });
});
