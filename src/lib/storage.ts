import fs from 'fs';
import path from 'path';
import { Product, INITIAL_PRODUCTS } from './products';
import { SiteSettings, DEFAULT_SETTINGS } from './settings';
import { prisma } from './db';
import {
  fetchProductsFromSupabase,
  saveProductToSupabase,
  fetchSettingsFromSupabase,
  saveSettingsToSupabase,
} from './supabase';

const DATA_DIR = path.join(process.cwd(), 'data');
const PRODUCTS_FILE = path.join(DATA_DIR, 'products.json');
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json');

// In-memory fallback cache
let memoryProducts: Product[] | null = null;
let memorySettings: SiteSettings | null = null;

function ensureDataFilesExist() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(PRODUCTS_FILE)) {
      fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(INITIAL_PRODUCTS, null, 2), 'utf-8');
    }
    if (!fs.existsSync(SETTINGS_FILE)) {
      fs.writeFileSync(SETTINGS_FILE, JSON.stringify(DEFAULT_SETTINGS, null, 2), 'utf-8');
    }
  } catch (e) {
    console.warn("Data directory initialization warning:", e);
  }
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
 * Load products from Supabase first if configured,
 * then Database (Prisma), then Cloud KV, then local filesystem (data/products.json), then memory, then initial defaults.
 */
export async function loadProductsAsync(): Promise<Product[]> {
  ensureDataFilesExist();

  // 0. Try Supabase Database
  const supabaseProducts = await fetchProductsFromSupabase();
  if (supabaseProducts && supabaseProducts.length > 0) {
    memoryProducts = supabaseProducts;
    return supabaseProducts;
  }

  // 1. Try Prisma Database (PostgreSQL / SQLite)
  if (process.env.DATABASE_URL) {
    try {
      const dbProducts = await prisma.product.findMany({
        orderBy: { createdAt: 'desc' },
      });
      if (dbProducts && dbProducts.length > 0) {
        const mapped: Product[] = dbProducts.map((p) => ({
          id: p.id,
          name: p.name,
          category: p.category,
          price: p.price,
          originalPrice: p.originalPrice || undefined,
          billingPeriod: p.billingPeriod,
          description: p.description,
          features: typeof p.features === 'string' ? JSON.parse(p.features) : p.features,
          badge: p.badge || undefined,
          popular: p.popular,
          imageUrl: p.imageUrl || undefined,
          iconType: (p.iconType as Product['iconType']) || 'custom',
          whatsappMsg: p.whatsappMsg || undefined,
          active: p.active,
          createdAt: p.createdAt.toISOString(),
          updatedAt: p.updatedAt.toISOString(),
        }));
        memoryProducts = mapped;
        return mapped;
      }
    } catch (e) {
      console.warn("Prisma DB read error, falling back to File/Memory:", e);
    }
  }

  // 2. Try Cloud KV
  const kvProducts = await getKvData<Product[]>('ai_studio_products');
  if (kvProducts && Array.isArray(kvProducts) && kvProducts.length > 0) {
    memoryProducts = kvProducts;
    return kvProducts;
  }

  // 3. Try Local Filesystem (Primary local persistent store)
  try {
    if (fs.existsSync(PRODUCTS_FILE)) {
      const fileData = fs.readFileSync(PRODUCTS_FILE, 'utf-8');
      const parsed = JSON.parse(fileData);
      if (Array.isArray(parsed) && parsed.length > 0) {
        memoryProducts = parsed;
        return memoryProducts;
      }
    }
  } catch (e) {
    console.warn("Filesystem products read error:", e);
  }

  // 4. Try Memory Cache
  if (memoryProducts && memoryProducts.length > 0) {
    return memoryProducts;
  }

  memoryProducts = [...INITIAL_PRODUCTS];
  return memoryProducts;
}

/**
 * Synchronous product getter for instant render fallback
 */
