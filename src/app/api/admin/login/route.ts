import { NextResponse } from 'next/server';
import { verifyAdminCredentials, createAdminToken } from '@/lib/auth';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';

export async function POST(request: Request) {
  // Stricter rate limit for login to prevent brute force (5 attempts per minute per IP)
  const clientIp = getClientIp(request);
  const rateCheck = checkRateLimit(`admin_login:${clientIp}`, 5, 60 * 1000);

  if (!rateCheck.allowed) {
    return NextResponse.json(
      {
        success: false,
        error: `تم تجاوز الحد الأقصى لمحاولات تسجيل الدخول. يرجى الانتظار ${rateCheck.retryAfterSeconds} ثانية والمحاولة مجدداً.`,
      },
      {
        status: 429,
        headers: {
          'Retry-After': String(rateCheck.retryAfterSeconds),
          'X-RateLimit-Limit': String(rateCheck.limit),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(rateCheck.reset),
        },
      }
    );
  }

  try {
    const body = await request.json();
    const { username, password } = body;

    if (!verifyAdminCredentials(username, password)) {
      return NextResponse.json(
        { success: false, error: 'اسم المستخدم أو كلمة المرور غير صحيحة' },
        { status: 401 }
      );
    }

    const token = createAdminToken();
    const response = NextResponse.json({ success: true, message: 'تم تسجيل الدخول بنجاح' });

    response.cookies.set('admin_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error("Login API Error:", error);
    return NextResponse.json(
      { success: false, error: 'حدث خطأ في السيرفر أثناء تسجيل الدخول' },
      { status: 500 }
    );
  }
}
