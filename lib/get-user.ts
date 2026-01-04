import { cookies } from 'next/headers';
import { auth } from './auth';

export async function getAuthenticatedUser() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('better-auth.session_token');

  if (!sessionToken) {
    return null;
  }

  try {
    const session = await auth.api.getSession({
      headers: {
        cookie: `better-auth.session_token=${sessionToken.value}`,
      },
    });

    return session?.user || null;
  } catch (error) {
    console.error('Error getting user:', error);
    return null;
  }
}
