import SignupForm from '@/components/forms/SignupForm'
import { redirectIfAuthenticated } from '@/utils/auth-redirect'

export default async function SignupPage() {
  await redirectIfAuthenticated('/dashboard')
  
  return <SignupForm />
}