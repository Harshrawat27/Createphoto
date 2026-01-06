import { headers } from 'next/headers';
import { auth } from './auth';

export async function getAuthenticatedUser() {
  try {
    const headersList = await headers();

    const session = await auth.api.getSession({
      headers: headersList,
    });

    return session?.user || null;
  } catch (error) {
    console.error('Error getting user:', error);
    return null;
  }
}
