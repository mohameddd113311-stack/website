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

// In-memory cache for fast sync reads and TTL caching
let memoryProducts: Product[] | null = null;
let memorySettings: SiteSettings | null = null;
let lastProductsFetchTime = 0;
let lastSettingsFetchTime = 0;

// Cache TTL configuration
export const PRODUCTS_CACHE_TTL_MS = 60 * 1000; // 60 seconds
export const SETTINGS_CACHE_TTL_MS = 300 * 1000; // 5 minutes

// In-flight request coalescing to prevent thundering herd / duplicate concurrent queries
let activeProductsPromise: Promise<Product[]> | null = null;
let activeSettingsPromise: Promise<SiteSettings> | null = null;

export function invalidateProductsCache() {
  lastProductsFetchTime = 0;
}

export function invalidateSettingsCache() {
  lastSettingsFetchTime = 0;
}

export function updateProductsMemoryCache(products: Product[]) {
  memoryProducts = [...products];
  lastProductsFetchTime = Date.now();
}

export function updateSettingsMemoryCache(settings: SiteSettings) {
  memorySettings = { ...settings };
  lastSettingsFetchTime = Date.now();
}

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
export function parseFeatures(features: any): string[] {
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
 * with in-memory TTL caching and request coalescing to prevent concurrent duplicate queries.
 */
export async function loadProductsAsync(forceRefresh: boolean = false): Promise<Product[]> {
  const now = Date.now();
  // Return memory cache if still fresh and not forcing refresh
  if (!forceRefresh && memoryProducts !== null && (now - lastProductsFetchTime < PRODUCTS_CACHE_TTL_MS)) {
    return memoryProducts;
  }

  // Deduplicate concurrent requests (coalescing)
  if (activeProductsPromise) {
    return activeProductsPromise;
  }

  activeProductsPromise = (async () => {
    try {
      // 1. Primary: Supabase REST API (Port 443 HTTPS)
      try {
        const supabaseProducts = await fetchProductsFromSupabase();
        if (supabaseProducts && Array.isArray(supabaseProducts) && supabaseProducts.length > 0) {
          memoryProducts = supabaseProducts;
          lastProductsFetchTime = Date.now();
          return supabaseProducts;
        }
      } catch (e) {
        console.warn("Supabase REST load warning:", e);
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
            lastProductsFetchTime = Date.now();
            return mapped;
          }
        } catch (e) {
          console.warn("Prisma PostgreSQL products read notice:", e);
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
            lastProductsFetchTime = Date.now();
            return memoryProducts;
          }
        }
      } catch (e) {
        console.warn("Filesystem products read notice:", e);
      }

      // 4. Fallback: Memory or Initial Defaults
      if (memoryProducts !== null && Array.isArray(memoryProducts) && memoryProducts.length > 0) {
        return memoryProducts;
      }

      memoryProducts = [...INITIAL_PRODUCTS];
      lastProductsFetchTime = Date.now();
      try {
        fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(INITIAL_PRODUCTS, null, 2), 'utf-8');
      } catch {}
      return memoryProducts;
    } finally {
      activeProductsPromise = null;
    }
  })();

  return activeProductsPromise;
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
    console.warn("Filesystem products sync read notice:", e);
  }

  memoryProducts = [...INITIAL_PRODUCTS];
  try {
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(INITIAL_PRODUCTS, null, 2), 'utf-8');
  } catch {}
  return memoryProducts;
}

/**
 * Save products to Supabase (REST API + Prisma PostgreSQL) and local filesystem.
 * Returns true only if at least one persistent backend (Supabase or Prisma) succeeded.
 */
