export type Falsy<T> = '' | -0 | 0 | 0n | T | false | null | undefined;

export type AnyObject = Record<PropertyKey, any>;

export type ArrayValues<Arr extends readonly any[]> = Arr[number];

export type ObjectValues<Obj extends AnyObject> = Obj[keyof Obj];

export type PaginationProps = {
  limit: number;
  order: string;
  page: number;
  pages: number;
  sort: 'asc' | 'desc';
};
