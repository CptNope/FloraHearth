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

/**
 * Shrink a photo before storing it: phone photos are 3-8 MB, which fills
 * browser storage after a few dozen entries and makes backups huge.
 * Longest side capped at `maxDim`, re-encoded as JPEG; EXIF orientation is
 * applied so portrait shots stay upright. Falls back to the original file.
 */
export async function compressImage(file: File, maxDim = 1600, quality = 0.82): Promise<string> {
  try {
    const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' } as ImageBitmapOptions);
    const scale = Math.min(1, maxDim / Math.max(bitmap.width, bitmap.height));
    const w = Math.round(bitmap.width * scale);
    const h = Math.round(bitmap.height * scale);
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('no 2d context');
    ctx.drawImage(bitmap, 0, 0, w, h);
    bitmap.close?.();
    return canvas.toDataURL('image/jpeg', quality);
  } catch (err) {
    console.warn('Photo compression failed; storing the original', err);
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  }
}

/** Every stored photo, keyed by photo id (for backups). */
export async function getAllJournalPhotos(): Promise<Record<string, string>> {
  try {
    const db = await openPhotoDb();
    return await new Promise((resolve, reject) => {
      const req = db.transaction(STORE_NAME, 'readonly').objectStore(STORE_NAME).getAll();
      req.onsuccess = () => {
        const out: Record<string, string> = {};
        (req.result as { id: string; dataUrl: string }[]).forEach(r => { if (r?.id && r.dataUrl) out[r.id] = r.dataUrl; });
        resolve(out);
      };
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('Failed to read photos for backup', err);
    return {};
  }
}

/** Restore photos from a backup. Returns how many were written. */
export async function putJournalPhotos(photos: Record<string, string>): Promise<number> {
  const entries = Object.entries(photos).filter(([id, url]) => typeof id === 'string' && typeof url === 'string' && url.startsWith('data:image/'));
  if (entries.length === 0) return 0;
  const db = await openPhotoDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    entries.forEach(([id, dataUrl]) => store.put({ id, dataUrl, createdAt: new Date().toISOString() }));
    tx.oncomplete = () => resolve(entries.length);
    tx.onerror = () => reject(tx.error);
  });
}
