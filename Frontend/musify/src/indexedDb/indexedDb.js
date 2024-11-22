// indexedDB.js
import { openDB } from 'idb';

const DB_NAME = 'audioFilesDB';
const AUDIO_STORE = 'audioFiles';
const SETTINGS_STORE = 'trackSettings';




export async function initDB() {
  return openDB(DB_NAME, 2, { 
    upgrade(db, oldVersion) {
      if (!db.objectStoreNames.contains(AUDIO_STORE)) {
        db.createObjectStore(AUDIO_STORE);
      }
      
      if (!db.objectStoreNames.contains(SETTINGS_STORE)) {
        db.createObjectStore(SETTINGS_STORE);
      }
    },
  });
}

export async function saveAudioFile(trackId, file) {
  const db = await initDB();
  await db.put(AUDIO_STORE, file, trackId);
}

export async function getAudioFile(trackId) {
  const db = await initDB();
  return db.get(AUDIO_STORE, trackId);
}

export async function deleteAudioFile(trackId) {
  const db = await initDB();
  await db.delete(AUDIO_STORE, trackId);
  await deleteTrackSettings(trackId);
}


export async function saveTrackSettings(trackId, settings) {
  const db = await initDB();
  await db.put(SETTINGS_STORE, settings, trackId);
}

export async function getTrackSettings(trackId) {
  const db = await initDB();
  return db.get(SETTINGS_STORE, trackId);
}


export async function getAllTrackSettings() {
  const db = await initDB();
  const tx = db.transaction(SETTINGS_STORE, 'readonly');
  const store = tx.objectStore(SETTINGS_STORE);
  return store.getAll();
}

export async function deleteTrackSettings(trackId) {
  const db = await initDB();
  await db.delete(SETTINGS_STORE, trackId);
}



export async function clearIndexedDB() {
  const db = await initDB();
  
  // Clear both stores in a single transaction
  const transaction = db.transaction([AUDIO_STORE, SETTINGS_STORE], 'readwrite');
  await Promise.all([
    transaction.objectStore(AUDIO_STORE).clear(),
    transaction.objectStore(SETTINGS_STORE).clear()
  ]);
  
  await transaction.done;
}