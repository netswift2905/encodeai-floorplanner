import React, { useState } from 'react'
import { Item } from './Item'
import { Button } from '@/components/ui/button'

interface ShopProps {
  products: any // Replace 'Product[]' with the actual type of your products
  handleAddToStage: (
    event: React.MouseEvent<HTMLButtonElement>,
    itemType: string,
    product: any
  ) => void
  isLoading: boolean
}

const handleGenerateLayout = async (props) => {
  try {
    props.setProducts((prevProducts) => [...prevProducts, props.testProduct])
  } catch (error) {
    console.error('Error:', error)
  }
}

const Shop: React.FC<ShopProps> = (props) => {
  const [itemName, setItemName] = useState('New Item')

  const handleItemNameChange = (e) => {
    const newName = e.target.innerText
    setItemName(newName)
  }

  console.log(props.products)
  return (
    <div className="w-96 justify-center mx-5">
      <div className="pt-5 mx-auto">
        <Button
          className="shadow-xl"
          onClick={async () => {
            await handleGenerateLayout(props)
          }}
        >
          {' '}
          Generate New Layout{' '}
        </Button>
        <div className="flex flex-col my-2 overflow-x-hidden">
          {props.products.map((product, index) => (
            <div className="items-center my-2" key={index}>
              <div className="bg-stone-100 rounded-lg border border-stone-300">
                <div className="inline-flex flex-row">
                  <div
                    className="shadow-[inset_0_4px_8px_rgba(0,0,0,0.6)] m-2 p-5 rounded-md border-2 border-[#colorValue]"
                    key={index}
                  >
                    <Item
                      // index={index}
                      product={product}
                      scale={2.5}
                    />
                  </div>
                  <div className="flex-col">
                    <h4
                      className="text-center my-2"
                      contentEditable={true}
                      onBlur={(e) => {
                        handleItemNameChange(e)
                      }}
                    >
                      {itemName}
                    </h4>
                    <p className="text-[#colorValue] text-xs font-light">
                      {product.currency} {product.price}
                    </p>
                  </div>
                </div>
                <button
                  className="flex-col flex mx-auto mt-1 mb-2 px-24 bg-gray-500 hover:bg-gray-400 text-white font-bold rounded"
                  onClick={(e) => {
                    props.handleAddToStage(e, 'item', product)
                  }}
                >
                  +
                </button>
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
