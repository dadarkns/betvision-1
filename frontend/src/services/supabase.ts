import "react-native-url-polyfill/auto";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { backendConfig } from "@/config/backend";
import { createClient } from "@supabase/supabase-js";
import { Platform } from "react-native";

export const hasSupabaseConfig = backendConfig.supabase.configured;

export const supabase = createClient(
  hasSupabaseConfig ? backendConfig.supabase.url : "https://placeholder.supabase.co",
  hasSupabaseConfig ? backendConfig.supabase.anonKey : "placeholder-anon-key",
  {
    auth: {
      storage: Platform.OS === "web" ? undefined : AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false
    }
  }
);
