import { createClient } from '@supabase/supabase-js';

// Sử dụng biến môi trường, HOẶC fallback về key cứng để Vercel không bị lỗi build (do .env.local không được push lên git)
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://lvkcvgsxqtfdppeqixez.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx2a2N2Z3N4cXRmZHBwZXFpeGV6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE4NjMyNzYsImV4cCI6MjA5NzQzOTI3Nn0.ALTBb77mERWrZUlh8TVom0MGMm1e5WrD-6fmJhIFADE';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
