import { supabase } from './supabaseClient';

export async function signUp(email, password, name, role) {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) return { error };

  const { error: insertError } = await supabase.from('users').insert({
    id: data.user.id,
    name,
    email,
    role,
  });
  return { data, error: insertError };
}

export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  return { data, error };
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  return { error };
}

export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase.from('users').select('*').eq('id', user.id).single();
  return data;
}