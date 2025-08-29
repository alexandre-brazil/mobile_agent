import { supabaseAdmin as sb } from './supabase.js';

export async function ensureSession(sessionId) {
  const { error } = await sb
    .from('chat_sessions')
    .insert({ session_id: sessionId })
    .onConflict('session_id')
    .ignore();
  if (error) {
    console.error('ensureSession error:', error);
    throw error;
  }
}

export async function getSession(sessionId) {
  const { data, error } = await sb
    .from('chat_sessions')
    .select('session_id, mode, operator_id, taken_at, human_timeout_minutes')
    .eq('session_id', sessionId)
    .maybeSingle();
  if (error) {
    console.error('getSession error:', error);
    throw error;
  }
  return data || null;
}

export async function setMode(sessionId, mode, operatorId = null) {
  const payload = {
    mode,
    operator_id: operatorId,
    taken_at: mode === 'human' ? new Date().toISOString() : null,
  };
  const { error } = await sb
    .from('chat_sessions')
    .update(payload)
    .eq('session_id', sessionId);
  if (error) {
    console.error('setMode error:', error);
    throw error;
  }
}
