import { supabase } from '@/lib/supabaseClient'

export default async function HomePage() {
  const { data } = await supabase.auth.getSession()
  const session = data.session

  return (
    <div>
      <h1>Welcome</h1>
      {session ? (
        <p>Logged in as: {session.user.email}</p>
      ) : (
        <p>You are not logged in.</p>
      )}
    </div>
  )
}
