// Minimal IndexedDB wrapper for offline Quran caching and Hifz progress
// No external dependencies to keep footprint small

const DB_NAME = 'quran_hifz_db';
const DB_VERSION = 1;
const STORES = {
  surahCache: 'surahCache', // key: `${surahNumber}|${translationId}|${audioEdition}` => { verses: [...], cachedAt }
  juzCache: 'juzCache',     // key: `${juzNumber}|${translationId}|${audioEdition}`
  ayahProgress: 'ayahProgress', // key: `${surahNumber}-${ayahNumber}` => { status: 'memorised'|'revision'|'new', updatedAt }
  settings: 'settings',      // key: settingName => value
};

function openDb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (event) => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORES.surahCache)) db.createObjectStore(STORES.surahCache);
      if (!db.objectStoreNames.contains(STORES.juzCache)) db.createObjectStore(STORES.juzCache);
      if (!db.objectStoreNames.contains(STORES.ayahProgress)) db.createObjectStore(STORES.ayahProgress);
      if (!db.objectStoreNames.contains(STORES.settings)) db.createObjectStore(STORES.settings);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function withStore(storeName, mode, fn) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, mode);
    const store = tx.objectStore(storeName);
    const result = fn(store);
    tx.oncomplete = () => resolve(result);
    tx.onerror = () => reject(tx.error);
  });
}

export async function setSurahCache(key, value) {
  return withStore(STORES.surahCache, 'readwrite', (store) => store.put(value, key));
}

export async function getSurahCache(key) {
  return withStore(STORES.surahCache, 'readonly', (store) => store.get(key));
}

export async function setJuzCache(key, value) {
  return withStore(STORES.juzCache, 'readwrite', (store) => store.put(value, key));
}

export async function getJuzCache(key) {
  return withStore(STORES.juzCache, 'readonly', (store) => store.get(key));
}

export async function setAyahStatus(surahNumber, ayahNumber, status) {
  const key = `${surahNumber}-${ayahNumber}`;
  const value = { status, updatedAt: Date.now() };
  return withStore(STORES.ayahProgress, 'readwrite', (store) => store.put(value, key));
}

export async function getAyahStatus(surahNumber, ayahNumber) {
  const key = `${surahNumber}-${ayahNumber}`;
  return withStore(STORES.ayahProgress, 'readonly', (store) => store.get(key));
}

export async function getAllAyahStatuses() {
  return withStore(STORES.ayahProgress, 'readonly', (store) => {
    return new Promise((resolve, reject) => {
      const out = {};
      const req = store.openCursor();
      req.onsuccess = (e) => {
        const cursor = e.target.result;
        if (cursor) {
          out[cursor.key] = cursor.value;
          cursor.continue();
        } else {
          resolve(out);
        }
      };
      req.onerror = () => reject(req.error);
    });
  });
}

export async function setSetting(name, value) {
  return withStore(STORES.settings, 'readwrite', (store) => store.put(value, name));
}

export async function getSetting(name) {
  return withStore(STORES.settings, 'readonly', (store) => store.get(name));
}

export async function clearStore(storeName) {
  return withStore(storeName, 'readwrite', (store) => store.clear());
}

