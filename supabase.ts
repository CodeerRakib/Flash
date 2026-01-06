import { createClient } from '@supabase/supabase-js';

/**
 * Flash System Cloud Memory Configuration
 * Uses provided credentials to ensure persistence is active.
 */
const supabaseUrl = process.env.SUPABASE_URL || 'https://ujyrusqbwdcyfybyuszn.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'sb_publishable_Qf5cXlKcAxm70X57sRxrcw_vYCnGBKk';

// Robust initialization check: prevent "supabaseUrl is required" error by verifying URL presence and format.
export const supabase = (supabaseUrl && supabaseUrl.startsWith('http')) 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

/**
 * Saves a transcript entry to the cloud database.
 */
export const saveTranscript = async (role: 'user' | 'flash', text: string) => {
  if (!supabase) return;
  
  try {
    const { error } = await supabase
      .from('flash_transcripts')
      .insert([{ 
        role, 
        content: text, 
        created_at: new Date().toISOString() 
      }]);
    
    if (error) console.error('Database Sync Error:', error);
  } catch (err) {
    console.error('Supabase save failed:', err);
  }
};

/**
 * Retrieves conversation history from the cloud database.
 */
export const fetchTranscripts = async () => {
  if (!supabase) return [];
  
  try {
    const { data, error } = await supabase
      .from('flash_transcripts')
      .select('*')
      .order('created_at', { ascending: true })
      .limit(50);
    
    if (error) {
      console.error('Database Fetch Error:', error);
      return [];
    }
    
    return (data || []).map((item: any) => ({
      role: item.role,
      text: item.content,
      timestamp: new Date(item.created_at)
    }));
  } catch (err) {
    console.error('Supabase fetch failed:', err);
    return [];
  }
};