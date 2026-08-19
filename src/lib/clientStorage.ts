import { Product } from './products';
import { SiteSettings } from './settings';

const PRODUCTS_KEY = 'ai_studio_user_products_v3';
const SETTINGS_KEY = 'ai_studio_user_settings_v3';

export function getStoredProducts(): Product[] | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(PRODUCTS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
  } catch (e) {
    console.warn("Error reading stored products from localStorage:", e);
  }
  return null;
}

export function setStoredProducts(products: Product[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
    window.dispatchEvent(new Event('ai_studio_data_changed'));
  } catch (e) {
    console.warn("Error saving products to localStorage:", e);
  }
}

export function getStoredSettings(): SiteSettings | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object') {
      return parsed;
    }
  } catch (e) {
    console.warn("Error reading stored settings from localStorage:", e);
  }
  return null;
}

export function setStoredSettings(settings: SiteSettings): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    window.dispatchEvent(new Event('ai_studio_data_changed'));
  } catch (e) {
    console.warn("Error saving settings to localStorage:", e);
  }
}
