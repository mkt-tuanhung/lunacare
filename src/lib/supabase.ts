import { createClient } from '@supabase/supabase-js';

// Hardcode trực tiếp để Vercel không bị lỗi khi build (Anon key được phép công khai ở front-end)
const supabaseUrl = 'https://lvkcvgsxqtfdppeqixez.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx2a2N2Z3N4cXRmZHBwZXFpeGV6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE4NjMyNzYsImV4cCI6MjA5NzQzOTI3Nn0.ALTBb77mERWrZUlh8TVom0MGMm1e5WrD-6fmJhIFADE';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
