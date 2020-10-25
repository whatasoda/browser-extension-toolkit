import { Entity, Query, QueryOR } from './decls';

const META_KEYS: (keyof Entity<any>)[] = ['index', 'createdAt', 'updatedAt'];

export const compareQueryMany = <T>(entities: (Entity<T> | undefined)[], queriesOR: QueryOR) => {
  return entities.filter<Entity<T>>((entity): entity is Entity<T> => {
    if (!entity) return false;
    return queriesOR.some((queriesAND) => {
      return queriesAND.every((query) => {
        try {
          return compareQuerySingle(entity, query);
        } catch (e) {
          // eslint-disable-next-line no-console
          console.log('query item skipped: entity: %o, query: %o', entity, query);
          return false;
        }
      });
    });
  });
};

export const compareQuerySingle = <T>(entity: Entity<T>, { key, filter }: Query) => {
  const data: any = META_KEYS.includes(key as typeof META_KEYS[number]) ? entity : entity.data;
  if (!(key in data)) return false;

  const value = data[key];
  switch (typeof filter) {
    case 'string':
    case 'number':
      return value === filter;
    default: {
      if (filter instanceof RegExp) {
        if (typeof value === 'string') {
          return filter.test(value);
        }
      } else if (Array.isArray(filter)) {
        if (typeof value === 'number') {
          return filter[0] <= value && filter[1] >= value;
        }
      }
      throw new Error('query failed: filter type unmet with value type');
    }
  }
};
