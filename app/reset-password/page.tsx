import ResetPasswordForm from '@/components/forms/ResetPasswordForm'
import { redirectIfAuthenticated } from '@/utils/auth-redirect'

export default async function ResetPasswordPage() {
  await redirectIfAuthenticated('/dashboard')
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center text-gray-900">Reset Password</h1>
        <p className="text-sm text-center text-gray-600">
          Enter your email and we&apos;ll send you a link to reset your password.
        </p>
        <ResetPasswordForm />
      </div>
    </div>
  )
}
