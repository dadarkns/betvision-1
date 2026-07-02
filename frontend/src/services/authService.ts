import { hasSupabaseConfig, supabase } from "@/services/supabase";

export async function signInWithEmail(email: string, password: string) {
  if (!hasSupabaseConfig) {
    throw new Error("Configure o Supabase no arquivo .env para ativar login real.");
  }

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    throw error;
  }
  return data;
}

export async function signUpWithEmail(email: string, password: string) {
  if (!hasSupabaseConfig) {
    throw new Error("Configure o Supabase no arquivo .env para criar contas reais.");
  }

  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) {
    throw error;
  }
  return data;
}

export async function signOut() {
  if (!hasSupabaseConfig) {
    return;
  }

  const { error } = await supabase.auth.signOut();
  if (error) {
    throw error;
  }
}
