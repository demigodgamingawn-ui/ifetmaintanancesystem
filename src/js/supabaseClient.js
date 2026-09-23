// src/js/supabaseClient.js - Supabase Client & REST Connector for IFET Maintenance System

const envUrl = typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_SUPABASE_URL;
const envAnonKey = typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_SUPABASE_ANON_KEY;

export const SUPABASE_CONFIG = {
  url: envUrl || 'https://prondjywyccrardfrufa.supabase.co',
  anonKey: envAnonKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InByb25kanl3eWNjcmFyZGZydWZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAxNjYzMzcsImV4cCI6MjEwNTc0MjMzN30.LXqE05hyJnWkoH5XyFTnONICA6uhya8lVe_4VOlXMqk',
};

// Initialize Supabase JS client if library is available on window
let supabaseInstance = null;
if (typeof window !== 'undefined' && window.supabase && typeof window.supabase.createClient === 'function') {
  try {
    supabaseInstance = window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
    console.log('[Supabase] Initialized official JS Client SDK.');
  } catch (err) {
    console.warn('[Supabase] Could not initialize window.supabase client:', err);
  }
}

export const supabase = supabaseInstance;

/**
 * Direct REST helper to query Supabase PostgREST tables from client or backend
 */
export async function supabaseRestFetch(endpoint, options = {}) {
  const url = `${SUPABASE_CONFIG.url}/rest/v1/${endpoint}`;
  const headers = {
    'apikey': SUPABASE_CONFIG.anonKey,
    'Authorization': `Bearer ${SUPABASE_CONFIG.anonKey}`,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation',
    ...(options.headers || {})
  };

  try {
    const res = await fetch(url, {
      ...options,
      headers
    });
    if (!res.ok) {
      const errorText = await res.text();
      return { ok: false, status: res.status, error: errorText };
    }
    const data = await res.json();
    return { ok: true, data };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

/**
 * Health check to verify Supabase project connection
 */
export async function checkSupabaseConnection() {
  try {
    const res = await fetch(`${SUPABASE_CONFIG.url}/rest/v1/`, {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_CONFIG.anonKey,
        'Authorization': `Bearer ${SUPABASE_CONFIG.anonKey}`
      }
    });
    return {
      connected: res.ok,
      status: res.status,
      url: SUPABASE_CONFIG.url
    };
  } catch (err) {
    return {
      connected: false,
      error: err.message,
      url: SUPABASE_CONFIG.url
    };
  }
}
