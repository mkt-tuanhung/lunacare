import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';

// Thay thế bằng Project URL của bạn
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'YOUR_SUPABASE_URL';

// Thay thế bằng API Key (anon public) của bạn
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
