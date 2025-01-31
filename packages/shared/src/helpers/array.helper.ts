import { string } from '@prova-livre/shared/helpers/string.helper';
import * as dot from 'dot-object';

export function array<T = any>(input: any): T[] {
  if (!input) {
    return [];
  }

  if (typeof input === 'object' && input?.[Symbol.iterator]) {
    return Array.from(input);
  }

  return [input];
}

export function random<T>(items: T[]) {
  return array<T>(items).sort(() => 0.5 - Math.random())?.[0];
}

export function shuffle<T>(items: T[]) {
  const copy = array<T>(items);

  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }

  return copy;
}

function seedRandom(seed: number) {
  let value = seed;
  return function () {
    value = Math.sin(value) * 10000;
    return value - Math.floor(value);
  };
}

export function shuffleSeed<T>(items: T[], seed: number) {
  const random = seedRandom(seed);
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }
  return items;
}

export function chunk<T>(items: T[], size: number) {
  return Array.from(
    {
      length: Math.ceil(items.length / size),
    },
    (_, i) => items.slice(i * size, i * size + size),
  );
}

export function orderBy<T>(items: T[], attrs: string | string[]) {
  const result = array<T>(items);

  for (let attr of array<string>(attrs).reverse()) {
    const sortDesc = attr.trim().substring(0, 1) === '-';

    if (sortDesc) {
      attr = attr.trim().substring(1);
    }

    result.sort((a, b) => {
      // @ts-expect-error
      const diff = string(a[attr]).localeCompare(string(b[attr]));

      if (sortDesc) {
        return diff * -1;
      }

      return diff;
    });
  }

  return result;
}

export function groupBy<T>(items: T[], keyAttr = 'key', titleAttr?: string) {
  const groups: Array<{
    data: T[];
    key: string;
    title: string;
  }> = [];

  for (const item of array<T>(items)) {
    // @ts-ignore
    const key = item[keyAttr];
    const title = string(dot.pick(titleAttr || keyAttr, item));

    let group = groups.find((a) => a.key === key);

    if (!group) {
      group = { title, data: [], key };
      groups.push(group);
    }

    group.data.push(item);
  }

  return groups;
}

export function uniqueBy<T>(items: T[], keyAttr = 'id') {
  return array<T>(items).filter((item, index) => {
    // @ts-expect-error
    return index === items.findIndex((a) => a[keyAttr] === item[keyAttr]);
  });
}
