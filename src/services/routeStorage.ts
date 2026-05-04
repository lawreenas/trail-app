import { openDB, type IDBPDatabase } from 'idb';
import type { TrailRoute } from '../types';

const DB_NAME = 'trail-app';
const STORE = 'routes';
const VERSION = 1;

let dbPromise: Promise<IDBPDatabase> | null = null;

function getDb() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, VERSION, {
      upgrade(db) {
        db.createObjectStore(STORE, { keyPath: 'id' });
      },
    });
  }
  return dbPromise;
}

export async function getAllLocalRoutes(): Promise<TrailRoute[]> {
  const db = await getDb();
  const routes = await db.getAll(STORE);
  return routes.map((r) => ({ ...r, source: 'local' as const }));
}

export async function upsertLocalRoute(route: TrailRoute): Promise<void> {
  const db = await getDb();
  await db.put(STORE, route);
}

export async function deleteLocalRoute(id: string): Promise<void> {
  const db = await getDb();
  await db.delete(STORE, id);
}
