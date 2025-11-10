'use client'

import { useActionState } from 'react'
import { signupAction } from '../action/auth'

export default function SignupPage() {
  const [state, formAction, isPending] = useActionState(signupAction, {
    success: false,
    message: ''
  })

  return (
    <div>
      <h1>Signup</h1>
      <form action={formAction}>
        <input type="email" name="email" placeholder="Email" required />
        <input type="password" name="password" placeholder="Password" required />
        <button disabled={isPending}>
          {isPending ? 'Creating...' : 'Sign Up'}
        </button>
      </form>
      {state.message && <p>{state.message}</p>}
    </div>
  )
}
