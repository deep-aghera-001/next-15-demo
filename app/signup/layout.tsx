import ServerAuthRedirect from '@/components/ServerAuthRedirect'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ServerAuthRedirect redirectTo="/dashboard">
      {children}
    </ServerAuthRedirect>
  )
}