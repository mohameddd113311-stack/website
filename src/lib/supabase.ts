import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Product } from './products';
import { SiteSettings } from './settings';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

export const supabase: SupabaseClient | null =
  supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

export async function fetchProductsFromSupabase(): Promise<Product[] | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data) {
      console.warn("Supabase products fetch warning:", error);
      return null;
    }

    return data.map((p) => ({
      id: p.id,
      name: p.name,
      category: p.category || 'ذكاء اصطناعي',
      price: String(p.price),
      originalPrice: p.original_price ? String(p.original_price) : undefined,
      stockQuantity: p.stock_quantity ?? 999,
      billingPeriod: p.billing_period || 'شهرياً',
      description: p.description,
      features: Array.isArray(p.features) ? p.features : typeof p.features === 'string' ? JSON.parse(p.features) : [],
      badge: p.badge || undefined,
      popular: Boolean(p.popular),
      imageUrl: p.image_url || undefined,
      iconType: p.icon_type || 'custom',
      whatsappMsg: p.whatsapp_msg || undefined,
      active: p.active !== false,
      createdAt: p.created_at || new Date().toISOString(),
      updatedAt: p.updated_at || new Date().toISOString(),
    }));
  } catch (e) {
    console.warn("Supabase products fetch exception:", e);
    return null;
  }
}

export async function saveProductToSupabase(product: Product): Promise<boolean> {
  if (!supabase) return false;
  try {
    const payload = {
      id: product.id,
      name: product.name,
      category: product.category,
      price: product.price,
      original_price: product.originalPrice || null,
      stock_quantity: (product as any).stockQuantity ?? 999,
      billing_period: product.billingPeriod,
      description: product.description,
      features: JSON.stringify(product.features || []),
      badge: product.badge || null,
      popular: product.popular || false,
      image_url: product.imageUrl || null,
      icon_type: product.iconType || 'custom',
      whatsapp_msg: product.whatsappMsg || null,
      active: product.active !== false,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase.from('products').upsert(payload, { onConflict: 'id' });
    if (error) {
      console.warn("Supabase product upsert error:", error);
      return false;
    }
    return true;
  } catch (e) {
    console.warn("Supabase product upsert exception:", e);
    return false;
  }
}

export async function deleteProductFromSupabase(id: string): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) {
      console.warn("Supabase product delete error:", error);
      return false;
    }
    return true;
  } catch (e) {
    console.warn("Supabase product delete exception:", e);
    return false;
  }
}

export async function fetchSettingsFromSupabase(): Promise<SiteSettings | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('site_settings')
      .select('*')
      .eq('id', 'default')
      .single();

    if (error || !data) return null;

    return {
      whatsappNumber: data.whatsapp_number || '201021510826',
      facebookUrl: data.facebook_url || 'https://www.facebook.com/share/1NbRrA56uz/',
      usdToEgpRate: data.usd_to_egp_rate ? Number(data.usd_to_egp_rate) : 50,
      updatedAt: data.updated_at || new Date().toISOString(),
    };
  } catch (e) {
    return null;
  }
}

export async function saveSettingsToSupabase(settings: SiteSettings): Promise<boolean> {
  if (!supabase) return false;
  try {
    const payload = {
      id: 'default',
      whatsapp_number: settings.whatsappNumber,
      facebook_url: settings.facebookUrl,
      usd_to_egp_rate: settings.usdToEgpRate || 50,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase.from('site_settings').upsert(payload, { onConflict: 'id' });
    if (error) return false;
    return true;
  } catch (e) {
    return false;
  }
}
