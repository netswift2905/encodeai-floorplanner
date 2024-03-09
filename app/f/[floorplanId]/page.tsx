'use client'

import dynamic from 'next/dynamic'
// import { useRouter } from 'next/navigation'

const DynamicCanvas = dynamic(
  async () => await import('@/components/Build/ViewOnlyCanvas'),
  {
    ssr: false,
  }
)

export default function ViewOnlyPage({
  params,
}: {
  params: { floorplanId: string }
}): JSX.Element {
  const { floorplanId } = params

  return (
    <div className="flex flex-col gap-4 lg:w-3/4 w-full h-screen">
      <div className="rounded-md h-full w-full bg-transparent border">
        <DynamicCanvas floorplanId={floorplanId} />
      </div>
    </div>
  )
}
