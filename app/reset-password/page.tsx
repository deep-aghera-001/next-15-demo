import ResetPasswordForm from './ResetPasswordForm'
import ServerAuthRedirect from '@/components/ServerAuthRedirect'

export default function ResetPasswordPage() {
  return (
    <ServerAuthRedirect redirectTo="/dashboard">
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-center">Reset Password</h1>
          <p className="text-sm text-gray-600 text-center">
            Enter your email and we'll send you a link to reset your password.
          </p>
          <ResetPasswordForm />
        </div>
      </div>
    </ServerAuthRedirect>
  )
}