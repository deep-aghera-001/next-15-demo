import AuthGuard from '@/components/AuthGuard'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthGuard redirectTo="/login">
      {children}
    </AuthGuard>
  )
}