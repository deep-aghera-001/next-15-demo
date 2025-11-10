import UpdatePasswordForm from './UpdatePasswordForm'

export default function UpdatePasswordPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center text-gray-900">Update Password</h1>
        <p className="text-sm text-center text-gray-600">
          Please enter your new password below.
        </p>
        <UpdatePasswordForm />
      </div>
    </div>
  )
}