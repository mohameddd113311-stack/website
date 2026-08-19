import fs from 'fs';
import path from 'path';
import { Product, INITIAL_PRODUCTS } from './products';
import { SiteSettings, DEFAULT_SETTINGS } from './settings';
import { prisma } from './db';
import {
  fetchProductsFromSupabase,
  saveProductToSupabase,
  deleteProductFromSupabase,
  fetchSettingsFromSupabase,
  saveSettingsToSupabase,
} from './supabase';

const DATA_DIR = path.join(process.cwd(), 'data');
const PRODUCTS_FILE = path.join(DATA_DIR, 'products.json');
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json');

// In-memory cache for fast sync reads
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

/**
 * Helper to safely parse features string/jsonb
 */
function parseFeatures(features: any): string[] {
  if (Array.isArray(features)) return features;
  if (typeof features === 'string') {
    try {
      const parsed = JSON.parse(features);
      if (Array.isArray(parsed)) return parsed;
      return [features];
    } catch {
      return [features];
    }
  }
  return [];
}

/**
 * Load products from Supabase (REST API or Prisma),
 * otherwise load from local JSON file.
 */
export async function loadProductsAsync(): Promise<Product[]> {
  // 1. Primary: Supabase REST API
  const supabaseProducts = await fetchProductsFromSupabase();
  if (supabaseProducts && supabaseProducts.length > 0) {
    memoryProducts = supabaseProducts;
    return supabaseProducts;
  }

  // 2. Secondary: Prisma PostgreSQL
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
          stockQuantity: p.stockQuantity ?? 999,
          billingPeriod: p.billingPeriod,
          description: p.description,
          features: parseFeatures(p.features),
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
      console.warn("Prisma PostgreSQL products read error, falling back to local file:", e);
    }
  }

  // 3. Fallback: Local Filesystem JSON
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
    console.warn("Filesystem products read error:", e);
  }

  // 4. Fallback: Memory or Initial Defaults
  if (memoryProducts !== null && Array.isArray(memoryProducts) && memoryProducts.length > 0) {
    return memoryProducts;
  }

  memoryProducts = [...INITIAL_PRODUCTS];
  try {
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(INITIAL_PRODUCTS, null, 2), 'utf-8');
  } catch {}
  return memoryProducts;
}

/**
 * Synchronous product getter for initial rendering fallback
 */
export function loadProductsSync(): Product[] {
  ensureDataFilesExist();

  if (memoryProducts !== null && Array.isArray(memoryProducts) && memoryProducts.length > 0) {
    return memoryProducts;
  }

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

  memoryProducts = [...INITIAL_PRODUCTS];
  try {
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(INITIAL_PRODUCTS, null, 2), 'utf-8');
  } catch {}
  return memoryProducts;
}

/**
 * Save products to Supabase (REST API + Prisma PostgreSQL) and local filesystem.
 */
export async function saveProductsPersistent(products: Product[]): Promise<boolean> {
  memoryProducts = [...products];

  // 1. Filesystem write for local disk persistence
  try {
    ensureDataFilesExist();
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2), 'utf-8');
  } catch (e) {
    console.warn("Filesystem write skipped (Serverless environment)", e);
  }

  // 2. Save directly to Supabase REST API (HTTPS port 443)
  for (const p of products) {
    await saveProductToSupabase(p);
  }

  // 3. Save to Prisma PostgreSQL if DATABASE_URL exists
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
        const featuresStr = typeof p.features === 'string' ? p.features : JSON.stringify(p.features || []);
        await prisma.product.upsert({
          where: { id: p.id },
          update: {
            name: p.name,
            category: p.category,
            price: p.price,
            originalPrice: p.originalPrice || null,
            stockQuantity: p.stockQuantity ?? 999,
            billingPeriod: p.billingPeriod,
            description: p.description,
            features: featuresStr,
            badge: p.badge || null,
            popular: p.popular || false,
            imageUrl: p.imageUrl || null,
            iconType: p.iconType || 'custom',
            whatsappMsg: p.whatsappMsg || null,
            active: p.active !== false,
          },
          create: {
            id: p.id,
            name: p.name,
            category: p.category,
            price: p.price,
            originalPrice: p.originalPrice || null,
            stockQuantity: p.stockQuantity ?? 999,
            billingPeriod: p.billingPeriod,
            description: p.description,
            features: featuresStr,
            badge: p.badge || null,
            popular: p.popular || false,
            imageUrl: p.imageUrl || null,
            iconType: p.iconType || 'custom',
            whatsappMsg: p.whatsappMsg || null,
            active: p.active !== false,
          },
        });
      }
    } catch (e) {
      console.warn("Prisma DB save error:", e);
    }
  }

  return true;
}

/**
 * Load site settings from Supabase or local JSON file.
 */
export async function loadSettingsAsync(): Promise<SiteSettings> {
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
    console.warn("Filesystem settings read error:", e);
  }

  if (memorySettings !== null) return memorySettings;

  memorySettings = { ...DEFAULT_SETTINGS };
  try {
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(DEFAULT_SETTINGS, null, 2), 'utf-8');
  } catch {}
  return memorySettings;
}

/**
 * Synchronous settings getter
 */
export function loadSettingsSync(): SiteSettings {
  ensureDataFilesExist();

  if (memorySettings !== null) return memorySettings;

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

  memorySettings = { ...DEFAULT_SETTINGS };
  try {
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(DEFAULT_SETTINGS, null, 2), 'utf-8');
  } catch {}
  return memorySettings;
}

/**
 * Save site settings to Supabase (REST API + Prisma) and local JSON file.
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

  return memorySettings;
}
