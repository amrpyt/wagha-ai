import { AppShell } from '@/components/apps/AppShell'

export default function AppsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <AppShell>{children}</AppShell>
}
