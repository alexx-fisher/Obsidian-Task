import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://aencaluwvjvqftxyyzns.supabase.co';
const supabaseKey = 'sb_publishable_7cdytnTosT-Ym1q93n_jQw_UaBL8dWr';

export const supabase = createClient(supabaseUrl, supabaseKey);
