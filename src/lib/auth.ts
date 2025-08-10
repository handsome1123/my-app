'use server';

import { supabase } from './supabase';
import { cookies } from 'next/headers';

export const getUserWithRole = async () => {
  const cookieStore = await cookies();
  const access_token = cookieStore.get('sb-access-token')?.value;

  if (!access_token) return null;

  const {
    data: { user },
  } = await supabase.auth.getUser(access_token);

  if (!user) return null;

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  return {
    ...user,
    role: profile?.role || 'buyer',
  };
};
