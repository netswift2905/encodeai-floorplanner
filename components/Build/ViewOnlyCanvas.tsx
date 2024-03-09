/* eslint-disable @typescript-eslint/no-floating-promises */
import { useEffect, useRef, useState } from 'react'
import { Button } from '../ui/button'
import { Export } from '@phosphor-icons/react/dist/csr/Export'
import { Stage, Layer, Line } from 'react-konva'
import { Label } from '../ui/label'
import { getFloorPlan } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

const ViewOnlyCanvas: React.FC<{ floorplanId: string }> = (props) => {
  const supabase = createClient()
  const router = useRouter()

  const { floorplanId } = props
  const [currentFloorPlanState, setCurrentFloorPlanState] =
    useState<IFloorPlan | null>(null)

  const share = () => {
    router.push(`/f/${floorplanId}`)
  }
  const [canvasDimensions, setCanvasDimensions] = useState({
    width: 0,
    height: 0,
  })
  const divRef = useRef<HTMLDivElement>(null)
  const walls = currentFloorPlanState
    ? currentFloorPlanState.structure.walls
    : []

  const fetchFloorPlan = async () => {
    setCurrentFloorPlanState(
      (await getFloorPlan(supabase, floorplanId)) as IFloorPlan
    )
  }

  useEffect(() => {
    const updateDimensions = () => {
      setCanvasDimensions({
        width: divRef.current?.offsetWidth ?? 0,
        height: divRef.current?.offsetHeight ?? 0,
      })
    }

    updateDimensions()
    fetchFloorPlan()
    window.addEventListener('resize', updateDimensions)
    return () => {
      window.removeEventListener('resize', updateDimensions)
    }
  }, [floorplanId])

  return (
    <div className="w-full h-full relative" ref={divRef}>
      {!!currentFloorPlanState && (
        <div className="absolute top-4 left-4 z-20 max-w-[200px] overflow-hidden overflow-ellipsis whitespace-nowrap">
          <div className="flex flex-row items-center gap-2">
            <Label>{currentFloorPlanState.name}</Label>
          </div>
        </div>
      )}
      <Button
        className="absolute top-4 right-4 z-20"
        variant={'outline'}
        size={'sm'}
        onClick={share}
      >
        <Export size={18} weight="light" />
      </Button>
      <div
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, #ddd 1px, transparent 0)',
          backgroundSize: '15px 15px',
          width: '100%',
          height: '100%',
          // flex: '1',
          position: 'absolute',
          zIndex: '-10',
        }}
      />
      <Stage width={canvasDimensions.width} height={canvasDimensions.height}>
        <Layer>
          {walls.map((wall, index) => {
            if (wall?.start && wall?.end) {
              return (
                <Line
                  key={index}
                  points={[wall.start.x, wall.start.y, wall.end.x, wall.end.y]}
                  stroke="#222"
                  lineCap="round"
                  // dash={[10, 10]}
                  strokeWidth={8}
                />
              )
            }
            return null
          })}
        </Layer>
      </Stage>
    </div>
  )
}

export default ViewOnlyCanvas
