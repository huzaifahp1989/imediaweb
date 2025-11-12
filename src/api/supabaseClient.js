import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL || ''
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

function stub() {
  const err = () => new Error('Supabase not configured')
  return {
    auth: {
      async getSession() { return { data: { session: null } } },
      async getUser() { return { data: { user: null } } },
      async signInWithPassword() { throw err() },
      async signUp() { throw err() },
      async signOut() { return {} },
      onAuthStateChange(cb) { return { data: { subscription: { unsubscribe() {} } } } },
    },
    from() { return { select: async () => ({ data: [], error: err() }), upsert: async () => ({ error: err() }), insert: async () => ({ error: err() }) } },
  }
}

export const supabase = (url && anon) ? createClient(url, anon) : stub()
