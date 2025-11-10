import { createClient } from '@supabase/supabase-js'

// This client uses the service role key and should only be used on the server
// It bypasses RLS and should never be used on the client
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}