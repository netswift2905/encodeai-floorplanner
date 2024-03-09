import React, { useEffect, useState } from 'react'
import { Item } from './Item'
import { Button } from '@/components/ui/button'
import { MagicWandIcon } from '@radix-ui/react-icons'
import { propagateServerField } from 'next/dist/server/lib/render-server'
import { getObjects } from '@/lib/supabase'
import { createClient } from '@/utils/supabase/client'

interface ShopProps {
  products: any // Replace 'Product[]' with the actual type of your products
  handleAddToStage: (
    event: React.MouseEvent<HTMLButtonElement>,
    itemType: string,
    product: any
  ) => void
  isLoading: boolean
}

const Shop: React.FC<ShopProps> = (props) => {
  const [itemNames, setItemNames] = useState<string[]>(Array.from({ length: props.products.length }, () => 'New Item'));

  const handleItemNameChange = (e, index) => {
    const newName = e.target.innerText;
    setItemNames((prevNames) => {
      const newNames = [...prevNames];
      newNames[index] = newName;
      return newNames;
    });
  };
  const handleGPTReview = async () => {
    try {
      // Dynamically import html2canvas
      const html2canvas = await import('html2canvas')

      // Now you can use html2canvas in your component
      // Get the stage canvas element by ID
      const stageCanvas = document.getElementById('yourStageId')

      if (stageCanvas) {
        // Use html2canvas with the stage canvas element
        await html2canvas.default(stageCanvas).then(async (canvas) => {
          const dataUrl = canvas.toDataURL('image/png').split(';base64,')[1]
          console.log(dataUrl)
          let res = await fetch('/api/getReview', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ base64: dataUrl }),
          })
          console.log(res)
          // Convert the canvas to a data URL (PNG format)
          // const dataUrl = canvas.toDataURL('image/png')
          // // Create a link element to download the image
          // const downloadLink = document.createElement('a')
          // downloadLink.href = dataUrl
          // downloadLink.download = 'canvas_image.png'
          // // Trigger a click event on the link to initiate the download
          // downloadLink.click()
        })
      } else {
        console.error('Stage canvas element not found.')
      }
    } catch (error) {
      console.error('Error loading html2canvas:', error)
    }
  }

  return (
    <div className="w-96 justify-center mx-5">
      <div className="pt-5 items-center justify-center flex flex-col ">
        <Button
          className="shadow-xl mx-auto"
          onClick={() => {
            handleGPTReview()
          }}
        >
          Review
          <MagicWandIcon className="ml-1" />
        </Button>
        <div className="flex flex-col my-2 overflow-x-hidden">
          {props.products.map((product, index) => (
            <div className="items-center my-2" key={index}>
              <div className="rounded-lg border flex space-x-4 w-full items-center p-5">
                <div
                  className="w-[70px] max-h-[100px] overflow-hidden"
                  key={index}
                >
                  <Item
                    // index={index}
                    product={product}
                    scale={product.width / 70}
                  />
                </div>
                <div className="flex-col items-center">
                  <h5
                    className="text-center font-medium contenteditable"
                    contentEditable={true}
                    onBlur={(e) => {
                        handleItemNameChange(e, index);
                      }}
                    >
                      {itemNames[index]}
                  </h5>
                  <p className="text-[#colorValue] text-xs font-light">
                    {product.currency} {product.price}
                  </p>
                </div>
                <Button
                  className="flex-col flex mx-auto outline"
                  onClick={(e) => {
                    props.handleAddToStage(e, 'item', product)
                  }}
                >
                  +
                </Button>
              </div>
            </div>
          ))}
        </div>
        {/* Loading pop up in sidebar when adding new item */}
        {props.isLoading && (
          <div className="flex items-center justify-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden text-gray-500">Loading...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Shop
