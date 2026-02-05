import { createClient } from './server';
import { User } from '@/types/database';

/**
 * Get the currently authenticated user from the server-side context.
 * Returns the full user profile from the users table, including role.
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    const supabase = await createClient();

    // Get the authenticated user from the session
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();

    if (authError || !authUser) {
      return null;
    }

    // Fetch the full user profile from the users table
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authUser.id)
      .single();

    if (userError || !user) {
      console.error('Error fetching user profile:', userError);
      return null;
    }

    return user as User;
  } catch (error) {
    console.error('Error in getCurrentUser:', error);
    return null;
  }
}

/**
 * Check if there's an authenticated user (lighter check, no DB query)
 */
export async function isAuthenticated(): Promise<boolean> {
  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    return !error && !!user;
  } catch {
    return false;
  }
}
