import { supabaseAdmin as sb } from './supabase.js';

export async function appendMessage(sessionId, role, content) {
  const { error } = await sb
    .from('chat_messages')
    .insert({ session_id: sessionId, role, content });
  if (error) {
    console.error('appendMessage error:', error);
  }
}

export async function getHistory(sessionId, limit = 30) {
  const { data, error } = await sb
    .from('chat_messages')
    .select('role, content, created_at')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data || []).reverse();
}
