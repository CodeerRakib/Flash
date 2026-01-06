
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ujyrusqbwdcyfybyuszn.supabase.co';
const supabaseAnonKey = 'sb_publishable_Qf5cXlKcAxm70X57sRxrcw_vYCnGBKk';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

let isTableMissing = false;

/**
 * Saves a transcript entry to the cloud database.
 */
export const saveTranscript = async (role: 'user' | 'flash', text: string): Promise<boolean> => {
  if (!supabase || isTableMissing) return false;
  
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
        console.error('FLASH_DB_ERROR: Table "flash_transcripts" is missing. Please run the setup SQL in your Supabase Editor to enable cloud memory.');
        return false;
      }
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
      .select('*')
      .order('created_at', { ascending: true })
      .limit(50);
    
    if (error) {
      if (error.message.includes('Could not find the table')) {
        isTableMissing = true;
        console.warn('FLASH_DB_NOTICE: Memory table not found. Operating in local mode.');
      }
      return [];
    }
    
    return (data || []).map((item: any) => ({
      role: item.role,
      text: item.content,
      timestamp: new Date(item.created_at)
    }));
  } catch (err: any) {
    return [];
  }
};
