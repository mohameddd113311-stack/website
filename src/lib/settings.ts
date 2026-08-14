import fs from 'fs';
import path from 'path';

export interface SiteSettings {
  whatsappNumber: string;
  facebookUrl: string;
}

export const DEFAULT_SETTINGS: SiteSettings = {
  whatsappNumber: '201021510826',
  facebookUrl: 'https://www.facebook.com/share/1NbRrA56uz/',
};

let memorySettingsStore: SiteSettings = { ...DEFAULT_SETTINGS };

const DATA_DIR = path.join(process.cwd(), 'data');
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json');

function ensureDataDir() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  } catch (error) {
    console.warn("Notice: File system write restricted.", error);
  }
}

export function getSiteSettings(): SiteSettings {
  try {
    ensureDataDir();
    if (fs.existsSync(SETTINGS_FILE)) {
      const fileData = fs.readFileSync(SETTINGS_FILE, 'utf-8');
      const parsed = JSON.parse(fileData);
      if (parsed && typeof parsed === 'object') {
        memorySettingsStore = {
          whatsappNumber: parsed.whatsappNumber || DEFAULT_SETTINGS.whatsappNumber,
          facebookUrl: parsed.facebookUrl || DEFAULT_SETTINGS.facebookUrl,
        };
      }
    } else {
      // Create initial settings file if not existing
      try {
        fs.writeFileSync(SETTINGS_FILE, JSON.stringify(DEFAULT_SETTINGS, null, 2), 'utf-8');
      } catch {}
    }
  } catch (error) {
    console.warn("Reading settings file failed, using memory store:", error);
  }
  return memorySettingsStore;
}

export function saveSiteSettings(settings: Partial<SiteSettings>): SiteSettings {
  const current = getSiteSettings();
  const updated: SiteSettings = {
    whatsappNumber: settings.whatsappNumber ? settings.whatsappNumber.trim() : current.whatsappNumber,
    facebookUrl: settings.facebookUrl ? settings.facebookUrl.trim() : current.facebookUrl,
  };

  memorySettingsStore = updated;

  try {
    ensureDataDir();
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(updated, null, 2), 'utf-8');
  } catch (error) {
    console.warn("Saved settings to memory store", error);
  }

  return updated;
}