export function loadProductsSync(): Product[] {
  ensureDataFilesExist();

  try {
    if (fs.existsSync(PRODUCTS_FILE)) {
      const fileData = fs.readFileSync(PRODUCTS_FILE, 'utf-8');
      const parsed = JSON.parse(fileData);
      if (Array.isArray(parsed) && parsed.length > 0) {
        memoryProducts = parsed;
        return memoryProducts;
      }
    }
  } catch (e) {
    console.warn("Filesystem products sync read error:", e);
  }

  if (memoryProducts && memoryProducts.length > 0) {
    return memoryProducts;
  }

  memoryProducts = [...INITIAL_PRODUCTS];
  return memoryProducts;
}

/**
 * Save products to Supabase, Prisma Database, Cloud KV, filesystem, and memory store.
 */
export async function saveProductsPersistent(products: Product[]): Promise<boolean> {
  memoryProducts = [...products];

  // 1. Filesystem write (immediate local disk persistence)
  try {
    ensureDataFilesExist();
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2), 'utf-8');
  } catch (e) {
    console.warn("Filesystem write skipped (Serverless environment)", e);
  }

  // 2. Supabase save if configured
  for (const p of products) {
    await saveProductToSupabase(p);
  }

  // 3. Prisma DB save if DATABASE_URL exists
  if (process.env.DATABASE_URL) {
    try {
      const activeIds = products.map(p => p.id);
      if (activeIds.length > 0) {
        await prisma.product.deleteMany({
          where: { id: { notIn: activeIds } },
        });
      } else {
        await prisma.product.deleteMany({});
      }

      for (const p of products) {
        await prisma.product.upsert({
          where: { id: p.id },
          update: {
            name: p.name,
            category: p.category,
            price: p.price,
            originalPrice: p.originalPrice,
            billingPeriod: p.billingPeriod,
            description: p.description,
            features: JSON.stringify(p.features || []),
            badge: p.badge,
            popular: p.popular || false,
            imageUrl: p.imageUrl,
            iconType: p.iconType || 'custom',
            whatsappMsg: p.whatsappMsg,
            active: p.active !== false,
          },
          create: {
            id: p.id,
            name: p.name,
            category: p.category,
            price: p.price,
            originalPrice: p.originalPrice,
            billingPeriod: p.billingPeriod,
            description: p.description,
            features: JSON.stringify(p.features || []),
            badge: p.badge,
            popular: p.popular || false,
            imageUrl: p.imageUrl,
            iconType: p.iconType || 'custom',
            whatsappMsg: p.whatsappMsg,
            active: p.active !== false,
          },
        });
      }
    } catch (e) {
      console.warn("Prisma DB save error:", e);
    }
  }

  // 4. Cloud KV store if configured
  await setKvData('ai_studio_products', products);

  return true;
}

/**
 * Load site settings from Supabase, Prisma DB, Cloud KV, filesystem, memory, or defaults.
 */
