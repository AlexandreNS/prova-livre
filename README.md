# Prova Livre

## Visão Geral 🎯

**Prova Livre** é um projeto monorepo estruturado com Yarn Workspaces, contendo backend e frontend. O backend utiliza o Fastify com Prisma como ORM, enquanto o frontend é desenvolvido com React, Vite e TypeScript. Este projeto incorpora ferramentas modernas para otimização de desenvolvimento.

## Estrutura do Projeto 📌

O projeto é dividido nos seguintes pacotes principais:

- **`packages/backend`**: Backend construído com TypeScript, utilizando o framework Fastify e o Prisma como ORM.
- **`packages/frontend`**: Frontend baseado em React, TypeScript e Vite.
- **`packages/shared`**: Pacote compartilhado com código reutilizável entre backend e frontend.

## Requisitos ✅

Certifique-se de ter as seguintes ferramentas instaladas:

- [Node.js](https://nodejs.org/) (Recomendado: 18.17.0 ou superior)
- [npm](https://www.npmjs.com/), [pnpm](https://pnpm.io/), ou [Bun](https://bun.sh/)

## Instalação 📦

Para instalar as dependências do projeto, execute:

```sh
npm install
```

## Comandos Disponíveis 🎮

### Execução com Bun 🍞

Se preferir utilizar o Bun, você pode rodar os scripts com:

```sh
bun run <script>
```

### Desenvolvimento 💡

- `npm run dev` - Inicia o frontend e backend simultaneamente.
- `npm run dev:back` - Inicia apenas o backend.
- `npm run dev:front` - Inicia apenas o frontend.

### Construção e Serviço 🚀

- `npm run build:front` - Constrói o frontend.
- `npm run build:back` - Constrói o backend.
- `npm run serve:api` - Inicia o backend em modo de produção.

### Testes 🧪

- `npm run test` - Checa a qualidade do código.

### Banco de Dados 🗄️

- `npm run prisma <params>` - Executa comandos do Prisma para gerenciar o banco de dados.

### Limpeza 🗑️

- `npm run clean` - Remove os arquivos de dependências e locks.

## Padrões de Código 🎨

O projeto segue as seguintes ferramentas para garantir a qualidade do código:

- **Lint**: `eslint` e `@typescript-eslint`
- **Formatação**: `prettier`
- **Organização de código**: `eslint-plugin-perfectionist`

### JSON Schema 🔍

Este projeto utiliza **JSON Schema** para validar a estrutura dos dados JSON, garantindo que os dados trocados entre os componentes do sistema sejam consistentes e corretos.

### Localização dos Schemas 📂

Os esquemas estão na pasta **`packages/shared/src/dtos`**, onde são definidos os dados de entrada e saída das APIs, garantindo a validação automática.

## Contribuição 🤝

1. Faça um fork do repositório.
2. Crie uma branch com a sua funcionalidade: `git checkout -b feature/minha-feature`.
3. Faça commit das suas alterações: `git commit -m 'Adiciona nova funcionalidade'`.
4. Envie para o repositório remoto: `git push origin feature/minha-feature`.
5. Abra um Pull Request.
