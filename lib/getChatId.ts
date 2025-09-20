import { cookies } from 'next/headers';
import { cookieName, unsign } from '@/lib/session';

export async function getChatIdFromCookie(): Promise<number | null> {
  const cookieStore = await cookies();
  const c = cookieStore.get(cookieName)?.value;
  if (!c) return null;
  const v = unsign(c);
  return v ? Number(v) : null;
}
