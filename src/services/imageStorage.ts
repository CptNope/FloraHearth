/**
 * FloraHearth IndexedDB Photo Storage Service
 * Keeps high-resolution garden & plant journal photos in IndexedDB
 * preventing localStorage quota overflow (5MB limit).
 */

const DB_NAME = 'florahearth_media_db';
const DB_VERSION = 1;
const STORE_NAME = 'journal_photos';

function openPhotoDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return reject(new Error('IndexedDB is not supported in this environment'));
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveJournalPhoto(photoId: string, dataUrl: string): Promise<string> {
  try {
    const db = await openPhotoDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const record = {
        id: photoId,
        dataUrl,
        createdAt: new Date().toISOString(),
      };
      const req = store.put(record);

      req.onsuccess = () => resolve(photoId);
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('Failed to save photo to IndexedDB', err);
    throw err;
  }
}

export async function getJournalPhoto(photoId: string): Promise<string | null> {
  try {
    const db = await openPhotoDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(photoId);

      req.onsuccess = () => {
        if (req.result && req.result.dataUrl) {
          resolve(req.result.dataUrl);
        } else {
          resolve(null);
        }
      };
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('Failed to retrieve photo from IndexedDB', err);
    return null;
  }
}

export async function deleteJournalPhoto(photoId: string): Promise<void> {
  try {
    const db = await openPhotoDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(photoId);

      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('Failed to delete photo from IndexedDB', err);
  }
}
