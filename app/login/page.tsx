import ServerAuthRedirect from '@/components/ServerAuthRedirect'
import LoginForm from './LoginForm'

export default function LoginPage() {
  return (
    <ServerAuthRedirect redirectTo="/dashboard">
      <LoginForm />
    </ServerAuthRedirect>
  )
}