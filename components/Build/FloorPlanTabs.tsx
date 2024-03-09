import { createClient } from '@/utils/supabase/client'
import { Button } from '../ui/button'
import { Plus } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import React from 'react'
import { createNewFloorPlan } from '@/lib/supabase'

interface FloorPlanTabsProps {
  setFloorPlan: (index: number) => void
  user: User
  activeFloorPlanIndex: number
  floorPlans: IFloorPlan[]
  updateFloorPlans: () => Promise<void>
}

const FloorPlanTabs: React.FC<FloorPlanTabsProps> = (props) => {
  const {
    setFloorPlan,
    user,
    activeFloorPlanIndex,
    floorPlans,
    updateFloorPlans,
  } = props

  const supabase = createClient()

  const addFloorPlan = async () => {
    await createNewFloorPlan(supabase, user, {
      structure: {
        walls: [],
        products: [],
      },
      name: 'Untitled',
    })
    await updateFloorPlans()
    setFloorPlan(0)
  }

  return (
    !(floorPlans.length === 0) && (
      <div className={'flex flex-row gap-2 items-center overflow-hidden py-2'}>
        <Button
          onClick={() => {
            // eslint-disable-next-line @typescript-eslint/no-floating-promises
            addFloorPlan()
          }}
          variant="outline"
          size="icon"
          className="h-6 w-6 flex-shrink-0"
          disabled={floorPlans.length >= 5}
        >
          <Plus size={18} color="black" />
        </Button>
        {floorPlans.map((floorPlan, index) => {
          return (
            <Badge
              key={index}
              variant={activeFloorPlanIndex === index ? 'secondary' : 'outline'}
              className="flex-shrink-0 h-7 cursor-pointer max-w-[150px] overflow-hidden"
              onClick={() => {
                setFloorPlan(index)
              }}
            >
              {floorPlan.name}
            </Badge>
          )
        })}
      </div>
    )
  )
}

export default FloorPlanTabs
