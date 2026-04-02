import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'GrandInvite',
  description: 'Digital luxury wedding invitations',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
