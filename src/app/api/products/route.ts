import { NextResponse } from 'next/server';
import { getProducts, addProduct } from '@/lib/products';
import { isAdminAuthenticated, sanitizeInput } from '@/lib/auth';

export async function GET() {
  const products = getProducts();
  return NextResponse.json({ success: true, products });
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
    const { name, category, price, originalPrice, billingPeriod, description, features, badge, popular, iconType, imageUrl, whatsappMsg } = body;

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

    const newProduct = addProduct({
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
      imageUrl: imageUrl ? sanitizeInput(imageUrl) : undefined,
      whatsappMsg: whatsappMsg ? sanitizeInput(whatsappMsg) : undefined,
      active: true
    });

    return NextResponse.json({ success: true, product: newProduct });
  } catch (error) {
    console.error("Add Product Error:", error);
    return NextResponse.json(
      { success: false, error: 'حدث خطأ أثناء إضافة المنتج' },
      { status: 500 }
    );
  }
}
