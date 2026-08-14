import crypto from 'crypto';
import { cookies } from 'next/headers';

const COOKIE_NAME = 'admin_session';
const SECRET = process.env.JWT_SECRET || 'ai-studio-super-secret-key-2026';

export function verifyAdminCredentials(username?: string, password?: string): boolean {
  const expectedUsername = process.env.ADMIN_USERNAME || 'admin';
  const expectedPassword = process.env.ADMIN_PASSWORD || 'aistudio2026';

  if (!username || !password) return false;

  const userMatch = crypto.timingSafeEqual(
    Buffer.from(username),
    Buffer.from(expectedUsername)
  );

  const passMatch = crypto.timingSafeEqual(
    Buffer.from(password),
    Buffer.from(expectedPassword)
  );

  return userMatch && passMatch;
}

export function createAdminToken(): string {
  const payload = {
    role: 'admin',
    issuedAt: Date.now(),
  };
  const str = JSON.stringify(payload);
  const base64 = Buffer.from(str).toString('base64url');
  const signature = crypto.createHmac('sha256', SECRET).update(base64).digest('base64url');
  return `${base64}.${signature}`;
}

export function verifyAdminToken(token?: string): boolean {
  if (!token) return false;
  const parts = token.split('.');
  if (parts.length !== 2) return false;

  const [base64, signature] = parts;
  const expectedSig = crypto.createHmac('sha256', SECRET).update(base64).digest('base64url');

  if (signature !== expectedSig) return false;

  try {
    const payloadStr = Buffer.from(base64, 'base64url').toString('utf-8');
    const payload = JSON.parse(payloadStr);
    // Token valid for 7 days
    const isValid = Date.now() - payload.issuedAt < 7 * 24 * 60 * 60 * 1000;
    return payload.role === 'admin' && isValid;
  } catch {
    return false;
  }
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  return verifyAdminToken(token);
}

export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '')
    .substring(0, 1000);
}
