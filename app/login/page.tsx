'use client'

import { useActionState } from 'react'
import { loginAction } from '../action/auth'

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(loginAction, {
    success: false,
    message: ''
  })

  return (
    <div>
      <h1>Login</h1>
      <form action={formAction}>
        <input type="email" name="email" placeholder="Email" required />
        <input type="password" name="password" placeholder="Password" required />
        <button disabled={isPending}>
          {isPending ? 'Logging in...' : 'Login'}
        </button>
      </form>
      {state.message && <p>{state.message}</p>}
    </div>
  )
}