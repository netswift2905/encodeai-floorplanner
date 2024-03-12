import Sofa from './Sofa'
import Table from './Table'
import Store from './Store'
import Rug from './Rug'
import Lighting from './Lighting'
import Bed from './Bed'
import Plant from './Plant'

import { Html } from 'react-konva-utils'
import { Rect, Group, Transformer } from 'react-konva'
import React, { useEffect, useRef, useState } from 'react'
import { Close } from '@radix-ui/react-popover'
import { Cross2Icon, TrashIcon } from '@radix-ui/react-icons'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

export const Item = (props) => {
  let outputItem
  switch (
    props.product.object?.toLowerCase() // move lowercase to backend
  ) {
    case 'sofa':
      outputItem = <Sofa product={props.product} scale={props.scale} />
      break
    case 'table':
      outputItem = <Table product={props.product} scale={props.scale} />
      break
    case 'chair':
      outputItem = (
        <Sofa
          product={{
            ...props.product,
            additionalDetails: {
              mainSection: {
                numberOfSeatCushions: 1,
              },
            },
          }}
          scale={props.scale}
        />
      )
      break
    case 'storage':
      outputItem = <Store product={props.product} scale={props.scale} />
      break
    case 'rug':
      outputItem = <Rug product={props.product} scale={props.scale} />
      break
    case 'lighting':
      outputItem = <Lighting product={props.product} scale={props.scale} />
      break
    case 'bed':
      outputItem = <Bed product={props.product} scale={props.scale} />
      break
    case 'plant':
      outputItem = <Plant product={props.product} scale={props.scale} />
      break
    default:
      outputItem = <div className="bg-red-500 w-5 h-5"></div>
  }

  return outputItem
}

export function StageItem(props) {
  //   const { isOpen, onClose, onOpen } = useDisclosure()
  const [isOpen, setIsOpen] = useState(false)

  const shapeRef = useRef()
  const trRef = useRef()

  useEffect(() => {
    if (props.isSelected) {
      const layer = trRef.current.getLayer()
      trRef.current.nodes([shapeRef.current])
      layer.moveToTop() // Move the entire layer to the top
      layer.batchDraw()
    }
    setIsOpen(props.isSelected)
  }, [props.isSelected])

  const objectProperties = props.product
  return (
    <>
      {props.isSelected && (
        // console.log(props.index)
        <Transformer
          ref={trRef}
          flipEnabled={false}
          rotationSnaps={[0, 90, 180, 270]}
          resizeEnabled={false}
        />
      )}
      <Group
        draggable
        onDragEnd={(e) => props.handleDragEnd?.(props.index, e)}
        dragBoundFunc={props.dragBoundFunc}
        x={props.x}
        y={props.y}
        ref={shapeRef}
        offsetX={objectProperties.width / props.scale / 2}
        offsetY={objectProperties.depth / props.scale / 2}
        onTransformEnd={(e) => props.handleRotation(props.index, e)}
        rotation={props.rotation}
      >
        <Html
          divProps={{
            style: {
              pointerEvents: 'none',
              // zIndex: '-1',
            },
          }}
        >
          {/* <ChakraProvider> */}
          <Popover open={props.isSelected && isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
              <div>
                <Item product={props.product} scale={props.scale} />
              </div>
            </PopoverTrigger>
            {/* <Portal> */}
            <PopoverContent
              className="w-40"
              // pointerEvents="auto"
              onPointerDownOutside={() => {
                setIsOpen(false)
              }}
            >
              <Close
                className="absolute top-4 right-4"
                onClick={() => {
                  setIsOpen(false)
                }}
                style={{
                  pointerEvents: 'auto',
                }}
              >
                <Cross2Icon />
              </Close>
              {/* <PopoverArrow />
                <PopoverCloseButton />
                <PopoverBody>
                  <Button
                    colorScheme="red"
                    onClick={() => props.handleRemoveItem(props.index)}
                  >
                    Remove
                  </Button>
                </PopoverBody> */}
              <div className="space-y-2">
                {/* <h4 className="font-medium leading-none">
                  {props.product.object.charAt(0).toUpperCase() +
                    props.product.object.slice(1)}
                </h4> */}
                <p className="text-sm text-muted-foreground">
                  {props.product.object?.charAt(0).toUpperCase() +
                    props.product.object?.slice(1)}
                </p>
                <Button
                  onClick={() => props.handleRemoveStageItem(props.index)}
                >
                  <TrashIcon></TrashIcon>
                </Button>
              </div>
            </PopoverContent>
            {/* </Portal> */}
          </Popover>
          {/* </ChakraProvider> */}
        </Html>

        <Rect
          // stroke="black"
          // fill="blue"
          width={objectProperties.width / props.scale}
          height={objectProperties.depth / props.scale}
          // onContextMenu={(e) => props.handleShapeRightClick(e, 'item', props.product)}
          name="item"
          onClick={() => {
            props.setSelectedIndex(props.index)
            // onOpen()
          }}
        />
      </Group>
    </>
  )
}
