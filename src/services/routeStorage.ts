import { openDB, type IDBPDatabase } from 'idb';
import type { TagDefinition, TrailRoute } from '../types';

const DB_NAME = 'trail-app';
const ROUTES_STORE = 'routes';
const TAGS_STORE = 'tags';
const VERSION = 2;

let dbPromise: Promise<IDBPDatabase> | null = null;

function getDb() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, VERSION, {
      upgrade(db, oldVersion) {
        if (oldVersion < 1) {
          db.createObjectStore(ROUTES_STORE, { keyPath: 'id' });
        }
        if (oldVersion < 2) {
          db.createObjectStore(TAGS_STORE, { keyPath: 'name' });
        }
      },
    });
  }
  return dbPromise;
}

export async function getAllLocalRoutes(): Promise<TrailRoute[]> {
  const db = await getDb();
  const routes = await db.getAll(ROUTES_STORE);
  return routes.map((r) => ({ ...r, source: 'local' as const }));
}

export async function upsertLocalRoute(route: TrailRoute): Promise<void> {
  const db = await getDb();
  await db.put(ROUTES_STORE, route);
}

export async function deleteLocalRoute(id: string): Promise<void> {
  const db = await getDb();
  await db.delete(ROUTES_STORE, id);
}

export async function getAllLocalTags(): Promise<TagDefinition[]> {
  const db = await getDb();
  return db.getAll(TAGS_STORE);
}

export async function upsertLocalTag(tag: TagDefinition): Promise<void> {
  const db = await getDb();
  await db.put(TAGS_STORE, tag);
}

export async function deleteLocalTag(name: string): Promise<void> {
  const db = await getDb();
  await db.delete(TAGS_STORE, name);
}
