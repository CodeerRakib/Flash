
import { createClient } from '@supabase/supabase-js';

/**
 * DATABASE SCHEMA (Run in Supabase SQL Editor):
 * 
 * CREATE TABLE public.flash_transcripts (
 *     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
 *     role TEXT NOT NULL CHECK (role IN ('user', 'flash')),
 *     content TEXT NOT NULL,
 *     created_at TIMESTAMPTZ DEFAULT NOW()
 * );
 * ALTER TABLE public.flash_transcripts ENABLE ROW LEVEL SECURITY;
 * CREATE POLICY "Public Access" ON public.flash_transcripts FOR ALL USING (true) WITH CHECK (true);
 */

const supabaseUrl = 'https://ujyrusqbwdcyfybyuszn.supabase.co';
const supabaseAnonKey = 'sb_publishable_Qf5cXlKcAxm70X57sRxrcw_vYCnGBKk';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

let isTableMissing = false;

/**
 * Saves a transcript entry to the cloud database.
 */
export const saveTranscript = async (role: 'user' | 'flash', text: string): Promise<boolean> => {
  if (!supabase || isTableMissing || !text.trim()) return false;
  
  try {
    const { error } = await supabase
      .from('flash_transcripts')
      .insert([{ 
        role, 
        content: text, 
        created_at: new Date().toISOString() 
      }]);
    
    if (error) {
      if (error.message.includes('Could not find the table')) {
        isTableMissing = true;
        console.error('FLASH_DB_ERROR: Table "flash_transcripts" is missing. Use the provided SQL schema to create it.');
        return false;
      }
      console.error('Supabase Error:', error.message);
      return false;
    }
    return true;
  } catch (err: any) {
    return false;
  }
};

/**
 * Retrieves conversation history from the cloud database.
 */
export const fetchTranscripts = async () => {
  if (!supabase || isTableMissing) return [];
  
  try {
    const { data, error } = await supabase
      .from('flash_transcripts')
      .select('role, content, created_at')
      .order('created_at', { ascending: true })
      .limit(100);
    
    if (error) {
      if (error.message.includes('Could not find the table')) {
        isTableMissing = true;
        console.warn('FLASH_DB_NOTICE: Operating in local-only mode until table is created.');
      }
      return [];
    }
    
    return (data || []).map((item: any) => ({
      role: item.role as 'user' | 'flash',
      text: item.content,
      timestamp: new Date(item.created_at)
    }));
  } catch (err: any) {
    return [];
  }
};
