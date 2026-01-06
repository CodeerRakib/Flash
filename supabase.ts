
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

// Only initialize if both URL and Key are provided to prevent "supabaseUrl is required" error
export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

export const saveTranscript = async (role: 'user' | 'flash', text: string) => {
  if (!supabase) return;
  
  try {
    const { error } = await supabase
      .from('flash_transcripts')
      .insert([{ role, content: text, created_at: new Date().toISOString() }]);
    
    if (error) console.error('Database Sync Error:', error);
  } catch (err) {
    console.error('Supabase save failed:', err);
  }
};

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
