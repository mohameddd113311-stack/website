import { NextResponse } from 'next/server';
import { updateProduct, deleteProduct } from '@/lib/products';
import { isAdminAuthenticated, sanitizeInput } from '@/lib/auth';
import { deleteProductFromSupabase } from '@/lib/supabase';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const isAuth = await isAdminAuthenticated();
  if (!isAuth) {
    return NextResponse.json(
      { success: false, error: 'غير مصرح لك بالقيام بهذه العملية' },
      { status: 401 }
    );
  }

  try {
    const { id } = params;
    const body = await request.json();

    const updateData: any = {};
    if (body.name) updateData.name = sanitizeInput(body.name);
    if (body.category) updateData.category = sanitizeInput(body.category);
    if (body.price) updateData.price = sanitizeInput(body.price);
    if (body.originalPrice !== undefined) updateData.originalPrice = body.originalPrice ? sanitizeInput(body.originalPrice) : undefined;
    if (body.stockQuantity !== undefined) updateData.stockQuantity = Number(body.stockQuantity);
    if (body.billingPeriod) updateData.billingPeriod = sanitizeInput(body.billingPeriod);
    if (body.description) updateData.description = sanitizeInput(body.description);
    if (body.badge !== undefined) updateData.badge = body.badge ? sanitizeInput(body.badge) : undefined;
    if (body.popular !== undefined) updateData.popular = Boolean(body.popular);
    if (body.iconType) updateData.iconType = body.iconType;
    if (body.imageUrl !== undefined) updateData.imageUrl = body.imageUrl ? sanitizeInput(body.imageUrl) : undefined;
    if (body.whatsappMsg !== undefined) updateData.whatsappMsg = body.whatsappMsg ? sanitizeInput(body.whatsappMsg) : undefined;
    if (body.active !== undefined) updateData.active = Boolean(body.active);

    if (body.features) {
      updateData.features = Array.isArray(body.features)
        ? body.features.map((f: string) => sanitizeInput(f)).filter(Boolean)
        : typeof body.features === 'string'
        ? body.features.split('\n').map((f: string) => sanitizeInput(f)).filter(Boolean)
        : [];
    }

    const updated = updateProduct(id, updateData);
    if (!updated) {
      return NextResponse.json(
        { success: false, error: 'لم يتم العثور على المنتج المطلوب' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, product: updated });
  } catch (error) {
    console.error("Update Product Error:", error);
    return NextResponse.json(
      { success: false, error: 'حدث خطأ أثناء تعديل المنتج' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const isAuth = await isAdminAuthenticated();
  if (!isAuth) {
    return NextResponse.json(
      { success: false, error: 'غير مصرح لك بالقيام بهذه العملية' },
      { status: 401 }
    );
  }

  const { id } = params;
  await deleteProductFromSupabase(id);
  const deleted = deleteProduct(id);

  if (!deleted) {
    return NextResponse.json(
      { success: false, error: 'لم يتم العثور على المنتج لحذفه' },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true, message: 'تم حذف المنتج بنجاح' });
}