export async function loadSettingsAsync(): Promise<SiteSettings> {
  ensureDataFilesExist();

  const supabaseSettings = await fetchSettingsFromSupabase();
  if (supabaseSettings) {
    memorySettings = supabaseSettings;
    return supabaseSettings;
  }

  if (process.env.DATABASE_URL) {
    try {
      const dbSettings = await prisma.siteSetting.findUnique({
        where: { id: 'default' },
      });
      if (dbSettings) {
        memorySettings = {
          whatsappNumber: dbSettings.whatsappNumber || DEFAULT_SETTINGS.whatsappNumber,
          facebookUrl: dbSettings.facebookUrl || DEFAULT_SETTINGS.facebookUrl,
          usdToEgpRate: typeof dbSettings.usdToEgpRate === 'number' ? dbSettings.usdToEgpRate : 50,
          updatedAt: dbSettings.updatedAt.toISOString(),
        };
        return memorySettings;
      }
    } catch (e) {
      console.warn("Prisma DB settings read error:", e);
    }
  }

  const kvSettings = await getKvData<SiteSettings>('ai_studio_settings');
  if (kvSettings && typeof kvSettings === 'object') {
    memorySettings = {
      whatsappNumber: kvSettings.whatsappNumber || DEFAULT_SETTINGS.whatsappNumber,
      facebookUrl: kvSettings.facebookUrl || DEFAULT_SETTINGS.facebookUrl,
      usdToEgpRate: typeof kvSettings.usdToEgpRate === 'number' ? kvSettings.usdToEgpRate : 50,
      updatedAt: kvSettings.updatedAt || DEFAULT_SETTINGS.updatedAt,
    };
    return memorySettings;
  }

  // Filesystem check
  try {
    if (fs.existsSync(SETTINGS_FILE)) {
      const fileData = fs.readFileSync(SETTINGS_FILE, 'utf-8');
      const parsed = JSON.parse(fileData);
      if (parsed && typeof parsed === 'object') {
        memorySettings = {
          whatsappNumber: parsed.whatsappNumber || DEFAULT_SETTINGS.whatsappNumber,
          facebookUrl: parsed.facebookUrl || DEFAULT_SETTINGS.facebookUrl,
          usdToEgpRate: typeof parsed.usdToEgpRate === 'number' ? parsed.usdToEgpRate : 50,
          updatedAt: parsed.updatedAt || DEFAULT_SETTINGS.updatedAt,
        };
        return memorySettings;
      }
    }
  } catch (e) {
    console.warn("Filesystem settings read error:", e);
  }

  if (memorySettings) return memorySettings;

  memorySettings = { ...DEFAULT_SETTINGS };
  return memorySettings;
}

/**
 * Synchronous settings getter
 */
export function loadSettingsSync(): SiteSettings {
  ensureDataFilesExist();

  try {
    if (fs.existsSync(SETTINGS_FILE)) {
      const fileData = fs.readFileSync(SETTINGS_FILE, 'utf-8');
      const parsed = JSON.parse(fileData);
      if (parsed && typeof parsed === 'object') {
        memorySettings = {
          whatsappNumber: parsed.whatsappNumber || DEFAULT_SETTINGS.whatsappNumber,
          facebookUrl: parsed.facebookUrl || DEFAULT_SETTINGS.facebookUrl,
          usdToEgpRate: typeof parsed.usdToEgpRate === 'number' ? parsed.usdToEgpRate : 50,
          updatedAt: parsed.updatedAt || DEFAULT_SETTINGS.updatedAt,
        };
        return memorySettings;
      }
    }
  } catch (e) {
    console.warn("Filesystem settings sync read error:", e);
  }

  if (memorySettings) return memorySettings;

  memorySettings = { ...DEFAULT_SETTINGS };
  return memorySettings;
}

/**
 * Save site settings to Supabase, Prisma DB, Cloud KV, filesystem, and memory.
 */
export async function saveSettingsPersistent(settings: SiteSettings): Promise<SiteSettings> {
  memorySettings = { ...settings };

  try {
    ensureDataFilesExist();
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2), 'utf-8');
  } catch (e) {
    console.warn("Filesystem write skipped (Serverless environment)", e);
  }

  await saveSettingsToSupabase(settings);

  if (process.env.DATABASE_URL) {
    try {
      await prisma.siteSetting.upsert({
        where: { id: 'default' },
        update: {
          whatsappNumber: settings.whatsappNumber,
          facebookUrl: settings.facebookUrl,
          usdToEgpRate: settings.usdToEgpRate || 50,
        },
        create: {
          id: 'default',
          whatsappNumber: settings.whatsappNumber,
          facebookUrl: settings.facebookUrl,
          usdToEgpRate: settings.usdToEgpRate || 50,
        },
      });
    } catch (e) {
      console.warn("Prisma DB settings write error:", e);
    }
  }

  await setKvData('ai_studio_settings', settings);

  return memorySettings;
}
