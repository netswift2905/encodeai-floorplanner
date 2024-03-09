/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/no-floating-promises */
'use client'

import React from 'react'
import { type User } from '@supabase/supabase-js'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PaperPlaneRight } from '@phosphor-icons/react/dist/ssr/PaperPlaneRight'
import Shop from '@/components/Build/Shop'
import { createClient } from '@/utils/supabase/client'
// import { NoSSRCanvas } from "../NoSSRCanvas";
import { getFloorPlans } from '@/lib/supabase'
import FloorPlanTabs from './FloorPlanTabs'
import dynamic from 'next/dynamic'
import { createObject } from '@/lib/supabase'
import { getObjects } from '@/lib/supabase'


// import { supabase } from "@/lib/supabaseClient";

const DynamicCanvas = dynamic(
  async () => await import('@/components/Build/BuildCanvas'),
  {
    ssr: false,
  }
)

type Tab = 'shop' | 'build'

export const BuildPage: React.FC<{
  user: User
}> = (props) => {
  const { user } = props
  const supabase = createClient()

  const [floorPlans, setFloorPlans] = React.useState<IFloorPlan[]>([])
  const [activeFloorPlanIndex, setActiveFloorPlanIndex] =
    React.useState<number>(0)
  // const [activeTab, setActiveTab] = React.useState<Tab>('shop')
  const [inputUrl, setInputUrl] = React.useState<string>('')
  const [products, setProducts] = React.useState<IFrontEndProduct[]>([])
  const [stageItems, setStageItems] = React.useState([])
  const updateFloorPlans = async () => {
    const data = await getFloorPlans(supabase, user)
    setFloorPlans(data)
  }
  const [isLoading, setIsLoading] = React.useState(false);


  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputUrl(event.target.value)
  }

  const handleAddProduct = async (input: string) => {
    setIsLoading(true);
    // url validation logic
    if (input !== null && input.trim() !== '') {
      setInputUrl('')
      // User entered a URL
      try {
        const response = await fetch('/api/getProduct', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(input),
        })
        if (!response.ok) {
          throw new Error('Network response was not ok')
        }

        const newProduct = await response.json()
        // reformat object since we no longer care about units
        // to be moved to confirmation flow or backend and handle types

        if (newProduct.units === 'inches') {
          // Convert from inches to centimeters
          newProduct.width *= 2.54
          newProduct.depth *= 2.54
        }
        delete newProduct.units
        console.log(newProduct)
        // add to catalogue logic
        setProducts((prevProducts) => [...prevProducts, newProduct])
        
        await createObject(supabase, user, {
          user_id: user.id,
          url: newProduct.url,
          object: newProduct.object,
          colour: newProduct.colour,
          price: newProduct.price,
          currency: newProduct.currency,
          width: newProduct.width,
          depth: newProduct.depth,
          additional_details: newProduct.additional_details,
        })
      
      } catch (error) {
        console.error('Error:', error)
      } finally {
        setIsLoading(false); // Set loading state back to false
      }
    } else {
      // User canceled or entered an empty URL
      alert('You did not enter a valid URL.')
    } 
  }

  React.useEffect(() => {
    updateFloorPlans()
  }, [])

  const setFloorPlan = (index: number) => {
    setActiveFloorPlanIndex(index)
  }

  const handleAddToStage = (e, shapeType, shapeProperties) => {
    // addToHistory()x
    e.preventDefault()

    const newShape = {
      type: shapeType,
      product: shapeProperties,
      x: 200,
      y: 200,
      rotation: 0,
    }
    // pass setShapes down to sidebar property and then trigger it on a + button click.
    // no need for handleShaperightclick logic to live here -- should be in sidebar.
    setStageItems([...stageItems, newShape])
  }

  return (
    <div className="flex w-full h-full">
      <div className="flex w-full h-full relative">
        <Shop products={products} handleAddToStage={handleAddToStage} setProducts={setProducts} isLoading={isLoading}  />
        <BuildTab
          updateFloorPlans={updateFloorPlans}
          setFloorPlan={setFloorPlan}
          user={user}
          activeFloorPlanIndex={activeFloorPlanIndex}
          floorPlans={floorPlans}
          activeFloorPlanId={
            floorPlans[activeFloorPlanIndex]?.floorplanId ?? '0'
          }
          stageItems={stageItems}
          setStageItems={setStageItems}
        />
      </div>
      <div className="fixed bottom-8 lg:bottom-16 left-0 w-full z-10">
        <div className="flex lg:w-3/4 w-full mx-auto px-4 lg:px-0">
          <Input
            type="search"
            placeholder="Find some furniture 🪑 and paste the link 🔗 here"
            className="flex-grow shadow-xl"
            value={inputUrl}
            onChange={handleInputChange}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleAddProduct(inputUrl)
              }
            }}
          />
          <Button
            className="ml-2 shadow-xl"
            onClick={async () => {
              await handleAddProduct(inputUrl)
            }}
          >
            <PaperPlaneRight size={18} />
          </Button>
        </div>
      </div>
    </div>
  )
}

const BuildTab: React.FC<{
  updateFloorPlans: () => Promise<void>
  setFloorPlan: (index: number) => void
  user: User
  activeFloorPlanIndex: number
  floorPlans: IFloorPlan[]
  activeFloorPlanId: string
  stageItems: []
  setStageItems: () => Promise<void>
}> = ({
  updateFloorPlans,
  setFloorPlan,
  user,
  activeFloorPlanIndex,
  floorPlans,
  activeFloorPlanId,
  stageItems,
  setStageItems,
}) => {
  return (
    !(floorPlans.length === 0) && (
      <div className="flex flex-col gap-2 h-full w-full overflow-x-hidden">
        <FloorPlanTabs
          updateFloorPlans={updateFloorPlans}
          setFloorPlan={setFloorPlan}
          user={user}
          activeFloorPlanIndex={activeFloorPlanIndex}
          floorPlans={floorPlans}
        />
        <div className="rounded-md h-full w-full bg-transparent border">
          <DynamicCanvas
            activeFloorPlanId={activeFloorPlanId}
            updateFloorPlans={updateFloorPlans}
            stageItems={stageItems}
            setStageItems={setStageItems}
          />
        </div>
      </div>
    )
  )
}
