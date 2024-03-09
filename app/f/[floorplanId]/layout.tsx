export const dynamic = 'force-dynamic'

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}): Promise<JSX.Element> {
  return <>{children}</>
}
