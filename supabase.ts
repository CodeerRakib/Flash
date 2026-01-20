
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ujyrusqbwdcyfybyuszn.supabase.co';
const supabaseAnonKey = 'sb_publishable_Qf5cXlKcAxm70X57sRxrcw_vYCnGBKk';

// Safe creation of the client
let supabase: any = null;
try {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
} catch (e) {
  console.warn('Supabase initialization failed. Local mode active.');
}

let isProjectOffline = false;

/**
 * Saves a transcript entry. Gracefully handles "Failed to fetch" errors.
 */
export const saveTranscript = async (role: 'user' | 'flash', text: string): Promise<boolean> => {
  if (!supabase || isProjectOffline || !text.trim()) return false;
  
  try {
    const { error } = await supabase
      .from('flash_transcripts')
      .insert([{ 
        role, 
        content: text, 
        created_at: new Date().toISOString() 
      }]);
    
    if (error) return false;
    return true;
  } catch (err: any) {
    if (err.message?.includes('fetch')) {
      isProjectOffline = true; // Stop trying if the network is blocked
      console.warn('Supabase project unreachable. Reverting to local session.');
    }
    return false;
  }
};

/**
 * Retrieves conversation history. Handles network errors silently.
 */
export const fetchTranscripts = async () => {
  if (!supabase || isProjectOffline) return [];
  
  try {
    const { data, error } = await supabase
      .from('flash_transcripts')
      .select('role, content, created_at')
      .order('created_at', { ascending: true })
      .limit(50);
    
    if (error) return [];
    
    return (data || []).map((item: any) => ({
      role: item.role as 'user' | 'flash',
      text: item.content,
      timestamp: new Date(item.created_at)
    }));
  } catch (err: any) {
    if (err.message?.includes('fetch')) isProjectOffline = true;
    return [];
  }
};
