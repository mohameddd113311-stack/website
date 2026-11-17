import { NextResponse } from 'next/server';
import { getSiteSettingsAsync, saveSiteSettingsAsync, invalidateSettingsCache } from '@/lib/settings';
import { isAdminAuthenticated, sanitizeInput } from '@/lib/auth';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  // Rate limit public settings requests (60 requests per minute per IP)
  const clientIp = getClientIp(request);
  const rateCheck = checkRateLimit(`settings_get:${clientIp}`, 60, 60 * 1000);

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

  const settings = await getSiteSettingsAsync();

  return NextResponse.json(
    { success: true, settings },
    {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
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
    const { whatsappNumber, facebookUrl, usdToEgpRate } = body;

    const updated = await saveSiteSettingsAsync({
      whatsappNumber: whatsappNumber ? sanitizeInput(whatsappNumber) : undefined,
      facebookUrl: facebookUrl ? sanitizeInput(facebookUrl) : undefined,
      usdToEgpRate: usdToEgpRate !== undefined && !isNaN(Number(usdToEgpRate)) ? Number(usdToEgpRate) : undefined,
    });

    invalidateSettingsCache();
    try {
      revalidatePath('/');
      revalidatePath('/admin');
    } catch {}

    return NextResponse.json({ success: true, settings: updated });
  } catch (error: any) {
    console.error("Save settings error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || 'حدث خطأ أثناء حفظ الإعدادات' },
      { status: 500 }
    );
  }
}
