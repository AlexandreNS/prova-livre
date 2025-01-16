import type { FromSchema, JSONSchema } from 'json-schema-to-ts';

export type SchemaBase = JSONSchema;

export type SchemaType<Schema extends SchemaBase> = FromSchema<Schema>;

export type SchemaFastify = {
  body?: JSONSchema;
  consumes?: string[];
  headers?: JSONSchema;
  params?: JSONSchema;
  querystring?: JSONSchema;
  response?: Record<number, JSONSchema>;
  security?: any;
  tags?: any; // swagger
};

export type SchemaRoute<Schema extends SchemaFastify, HttpStatus extends number = 200> = {
  Body: FromSchema<NonNullable<Schema['body']>>;
  Headers: FromSchema<NonNullable<Schema['headers']>>;
  Params: FromSchema<NonNullable<Schema['params']>>;
  Querystring: FromSchema<NonNullable<Schema['querystring']>>;
  Response: FromSchema<NonNullable<Schema['response']>[HttpStatus]>;
};

export type SchemaBody<Schema extends SchemaFastify> = SchemaRoute<Schema>['Body'];

export type SchemaHeaders<Schema extends SchemaFastify> = SchemaRoute<Schema>['Headers'];

export type SchemaParams<Schema extends SchemaFastify> = SchemaRoute<Schema>['Params'];

export type SchemaQueryParams<Schema extends SchemaFastify> = SchemaRoute<Schema>['Querystring'];

export type SchemaResponse<Schema extends SchemaFastify, HttpStatus extends number = 200> = SchemaRoute<
  Schema,
  HttpStatus
>['Response'];