export async function saveProductsPersistent(products: Product[]): Promise<boolean> {
  memoryProducts = [...products];
  lastProductsFetchTime = Date.now();
  let persistentSaveSucceeded = false;
  const errors: string[] = [];

  // 1. Primary: Save to Supabase REST API (persistent, works on Vercel)
  try {
    const supabaseResults = await Promise.allSettled(
      products.map(p => saveProductToSupabase(p))
    );
    const supabaseFailures = supabaseResults.filter(
      r => r.status === 'rejected' || (r.status === 'fulfilled' && r.value === false)
    );
    if (supabaseFailures.length === 0 && products.length > 0) {
      persistentSaveSucceeded = true;
    } else if (supabaseFailures.length > 0) {
      errors.push(`Supabase: ${supabaseFailures.length}/${products.length} products failed`);
    }
  } catch (e: any) {
    errors.push(`Supabase REST save error: ${e?.message || e}`);
  }

  // 2. Secondary: Save to Prisma PostgreSQL (persistent, works on Vercel)
  if (process.env.DATABASE_URL) {
    try {
      const activeIds = products.map(p => p.id);
      if (activeIds.length > 0) {
        await prisma.product.deleteMany({
          where: { id: { notIn: activeIds } },
        });
      }

      for (const p of products) {
        const featuresJson = parseFeatures(p.features);
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
            features: featuresJson,
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
            features: featuresJson,
            badge: p.badge || null,
            popular: p.popular || false,
            imageUrl: p.imageUrl || null,
            iconType: p.iconType || 'custom',
            whatsappMsg: p.whatsappMsg || null,
            active: p.active !== false,
          },
        });
      }
      persistentSaveSucceeded = true;
    } catch (e: any) {
      errors.push(`Prisma DB save error: ${e?.message || e}`);
    }
  }

  // 3. Fallback: Local disk write (only useful in non-serverless environments)
  try {
    ensureDataFilesExist();
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2), 'utf-8');
  } catch (e) {
    // Silently skip on serverless (Vercel) - filesystem is ephemeral
  }

  if (errors.length > 0) {
    console.error("Save products errors:", errors.join('; '));
  }

  if (!persistentSaveSucceeded) {
    throw new Error(
      `Failed to save products to any persistent database. ` +
      `Changes are NOT saved. Errors: ${errors.join('; ') || 'Unknown error - check Supabase anon key and DATABASE_URL'}`
    );
  }

  return true;
}

/**
 * Load site settings from Supabase or local JSON file,
 * with in-memory TTL caching and request coalescing.
 */
export async function loadSettingsAsync(forceRefresh: boolean = false): Promise<SiteSettings> {
  const now = Date.now();
  if (!forceRefresh && memorySettings !== null && (now - lastSettingsFetchTime < SETTINGS_CACHE_TTL_MS)) {
    return memorySettings;
  }

  if (activeSettingsPromise) {
    return activeSettingsPromise;
  }

  activeSettingsPromise = (async () => {
    try {
      // 1. Supabase REST API
      try {
        const supabaseSettings = await fetchSettingsFromSupabase();
        if (supabaseSettings) {
          memorySettings = supabaseSettings;
          lastSettingsFetchTime = Date.now();
          return supabaseSettings;
        }
      } catch (e) {
        console.warn("Supabase settings fetch warning:", e);
      }

      // 2. Prisma PostgreSQL
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
            lastSettingsFetchTime = Date.now();
            return memorySettings;
          }
        } catch (e) {
          console.warn("Prisma DB settings read notice:", e);
        }
      }

      // 3. Fallback: Local Filesystem JSON
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
            lastSettingsFetchTime = Date.now();
            return memorySettings;
          }
        }
      } catch (e) {
        console.warn("Filesystem settings read notice:", e);
      }

      if (memorySettings !== null) return memorySettings;

      memorySettings = { ...DEFAULT_SETTINGS };
      lastSettingsFetchTime = Date.now();
      try {
        fs.writeFileSync(SETTINGS_FILE, JSON.stringify(DEFAULT_SETTINGS, null, 2), 'utf-8');
      } catch {}
      return memorySettings;
    } finally {
      activeSettingsPromise = null;
    }
  })();

  return activeSettingsPromise;
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
    console.warn("Filesystem settings sync read notice:", e);
  }

  memorySettings = { ...DEFAULT_SETTINGS };
  try {
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(DEFAULT_SETTINGS, null, 2), 'utf-8');
  } catch {}
  return memorySettings;
}

/**
 * Save site settings to Supabase (REST API + Prisma) and local JSON file.
 * Throws error if no persistent backend succeeds.
 */
export async function saveSettingsPersistent(settings: SiteSettings): Promise<SiteSettings> {
  memorySettings = { ...settings };
  lastSettingsFetchTime = Date.now();
  let persistentSaveSucceeded = false;
  const errors: string[] = [];

  // 1. Primary: Supabase REST API
  try {
    const result = await saveSettingsToSupabase(settings);
    if (result) {
      persistentSaveSucceeded = true;
    } else {
      errors.push("Supabase settings save returned false");
    }
  } catch (e: any) {
    errors.push(`Supabase settings write error: ${e?.message || e}`);
  }

  // 2. Secondary: Prisma PostgreSQL
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
      persistentSaveSucceeded = true;
    } catch (e: any) {
      errors.push(`Prisma DB settings write error: ${e?.message || e}`);
    }
  }

  // 3. Fallback: Local disk (ephemeral on Vercel)
  try {
    ensureDataFilesExist();
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2), 'utf-8');
  } catch (e) {
    // Silently skip on serverless
  }

  if (errors.length > 0) {
    console.error("Save settings errors:", errors.join('; '));
  }

  if (!persistentSaveSucceeded) {
    throw new Error(
      `Failed to save settings to any persistent database. ` +
      `Errors: ${errors.join('; ') || 'Unknown error - check Supabase key and DATABASE_URL'}`
    );
  }

  return memorySettings;
}
