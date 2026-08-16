import { NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/auth';
import { uploadImageToSupabaseStorage } from '@/lib/supabase';

export async function POST(request: Request) {
  const isAuth = await isAdminAuthenticated();
  if (!isAuth) {
    return NextResponse.json(
      { success: false, error: 'غير مصرح لك بالقيام بهذه العملية' },
      { status: 401 }
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'لم يتم إرفاق ملف صورة' },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const mimeType = file.type || 'image/jpeg';
    const fileName = file.name || 'product_image.jpg';

    // 1. Try uploading to Supabase Storage Bucket
    const cloudUrl = await uploadImageToSupabaseStorage(buffer, fileName, mimeType);

    if (cloudUrl) {
      return NextResponse.json({ success: true, url: cloudUrl });
    }

    return NextResponse.json(
      { success: false, error: 'تعذر الرفع إلى Supabase Storage. يرجى التأكد من إنشاء الباكت (product-images)' },
      { status: 500 }
    );
  } catch (error) {
    console.error("Upload Route Error:", error);
    return NextResponse.json(
      { success: false, error: 'حدث خطأ أثناء معالجة رفع الصورة' },
      { status: 500 }
    );
  }
}
