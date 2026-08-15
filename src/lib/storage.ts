import fs from 'fs';
import path from 'path';
import { Product, INITIAL_PRODUCTS } from './products';
import { SiteSettings, DEFAULT_SETTINGS } from './settings';

const DATA_DIR = path.join(process.cwd(), 'data');
const PRODUCTS_FILE = path.join(DATA_DIR, 'products.json');
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json');

// In-memory fallback cache
let memoryProducts: Product[] | null = null;
let memorySettings: SiteSettings | null = null;

function ensureDataDir() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  } catch {}
}

// Helpers for Upstash Redis / Vercel KV REST API if env variables are provided
async function getKvData<T>(key: string): Promise<T | null> {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) return null;

  try {
    const res = await fetch(`${url}/get/${key}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (data.result) {
      return typeof data.result === 'string' ? JSON.parse(data.result) : data.result;
    }
  } catch (error) {
    console.warn(`KV read error for key ${key}:`, error);
  }
  return null;
}

async function setKvData<T>(key: string, value: T): Promise<boolean> {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) return false;

  try {
    const stringified = JSON.stringify(value);
    const res = await fetch(`${url}/set/${key}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: stringified,
    });
    return res.ok;
  } catch (error) {
    console.warn(`KV write error for key ${key}:`, error);
    return false;
  }
}

/**
 * Load products from KV store first, then local filesystem, then memory, then initial defaults.
 */
export async function loadProductsAsync(): Promise<Product[]> {
  // 1. Try Cloud KV
  const kvProducts = await getKvData<Product[]>('ai_studio_products');
  if (kvProducts && Array.isArray(kvProducts) && kvProducts.length > 0) {
    memoryProducts = kvProducts;
    return kvProducts;
  }

  // 2. Try Memory
  if (memoryProducts && memoryProducts.length > 0) {
    return memoryProducts;
  }

  // 3. Try Filesystem
  try {
    ensureDataDir();
    if (fs.existsSync(PRODUCTS_FILE)) {
      const fileData = fs.readFileSync(PRODUCTS_FILE, 'utf-8');
      const parsed = JSON.parse(fileData);
      if (Array.isArray(parsed) && parsed.length > 0) {
        memoryProducts = parsed;
        return memoryProducts;
      }
    }
  } catch {}

  memoryProducts = [...INITIAL_PRODUCTS];
  return memoryProducts;
}

/**
 * Synchronous product getter for instant render fallback
 */
export function loadProductsSync(): Product[] {
  if (memoryProducts && memoryProducts.length > 0) {
    return memoryProducts;
  }
  try {
    ensureDataDir();
    if (fs.existsSync(PRODUCTS_FILE)) {
      const fileData = fs.readFileSync(PRODUCTS_FILE, 'utf-8');
      const parsed = JSON.parse(fileData);
      if (Array.isArray(parsed) && parsed.length > 0) {
        memoryProducts = parsed;
        return memoryProducts;
      }
    }
  } catch {}

  memoryProducts = [...INITIAL_PRODUCTS];
  return memoryProducts;
}

/**
 * Save products to Cloud KV, filesystem, and memory store.
 */
export async function saveProductsPersistent(products: Product[]): Promise<boolean> {
  memoryProducts = [...products];

  // 1. Try Filesystem write
  try {
    ensureDataDir();
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2), 'utf-8');
  } catch (e) {
    console.warn("Filesystem write skipped (Serverless environment)", e);
  }

  // 2. Try Cloud KV store if configured
  await setKvData('ai_studio_products', products);

  return true;
}

/**
 * Load site settings from Cloud KV, filesystem, memory, or defaults.
 */
export async function loadSettingsAsync(): Promise<SiteSettings> {
  const kvSettings = await getKvData<SiteSettings>('ai_studio_settings');
  if (kvSettings && typeof kvSettings === 'object') {
    memorySettings = {
      whatsappNumber: kvSettings.whatsappNumber || DEFAULT_SETTINGS.whatsappNumber,
      facebookUrl: kvSettings.facebookUrl || DEFAULT_SETTINGS.facebookUrl,
      usdToEgpRate: typeof kvSettings.usdToEgpRate === 'number' ? kvSettings.usdToEgpRate : DEFAULT_SETTINGS.usdToEgpRate,
      updatedAt: kvSettings.updatedAt || DEFAULT_SETTINGS.updatedAt,
    };
    return memorySettings;
  }

  if (memorySettings) return memorySettings;

  try {
    ensureDataDir();
    if (fs.existsSync(SETTINGS_FILE)) {
      const fileData = fs.readFileSync(SETTINGS_FILE, 'utf-8');
      const parsed = JSON.parse(fileData);
      if (parsed && typeof parsed === 'object') {
        memorySettings = {
          whatsappNumber: parsed.whatsappNumber || DEFAULT_SETTINGS.whatsappNumber,
          facebookUrl: parsed.facebookUrl || DEFAULT_SETTINGS.facebookUrl,
          usdToEgpRate: typeof parsed.usdToEgpRate === 'number' ? parsed.usdToEgpRate : DEFAULT_SETTINGS.usdToEgpRate,
          updatedAt: parsed.updatedAt || DEFAULT_SETTINGS.updatedAt,
        };
        return memorySettings;
      }
    }
  } catch {}

  memorySettings = { ...DEFAULT_SETTINGS };
  return memorySettings;
}

/**
 * Synchronous settings getter
 */
export function loadSettingsSync(): SiteSettings {
  if (memorySettings) return memorySettings;

  try {
    ensureDataDir();
    if (fs.existsSync(SETTINGS_FILE)) {
      const fileData = fs.readFileSync(SETTINGS_FILE, 'utf-8');
      const parsed = JSON.parse(fileData);
      if (parsed && typeof parsed === 'object') {
        memorySettings = {
          whatsappNumber: parsed.whatsappNumber || DEFAULT_SETTINGS.whatsappNumber,
          facebookUrl: parsed.facebookUrl || DEFAULT_SETTINGS.facebookUrl,
          usdToEgpRate: typeof parsed.usdToEgpRate === 'number' ? parsed.usdToEgpRate : DEFAULT_SETTINGS.usdToEgpRate,
          updatedAt: parsed.updatedAt || DEFAULT_SETTINGS.updatedAt,
        };
        return memorySettings;
      }
    }
  } catch {}

  memorySettings = { ...DEFAULT_SETTINGS };
  return memorySettings;
}

/**
 * Save site settings to Cloud KV, filesystem, and memory.
 */
export async function saveSettingsPersistent(settings: SiteSettings): Promise<SiteSettings> {
  memorySettings = { ...settings };

  try {
    ensureDataDir();
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2), 'utf-8');
  } catch (e) {
    console.warn("Filesystem write skipped (Serverless environment)", e);
  }

  await setKvData('ai_studio_settings', settings);

  return memorySettings;
}
