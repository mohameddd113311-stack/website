import { NextResponse } from 'next/server';
import { getProductsAsync, saveProductsAsync, Product } from '@/lib/products';
import { getSiteSettingsAsync, saveSiteSettingsAsync, SiteSettings } from '@/lib/settings';
import { isAdminAuthenticated } from '@/lib/auth';

export async function GET() {
  const isAuth = await isAdminAuthenticated();
  if (!isAuth) {
    return NextResponse.json(
      { success: false, error: 'غير مصرح لك بالقيام بهذه العملية' },
      { status: 401 }
    );
  }

  const products = await getProductsAsync();
  const settings = await getSiteSettingsAsync();

  return NextResponse.json({
    success: true,
    backupVersion: '1.0',
    exportedAt: new Date().toISOString(),
    products,
    settings,
  });
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
    const { products, settings } = body;

    let restoredProductsCount = 0;
    if (Array.isArray(products) && products.length > 0) {
      await saveProductsAsync(products as Product[]);
      restoredProductsCount = products.length;
    }

    if (settings && typeof settings === 'object') {
      await saveSiteSettingsAsync(settings as SiteSettings);
    }

    const currentProducts = await getProductsAsync();
    const currentSettings = await getSiteSettingsAsync();

    return NextResponse.json({
      success: true,
      message: `تم استعادة النسخة الاحتياطية بنجاح (${restoredProductsCount} منتج)`,
      products: currentProducts,
      settings: currentSettings,
    });
  } catch (error) {
    console.error("Restore Backup Error:", error);
    return NextResponse.json(
      { success: false, error: 'حدث خطأ أثناء استعادة النسخة الاحتياطية' },
      { status: 500 }
    );
  }
}

