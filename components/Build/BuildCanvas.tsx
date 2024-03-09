/* eslint-disable @typescript-eslint/no-floating-promises */
'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Stage, Layer, Circle, Line } from 'react-konva'
import type Konva from 'konva'
import { Button } from '../ui/button'
import { ArrowCounterClockwise } from '@phosphor-icons/react/dist/csr/ArrowCounterClockwise'
import { Label } from '../ui/label'
import { Pen } from 'lucide-react'
import { Input } from '../ui/input'
import { createClient } from '@/utils/supabase/client'
import { getFloorPlan, updateFloorPlan } from '@/lib/supabase'
import { Export } from '@phosphor-icons/react/dist/csr/Export'
import { useRouter } from 'next/navigation'
import { StageItem } from './Item'

interface BuildCanvasProps {
  activeFloorPlanId: string
  updateFloorPlans: () => Promise<void>
  stageItems: []
  setStageItems: (items: any[]) => void
}

const BuildCanvas: React.FC<BuildCanvasProps> = (props) => {
  const supabase = createClient()

  // const { data, error } = await supabase.auth.getUser()

  const router = useRouter()

  const [currentFloorPlanState, setCurrentFloorPlanState] =
    useState<IFloorPlan>({})

  const [isEditing, setIsEditing] = useState<boolean>(false)
  const { activeFloorPlanId, updateFloorPlans } = props

  const divRef = useRef<HTMLDivElement>(null)
  const [canvasDimensions, setCanvasDimensions] = useState({
    width: 0,
    height: 0,
  })
  const [isCircleVisible, setIsCircleVisible] = useState<boolean>(true)
  const [cursor, setCursor] = useState<ICoord>({ x: 0, y: 0 })
  const [isDrawing, setIsDrawing] = useState<boolean>(false)
  const [tempLine, setTempLine] = useState<ILine | null>(null)
  const [selectedIndex, setSelectedIndex] = useState(null)

  const walls = currentFloorPlanState.structure?.walls ?? ([] as ILine[])

  const isWallEnds = (): boolean => {
    return walls.some((wall) => {
      return (
        (wall?.start.x === cursor.x && wall?.start.y === cursor.y) ||
        (wall?.end.x === cursor.x && wall?.end.y === cursor.y)
      )
    })
  }
  const handleRemoveItem = (index) => {
    // addToHistory();
    props.setStageItems((currentStageItems) =>
      currentStageItems.filter((_, i) => i !== index)
    )
    // console.log(index);
  }

  const fetchFloorPlan = async (): Promise<void> => {
    setCurrentFloorPlanState(
      (await getFloorPlan(supabase, activeFloorPlanId)) as IFloorPlan
    )
  }

  const handleDragEnd = (index, e) => {
    // addToHistory();
    const newShapes = [...props.stageItems]
    newShapes[index] = {
      ...newShapes[index],
      x: e.target.x(),
      y: e.target.y(),
    }
    props.setStageItems(newShapes)
  }

  const handleRotation = (index, e) => {
    const newShapes = [...props.stageItems]
    newShapes[index] = {
      ...newShapes[index],
      rotation: e.target.attrs.rotation,
    }
    props.setStageItems(newShapes)
    // addToHistory();
  }

  const dragBoundFunc = (pos) => ({
    x: Math.max(0, Math.min(pos.x, canvasDimensions.width)),
    y: Math.max(0, Math.min(pos.y, canvasDimensions.height)),
  })

  useEffect(() => {
    if (currentFloorPlanState !== null) {
      updateFloorPlan(supabase, currentFloorPlanState)
    }
    // console.log(currentFloorPlanState)
  }, [currentFloorPlanState])

  useEffect(() => {
    fetchFloorPlan()
  }, [activeFloorPlanId])

  useEffect(() => {
    const updateDimensions = (): void => {
      setCanvasDimensions({
        width: divRef.current?.clientWidth ?? 0,
        height: divRef.current?.clientHeight ?? 0,
      })
      console.log(divRef.current?.clientHeight)
    }

    updateDimensions()
    window.addEventListener('resize', updateDimensions)
    return () => {
      window.removeEventListener('resize', updateDimensions)
    }
  }, [])

  const handleCanvasMouseDown = (
    e: Konva.KonvaEventObject<MouseEvent>
  ): void => {
    if (
      e.target.attrs.name === 'item' ||
      e.target.attrs.name === 'rotater _anchor'
    ) {
      return
    }
    setSelectedIndex(null)
    setIsDrawing(true)
    setTempLine({ start: cursor, end: cursor })
  }

  const handleCanvasMouseUp = (e: Konva.KonvaEventObject<MouseEvent>): void => {
    if (
      e.target.attrs.name !== 'item' &&
      tempLine !== null &&
      JSON.stringify(tempLine.start) !== JSON.stringify(cursor)
    ) {
      //   addToHistory();
      setCurrentFloorPlanState((oldFloorPlan) => {
        if (oldFloorPlan == null) {
          // Handle the case where oldFloorPlan is null
          // You might want to return a default IFloorPlan object here
          return null
        }
        return {
          ...oldFloorPlan,
          structure: {
            ...oldFloorPlan.structure,
            walls: [...oldFloorPlan.structure.walls, tempLine],
          },
        }
      })
      // setWalls((prevWalls) => );
    }

    // Reset line start and end points
    setIsDrawing(false)
    setTempLine(null)
  }

  const handleCanvasMouseMove = (
    e: Konva.KonvaEventObject<MouseEvent>
  ): void => {
    const stage = e.target?.getStage()
    const mousePos = stage?.getPointerPosition()

    // Calculate the nearest grid snap positions
    const snappedX = Math.round((mousePos?.x ?? 0) / 10) * 10 + 1
    const snappedY = Math.round((mousePos?.y ?? 0) / 10) * 10 + 1
    setCursor({ x: snappedX, y: snappedY })

    if (isDrawing && tempLine !== null) {
      setTempLine({ start: tempLine.start, end: cursor })
    }
  }

  const handleMouseEnter = (): void => {
    setIsCircleVisible(true)
  }

  const handleMouseLeave = (): void => {
    setIsCircleVisible(false)
    setIsDrawing(false)
    setTempLine(null)
  }
  const handleRemoveStageItem = (index) => {
    props.setStageItems((currentShapes) =>
      currentShapes.filter((_, i) => i !== index)
    )
  }

  const undo = (): void => {
    setCurrentFloorPlanState((oldFloorPlan) => {
      if (oldFloorPlan == null) {
        // Handle the case where oldFloorPlan is null
        // You might want to return a default IFloorPlan object here
        return {}
      }
      return {
        ...oldFloorPlan,
        structure: {
          ...oldFloorPlan.structure,
          walls: oldFloorPlan.structure?.walls.slice(0, -1),
        },
      }
    })
    // handleFloorPlanUpdate();
    // setWalls(walls.slice(0, -1));
  }

  const share = (): void => {
    router.push(`/f/${activeFloorPlanId}`)
  }


    const screenshot = async () => {
      try {
        // Dynamically import html2canvas
        const html2canvas = await import('html2canvas');
    
        // Now you can use html2canvas in your component
        // Get the stage canvas element by ID
        const stageCanvas = document.getElementById('yourStageId');
    
        if (stageCanvas) {
          // Use html2canvas with the stage canvas element
          html2canvas.default(stageCanvas).then(canvas => {
            // Convert the canvas to a data URL (PNG format)
            const dataUrl = canvas.toDataURL('image/png');
    
            // Create a link element to download the image
            const downloadLink = document.createElement('a');
            downloadLink.href = dataUrl;
            downloadLink.download = 'canvas_image.png';
    
            // Trigger a click event on the link to initiate the download
            downloadLink.click();
          });
        } else {
          console.error('Stage canvas element not found.');
        }
      } catch (error) {
        console.error('Error loading html2canvas:', error);
      }
    };
  

  return (
    <div className="relative w-full h-full">
      {
        <div className="absolute top-4 left-4 z-20 max-w-[200px] overflow-hidden overflow-ellipsis whitespace-nowrap">
          {!isEditing ? (
            <div className="flex flex-row items-center gap-2">
              <Label className="max-w-[150px] overflow-hidden">
                {currentFloorPlanState?.name}
              </Label>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                // color="black"
                onClick={() => {
                  setIsEditing(true)
                }}
              >
                <Pen size={16} />
              </Button>
            </div>
          ) : (
            <Input
              autoFocus
              className="bg-transparent cursor-pointer border-0 border-b rounded-none h-7"
              autoComplete="off"
              value={currentFloorPlanState?.name}
              onChange={(e) => {
                setCurrentFloorPlanState({
                  ...currentFloorPlanState,
                  name: e.target.value.slice(0, 20),
                })
              }}
              onBlur={() => {
                setIsEditing(false)
              }}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  setIsEditing(false)
                }
              }}
              maxLength={20}
            />
          )}
        </div>
      }
      <div className="absolute top-4 right-4 z-20 flex flex-row items-center gap-2">
        <Button           
          variant={'outline'}
          size={'sm'}
          onClick={screenshot}>
            Save as PNG
        </Button>
        <Button
          // onMouseOver={(e) => {
          //     e.preventDefault();
          //     e.stopPropagation();
          // }}
          variant={'outline'}
          size={'sm'}
          onClick={undo}
        >
          <ArrowCounterClockwise size={18} />
        </Button>
        <Button
          // onMouseOver={(e) => {
          //     e.preventDefault();
          //     e.stopPropagation();
          // }}
          variant={'outline'}
          size={'sm'}
          onClick={share}
        >
          <Export size={18} />
        </Button>
      </div>

      <div
        ref={divRef}
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, #ddd 1px, transparent 0)',
          backgroundSize: '10px 10px',
          width: '100%',
          height: '100%',
          // flex: '1',
          position: 'absolute',
          zIndex: '-10',
        }}
      />
      <Stage
        id="yourStageId" 
        width={canvasDimensions.width}
        height={canvasDimensions.height - 2}
        onMouseDown={handleCanvasMouseDown}
        onMouseUp={handleCanvasMouseUp}
        onMouseMove={handleCanvasMouseMove}
        onMouseLeave={handleMouseLeave}
        onMouseEnter={handleMouseEnter}
      >
        <Layer>
          {isCircleVisible && (
            <Circle
              radius={6}
              fill={isWallEnds() ? 'orange' : '#000'}
              x={cursor.x}
              y={cursor.y}
              name="cursor"
            />
          )}
          {walls.map((wall, index) => {
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

            // return null
          })}
          {props.stageItems.map((shape, index) => {
            if (shape.type === 'item') {
              return (
                <StageItem
                  scale={1}
                  key={index}
                  index={index}
                  handleRemoveStageItem={handleRemoveStageItem}
                  product={shape.product}
                  handleDragEnd={handleDragEnd}
                  handleRotation={handleRotation}
                  dragBoundFunc={dragBoundFunc}
                  setSelectedIndex={setSelectedIndex}
                  isSelected={selectedIndex === index}
                  x={shape.x}
                  y={shape.y}
                  rotation={shape.rotation}
                />
              )
            }
            return null
          })}
          {isDrawing && tempLine !== null && (
            <Line
              points={[
                tempLine.start.x,
                tempLine.start.y,
                tempLine.end.x,
                tempLine.end.y,
              ]}
              stroke="gray"
              dash={[10, 10]}
              strokeWidth={5}
            />
          )}
        </Layer>
      </Stage>
    </div>
  )
}

export default BuildCanvas
