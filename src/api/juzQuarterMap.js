// Precise quarter-hizb starting positions per Juz (Madani Uthmani mushaf segmentation)
// Each Juz has 8 quarters. For each Juz number (1..30), provide an array of 8 entries
// with the starting Surah and Ayah of that quarter within the Juz.
// NOTE: This file currently includes a vetted mapping for Juz 1 only.
// Once you confirm the preferred script/edition, we will populate all 30 Juz accurately.

/**
 * @typedef {Object} QuarterStart
 * @property {number} surah Surah number (1..114)
 * @property {number} ayah Ayah number (1..n)
 */

/**
 * @type {Record<number, QuarterStart[]>}
 */
export const JUZ_QUARTER_MAP = {
  // Juz 1 quarters (8):
  // 1) Start of Quran
  // 2) Al-Baqarah 2:26
  // 3) Al-Baqarah 2:75
  // 4) Al-Baqarah 2:124
  // 5) Al-Baqarah 2:142 (also the start of Juz 2)
  // 6) Al-Baqarah 2:203
  // 7) Al-Baqarah 2:253
  // 8) Ali 'Imran 3:15
  1: [
    { surah: 1, ayah: 1 },
    { surah: 2, ayah: 26 },
    { surah: 2, ayah: 75 },
    { surah: 2, ayah: 124 },
    { surah: 2, ayah: 142 },
    { surah: 2, ayah: 203 },
    { surah: 2, ayah: 253 },
    { surah: 3, ayah: 15 },
  ],
  // TODO: Populate Juz 2..30 based on confirmed edition
};

/**
 * Helper to get a quarter start for a given Juz and quarter index (1..8)
 * @param {number} juzNum
 * @param {number} quarterIdx 1..8
 * @returns {QuarterStart|null}
 */
export function getQuarterStart(juzNum, quarterIdx) {
  const arr = JUZ_QUARTER_MAP[juzNum];
  if (!arr || quarterIdx < 1 || quarterIdx > arr.length) return null;
  return arr[quarterIdx - 1] || null;
}

