import ServerAuthGuard from '@/components/ServerAuthGuard'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ServerAuthGuard redirectTo="/login">
      {children}
    </ServerAuthGuard>
  )
}