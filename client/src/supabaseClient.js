// src/supabaseClient.js
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

const STORAGE_MODE_KEY = 'nl_auth_storage_mode'      // preferência (local/session)
const SUPABASE_STORAGE_KEY = 'sb-nanolink-auth'      // chave onde o supabase guarda a sessão

export let supabase = null

function getStorageMode() {
  const raw = localStorage.getItem(STORAGE_MODE_KEY)
  return raw === 'session' ? 'session' : 'local'
}

function resolveStorage(mode) {
  const m = mode || getStorageMode()
  return m === 'session' ? window.sessionStorage : window.localStorage
}

// limpa tokens dos 2 storages (evita “sessão fantasma” ao alternar rememberMe)
export function clearAuthArtifacts() {
  try { window.localStorage.removeItem(SUPABASE_STORAGE_KEY) } catch {}
  try { window.sessionStorage.removeItem(SUPABASE_STORAGE_KEY) } catch {}
}

export function initSupabase(mode) {
  if (mode) localStorage.setItem(STORAGE_MODE_KEY, mode)

  const storage = resolveStorage(mode)

  // Recria o client apontando pro storage desejado
  supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storage,
      storageKey: SUPABASE_STORAGE_KEY,
    },
  })

  return supabase
}

export function getSupabase() {
  return supabase || initSupabase()
}

export function getCurrentStorageMode() {
  return getStorageMode()
}


