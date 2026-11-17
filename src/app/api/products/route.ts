import { NextResponse } from 'next/server';
import { addProductAsync, getProductsAsync, invalidateProductsCache } from '@/lib/products';
import { isAdminAuthenticated, sanitizeInput, sanitizeImageUrl } from '@/lib/auth';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  // 1. Check Rate Limiting (60 requests per minute per IP for public reads)
  const clientIp = getClientIp(request);
  const rateCheck = checkRateLimit(`products_get:${clientIp}`, 60, 60 * 1000);

  if (!rateCheck.allowed) {
    return NextResponse.json(
      { success: false, error: 'تم تجاوز الحد المسموح من الطلبات. يرجى الانتظار قليلاً.' },
      {
        status: 429,
        headers: {
          'Retry-After': String(rateCheck.retryAfterSeconds),
          'X-RateLimit-Limit': String(rateCheck.limit),
          'X-RateLimit-Remaining': String(rateCheck.remaining),
          'X-RateLimit-Reset': String(rateCheck.reset),
        },
      }
    );
  }

  // 2. Load products (served from in-memory TTL cache with coalescing if fresh)
  const products = await getProductsAsync();

  return NextResponse.json(
    { success: true, products },
    {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
        'X-RateLimit-Limit': String(rateCheck.limit),
        'X-RateLimit-Remaining': String(rateCheck.remaining),
      },
    }
  );
}

export async function POST(request: Request) {
  const isAuth = await isAdminAuthenticated();
  if (!isAuth) {
    return NextResponse.json(
      { success: false, error: 'غير مصرح لك بالقيام بهذه العملية' },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const {
      name,
      category,
      price,
      originalPrice,
      billingPeriod,
      description,
      features,
      badge,
      popular,
      iconType,
      imageUrl,
      whatsappMsg,
    } = body;

    if (!name || !price || !description) {
      return NextResponse.json(
        { success: false, error: 'يرجى إدخال الحقول الأساسية: الاسم، السعر، والوصف' },
        { status: 400 }
      );
    }

    const cleanFeatures = Array.isArray(features)
      ? features.map(f => sanitizeInput(f)).filter(Boolean)
      : typeof features === 'string'
      ? features.split('\n').map(f => sanitizeInput(f)).filter(Boolean)
      : [];

    const newProduct = await addProductAsync({
      name: sanitizeInput(name),
      category: sanitizeInput(category || 'ذكاء اصطناعي'),
      price: sanitizeInput(price),
      originalPrice: originalPrice ? sanitizeInput(originalPrice) : undefined,
      billingPeriod: sanitizeInput(billingPeriod || 'شهرياً'),
      description: sanitizeInput(description),
      features: cleanFeatures,
      badge: badge ? sanitizeInput(badge) : undefined,
      popular: Boolean(popular),
      iconType: ['gemini', 'chatgpt', 'capcut', 'custom'].includes(iconType) ? iconType : 'custom',
      imageUrl: imageUrl ? sanitizeImageUrl(imageUrl) : undefined,
      whatsappMsg: whatsappMsg ? sanitizeInput(whatsappMsg) : undefined,
      active: true,
    });

    // Invalidate caches and trigger Next.js page revalidations
    invalidateProductsCache();
    try {
      revalidatePath('/');
      revalidatePath('/admin');
    } catch {}

    return NextResponse.json({ success: true, product: newProduct });
  } catch (error: any) {
    console.error("Add Product Error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || 'حدث خطأ أثناء إضافة المنتج' },
      { status: 500 }
    );
  }
}
