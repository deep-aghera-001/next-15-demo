import AuthRedirect from '@/components/AuthRedirect'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthRedirect>
      {children}
    </AuthRedirect>
  )
}