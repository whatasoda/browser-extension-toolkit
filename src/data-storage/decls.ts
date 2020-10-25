export interface StorageAdopter {
  /**
   * @param keys list of keys to get
   * @returns {any[]} list of values mapped according to the keys
   */
  get(keys: string[]): Promise<any[]>;
  set(value: any): Promise<void>;
  remove(keys: string[]): Promise<void>;
}

export interface Entity<T> {
  index: string;
  data: T;
  updatedAt: number;
  createdAt: number;
}

export interface DataStorage<T> {
  query(queries: QueryOR): Promise<Entity<T>[]>;
  create(data: T): Promise<Entity<T>>;
  update(index: string, data: T, mergeMode?: boolean): Promise<Entity<T>>;
  remove(index: string): Promise<Entity<T>>;
}

export interface QueryAND extends Array<Query> {}
export interface QueryOR extends Array<QueryAND> {}
export interface Query {
  key: string;
  filter: string | RegExp | number | [number, number];
}
