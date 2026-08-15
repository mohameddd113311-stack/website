import { NextResponse } from 'next/server';
import { getSiteSettingsAsync, saveSiteSettings } from '@/lib/settings';
import { isAdminAuthenticated, sanitizeInput } from '@/lib/auth';

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

    const updated = saveSiteSettings({
      whatsappNumber: whatsappNumber ? sanitizeInput(whatsappNumber) : undefined,
      facebookUrl: facebookUrl ? sanitizeInput(facebookUrl) : undefined,
      usdToEgpRate: usdToEgpRate !== undefined && !isNaN(Number(usdToEgpRate)) ? Number(usdToEgpRate) : undefined,
    });

    return NextResponse.json({ success: true, settings: updated });
  } catch (error) {
    console.error("Save settings error:", error);
    return NextResponse.json(
      { success: false, error: 'حدث خطأ أثناء حفظ الإعدادات' },
      { status: 500 }
    );
  }
}

