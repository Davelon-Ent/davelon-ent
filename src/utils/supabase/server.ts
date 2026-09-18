import { createServerClient } from '@supabase/ssr'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Can happen if called from a Server Component; handled by middleware session refresh
          }
        },
      },
      global: {
        fetch: (url, options = {}) => {
          const headers = new Headers(options.headers)
          headers.set('Connection', 'close')
          return fetch(url, {
            ...options,
            cache: 'no-store',
            headers,
          })
        },
      },
    }
  )
}

// Service Role Client (Strictly server-side; for Super Admin user provisioning and storage)
export function createAdminClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not defined in .env.local')
  }

  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceRoleKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
      global: {
        fetch: (url, options = {}) => {
          const headers = new Headers(options.headers)
          headers.set('Connection', 'close')
          return fetch(url, {
            ...options,
            cache: 'no-store',
            headers,
          })
        },
      },
    }
  )
}
