import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

const ADMIN_EMAIL = 'harshrawat.dev@gmail.com';

export async function isAdmin(): Promise<boolean> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  return session?.user?.email === ADMIN_EMAIL;
}

export async function requireAdmin(): Promise<{ isAuthorized: true; email: string } | { isAuthorized: false; response: NextResponse }> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.email || session.user.email !== ADMIN_EMAIL) {
    return {
      isAuthorized: false,
      response: NextResponse.json({ error: 'Unauthorized' }, { status: 403 }),
    };
  }

  return { isAuthorized: true, email: session.user.email };
}

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
