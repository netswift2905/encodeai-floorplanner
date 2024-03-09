interface IFurnitureProduct {
  imgSrc: string
  width: number
  height: number
  color: string
  title: string
  price: number
  description: string
  category: string
  buyUrl: string
  vendorUrl: string
  vendor: string
  productId?: string
}

interface ICoord {
  x: number
  y: number
}

interface ILine {
  start: ICoord
  end: ICoord
}

interface IFloorPlanProduct {
  productId: string
  position: ICoord
  rotation: number
}

interface IStructure {
  walls: ILine[]
  products: IFloorPlanProduct[]
}

interface IFloorPlan {
  floorplanId?: string
  created_at?: string
  structure?: IStructure
  name?: string
  userId?: string
}

interface IInitProduct {
  object: string | null
  colour: string | null
  price: number | null
  currency: string | null
}

interface IDimensions {
  units: string | null
  widthX: number | null
  widthY: number | null
}

interface ISofaDetails {
  mainSection: {
    numberOfSeatCushions: number
  }
  left?: {
    numberOfSeatCushions: number
    isChaise: boolean
  }
  right?: {
    numberOfSeatCushions: number
    isChaise: boolean
  }
}

interface IBedDetails{
  double: boolean
}
interface IShapeDetails{
  shape : string
}
interface IResolvedProduct {
  url?: string | null
  object?: string | null
  colour?: string | null
  price?: number | null
  currency?: string | null
  units?: string | null
  width?: number | null
  depth?: number | null
  additionalDetails?: Record<string, any> | null
}

interface IFrontEndProduct {
  url?: string
  object: string
  colour?: string
  price?: number
  currency?: string
  width: number
  depth: number
  additionalDetails?: Record<string, any> | null
}
