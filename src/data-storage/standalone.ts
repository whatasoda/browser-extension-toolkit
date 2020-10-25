import { DataStorage, Entity, QueryOR, StorageAdopter } from './decls';
import { compareQueryMany } from './query';

const keys = {
  indexes: ({ kind, version }: DataStorageStandalone<any>) => `ds-${kind}-${version}-indexes`,
  itemId: ({ kind, version }: DataStorageStandalone<any>, index: number) => `ds-${kind}-${version}-item-${index}`,
  nextIndex: ({ kind, version }: DataStorageStandalone<any>) => `ds-${kind}-${version}-nextIndex`,
};

export class DataStorageStandalone<T> implements DataStorage<T> {
  public kind: string;
  public version: string;
  private _adopter: StorageAdopter;
  constructor(kind: string, version: string, adopter: StorageAdopter) {
    this.kind = kind;
    this.version = version;
    this._adopter = adopter;
  }

  public async query(queries: QueryOR): Promise<Entity<T>[]> {
    const [indexes]: [string[]?, ...any[]] = await this._adopter.get([keys.indexes(this)]);
    if (!indexes) return [];
    const entities: (Entity<T> | undefined)[] = await this._adopter.get(indexes);
    return compareQueryMany(entities, queries);
  }

  public async create(data: T): Promise<Entity<T>> {
    const [indexes = [], nextIndex = 0]: [string[]?, number?, ...any[]] = await this._adopter.get([
      keys.indexes(this),
      keys.nextIndex(this),
    ]);

    const entity: Entity<T> = {
      index: keys.itemId(this, nextIndex),
      data,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    await this._adopter.set({
      [entity.index]: entity,
      [keys.indexes(this)]: [...indexes, entity.index],
      [keys.nextIndex(this)]: nextIndex + 1,
    });

    const [created]: [Entity<T>?, ...any[]] = await this._adopter.get([entity.index]);
    if (created) {
      return created;
    } else {
      throw new Error('Something wrong happened while creating new entity.');
    }
  }

  public async update(index: string, data: T, mergeMode?: boolean): Promise<Entity<T>> {
    const [existing]: [Entity<T>?, ...any[]] = await this._adopter.get([index]);
    if (!existing) throw new Error(`No entity found with index '${index}'`);

    const entity: Entity<T> = {
      ...existing,
      data: mergeMode ? { ...existing.data, ...data } : data,
      updatedAt: Date.now(),
    };

    await this._adopter.set({ [entity.index]: entity });

    const [created]: [Entity<T>?, ...any[]] = await this._adopter.get([entity.index]);
    if (created) {
      return created;
    } else {
      throw new Error(`Something wrong happened while updating entity '${index}'.`);
    }
  }

  public async remove(index: string): Promise<Entity<T>> {
    const [existing]: [Entity<T>?, ...any[]] = await this._adopter.get([index]);
    if (!existing) throw new Error(`No entity found with index '${index}'`);

    await this._adopter.remove([index]);
    return existing;
  }
}
