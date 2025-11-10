import ServerAuthRedirect from '@/components/ServerAuthRedirect'
import SignupForm from './SignupForm'

export default function SignupPage() {
  return (
    <ServerAuthRedirect redirectTo="/dashboard">
      <SignupForm />
    </ServerAuthRedirect>
  )
}