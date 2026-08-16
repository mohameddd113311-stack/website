import { NextResponse } from 'next/server';
import { getProductsAsync, saveProductsAsync, Product } from '@/lib/products';
import { isAdminAuthenticated } from '@/lib/auth';

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
    const { products } = body;

    if (!Array.isArray(products) || products.length === 0) {
      return NextResponse.json(
        { success: false, error: 'بيانات التزامن غير صالحة' },
        { status: 400 }
      );
    }

    await saveProductsAsync(products as Product[]);
    const currentProducts = await getProductsAsync();

    return NextResponse.json({
      success: true,
      message: 'تم تزامن المنتجات بنجاح على السيرفر',
      products: currentProducts,
    });
  } catch (error) {
    console.error("Sync Products Error:", error);
    return NextResponse.json(
      { success: false, error: 'حدث خطأ أثناء مزامنة المنتجات' },
      { status: 500 }
    );
  }
}

