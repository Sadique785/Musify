// indexedDB.js
import { openDB } from 'idb';

const DB_NAME = 'audioFilesDB';
const STORE_NAME = 'audioFiles';



export async function initDB() {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      db.createObjectStore(STORE_NAME);
    },
  });
}

export async function saveAudioFile(trackId, file) {
  const db = await initDB();
  await db.put(STORE_NAME, file, trackId);
}

export async function getAudioFile(trackId) {
  const db = await initDB();
  return db.get(STORE_NAME, trackId);
}

export async function deleteAudioFile(trackId) {
  const db = await initDB();
  await db.delete(STORE_NAME, trackId);
}

export async function clearIndexedDB() {
  const db = await openDB(DB_NAME, 1);
  const transaction = db.transaction(STORE_NAME, 'readwrite');
  const store = transaction.objectStore(STORE_NAME);

  await store.clear(); 
  await transaction.done;
}