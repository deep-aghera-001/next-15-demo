import LoginForm from '@/components/forms/LoginForm'
import { redirectIfAuthenticated } from '@/utils/auth-redirect'

export default async function LoginPage() {
  await redirectIfAuthenticated('/dashboard')
  
  return <LoginForm />
}