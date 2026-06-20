import { createClient } from '@supabase/supabase-js';

// Sử dụng biến môi trường thay vì hardcode để bảo mật hơn
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
