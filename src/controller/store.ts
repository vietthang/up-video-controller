import PouchDb from 'pouchdb'
import { PersistentAppState } from '../state'

export interface Id {
  _id: string
  _rev: string
}

export interface StoreItemDao {
  _id: string
  state: PersistentAppState
  name: string
  createdAt: Date
}

export interface StoreItem extends StoreItemDao {
  id: Id
}

const db = new PouchDb('store')

export async function listStoreItems(): Promise<StoreItem[]> {
  const result = await db.allDocs<StoreItemDao>({
    include_docs: true,
    descending: true,
  })
  return result.rows.map(row => ({
    ...row.doc!,
    id: {
      _id: row.id,
      _rev: row.value.rev,
    },
  }))
}

export async function saveStoreItem(
  state: PersistentAppState,
  name?: string,
  date?: Date,
): Promise<StoreItem> {
  const createdAt = date || new Date()
  const item = {
    _id: createdAt.getTime().toString(), // use timestamp as id
    state,
    name: name || `Saved ${createdAt.toISOString()}`,
    createdAt,
  }
  const response = await db.put<StoreItemDao>(item)

  return {
    ...item,
    id: {
      _id: response.id,
      _rev: response.rev,
    },
  }
}

export async function deleteStoreItem(id: Id): Promise<void> {
  await db.remove(id)
}
