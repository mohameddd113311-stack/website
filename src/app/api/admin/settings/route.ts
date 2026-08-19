import { NextResponse } from 'next/server';
import { getSiteSettingsAsync, saveSiteSettingsAsync } from '@/lib/settings';
import { saveSettingsToSupabase } from '@/lib/supabase';
import { isAdminAuthenticated, sanitizeInput } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  const settings = await getSiteSettingsAsync();
  return NextResponse.json({ success: true, settings });
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
    const { whatsappNumber, facebookUrl, usdToEgpRate } = body;

    const updated = await saveSiteSettingsAsync({
      whatsappNumber: whatsappNumber ? sanitizeInput(whatsappNumber) : undefined,
      facebookUrl: facebookUrl ? sanitizeInput(facebookUrl) : undefined,
      usdToEgpRate: usdToEgpRate !== undefined && !isNaN(Number(usdToEgpRate)) ? Number(usdToEgpRate) : undefined,
    });

    // Direct guarantee write to Supabase
    await saveSettingsToSupabase(updated);

    return NextResponse.json({ success: true, settings: updated });
  } catch (error: any) {
    console.error("Save settings error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || 'حدث خطأ أثناء حفظ الإعدادات' },
      { status: 500 }
    );
  }
}


