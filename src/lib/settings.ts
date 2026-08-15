import { loadSettingsSync, loadSettingsAsync, saveSettingsPersistent } from './storage';

export interface SiteSettings {
  whatsappNumber: string;
  facebookUrl: string;
  usdToEgpRate: number; // 1 USD = X EGP (default: 5)
  updatedAt?: string;
}

export const DEFAULT_SETTINGS: SiteSettings = {
  whatsappNumber: '201021510826',
  facebookUrl: 'https://www.facebook.com/share/1NbRrA56uz/',
  usdToEgpRate: 5, // Default: 5 EGP per 1 USD
  updatedAt: '2026-01-01T00:00:00.000Z',
};

export function getSiteSettings(): SiteSettings {
  return loadSettingsSync();
}

export async function getSiteSettingsAsync(): Promise<SiteSettings> {
  return await loadSettingsAsync();
}

export function saveSiteSettings(settings: Partial<SiteSettings>): SiteSettings {
  const current = getSiteSettings();
  
  const parsedRate = settings.usdToEgpRate !== undefined && !isNaN(Number(settings.usdToEgpRate))
    ? Number(settings.usdToEgpRate)
    : current.usdToEgpRate || DEFAULT_SETTINGS.usdToEgpRate;

  const updated: SiteSettings = {
    whatsappNumber: settings.whatsappNumber ? settings.whatsappNumber.trim() : current.whatsappNumber,
    facebookUrl: settings.facebookUrl ? settings.facebookUrl.trim() : current.facebookUrl,
    usdToEgpRate: parsedRate > 0 ? parsedRate : 5,
    updatedAt: new Date().toISOString(),
  };

  saveSettingsPersistent(updated);
  return updated;
}


