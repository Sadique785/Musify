import { openDB } from 'idb';

const DB_NAME = 'audioFilesDB';
const AUDIO_STORE = 'audioFiles';
const SETTINGS_STORE = 'trackSettings';
const SEGMENT_STORE = 'audioSegments';
const DB_VERSION = 6; // Increased version to force upgrade

export async function initDB() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion, newVersion) {
      // Delete existing stores if they exist
      if (db.objectStoreNames.contains(AUDIO_STORE)) {
        db.deleteObjectStore(AUDIO_STORE);
      }
      
      // Create new store with auto-incrementing key
      const audioStore = db.createObjectStore(AUDIO_STORE, {
        autoIncrement: true
      });
      
      // Create indexes
      audioStore.createIndex('id', 'id', { unique: true });
      audioStore.createIndex('trackId', 'trackId');
      audioStore.createIndex('segmentIndex', 'segmentIndex');
      
      // Create or recreate other stores
      if (!db.objectStoreNames.contains(SETTINGS_STORE)) {
        db.createObjectStore(SETTINGS_STORE);
      }

      if (!db.objectStoreNames.contains(SEGMENT_STORE)) {
        const segmentStore = db.createObjectStore(SEGMENT_STORE, { 
          autoIncrement: true 
        });
        segmentStore.createIndex('trackId', 'trackId');
      }
    },
  });
}

export const saveAudioFile = async (trackId, audioData, isSegment = false, segmentIndex = null) => {
  console.log('Entered saveAudioFile function');
  console.log(`Received Parameters - trackId: ${trackId}, isSegment: ${isSegment}, segmentIndex: ${segmentIndex}`);
  
  try {
    const db = await initDB();
    console.log('Database initialized successfully');
    
    const transaction = db.transaction(AUDIO_STORE, 'readwrite');
    const store = transaction.objectStore(AUDIO_STORE);
    
    // Generate a string ID for the record
    const recordId = isSegment ? `${trackId}_segment_${segmentIndex}` : `${trackId}`;
    
    // Create the record
    const audioRecord = {
      id: recordId,
      trackId: trackId.toString(), // Store as string to avoid NaN issues
      audioData: audioData,
      isSegment,
      segmentIndex: segmentIndex,
      timestamp: Date.now()
    };
    
    // Log the record (excluding audio data)
    const logRecord = { ...audioRecord };
    delete logRecord.audioData;
    console.log('Audio record to be saved:', logRecord);
    
    // Use add instead of put for new records
    const result = await store.add(audioRecord);
    console.log(`Audio file saved successfully with result:`, result);
    
    await transaction.done;
    return recordId;
    
  } catch (error) {
    console.error('Error saving audio file:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    throw error;
  }
};

export const getAudioFile = async (trackId, isSegment = false, segmentIndex = null) => {
  try {
    const db = await initDB();
    const transaction = db.transaction(AUDIO_STORE, 'readonly');
    const store = transaction.objectStore(AUDIO_STORE);
    const index = store.index('id');
    
    const key = isSegment ? `${trackId}_segment_${segmentIndex}` : `${trackId}`;
    const result = await index.get(key);
    
    if (!result) {
      console.log(`No audio file found for key: ${key}`);
      return null;
    }
    
    return result.audioData;
  } catch (error) {
    console.error('Error getting audio file:', error);
    throw error;
  }
};

export const deleteAudioFile = async (trackId, isSegment = false, segmentIndex = null) => {
  try {
    const db = await initDB();
    const transaction = db.transaction(AUDIO_STORE, 'readwrite');
    const store = transaction.objectStore(AUDIO_STORE);
    const index = store.index('id');
    
    const key = isSegment ? `${trackId}_segment_${segmentIndex}` : `${trackId}`;
    
    // First find the record using the id index
    const cursor = await index.openCursor(key);
    if (cursor) {
      // Delete using the primary key
      await store.delete(cursor.primaryKey);
      console.log(`Audio file deleted successfully with key: ${key}`);
    }
    
    await transaction.done;
  } catch (error) {
    console.error('Error deleting audio file:', error);
    throw error;
  }
};

// Keep all existing settings-related functions
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
  return db.getAll(SETTINGS_STORE);
}

export async function deleteTrackSettings(trackId) {
  const db = await initDB();
  await db.delete(SETTINGS_STORE, trackId);
}

export async function clearIndexedDB() {
  const db = await initDB();
  const transaction = db.transaction([AUDIO_STORE, SETTINGS_STORE, SEGMENT_STORE], 'readwrite');
  await Promise.all([
    transaction.objectStore(AUDIO_STORE).clear(),
    transaction.objectStore(SETTINGS_STORE).clear(),
    transaction.objectStore(SEGMENT_STORE).clear()
  ]);
  await transaction.done;
}