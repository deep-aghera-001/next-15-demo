import ServerAuthRedirect from '@/components/ServerAuthRedirect'
import SignupForm from '@/components/forms/SignupForm'

export default function SignupPage() {
  return (
    <ServerAuthRedirect redirectTo="/dashboard">
      <SignupForm />
    </ServerAuthRedirect>
  )
}