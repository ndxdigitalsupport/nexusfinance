import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE || '';

if (!supabaseUrl) throw new Error('SUPABASE_URL not set in .env');

export const db = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false },
});
