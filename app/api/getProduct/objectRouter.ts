import resolveSofaDetails from './resolveSofaDetails'
import resolveBedDetails from './resolveBedDetails'
import resolveShapeDetails from './resolveShapeDetails'

const objectRouter = async (inits: IInitProduct, ss: string) => {
  let additionalDetails
  const inputobject = inits
  switch (inputobject.object) {
    case 'sofa':
      additionalDetails = await resolveSofaDetails(ss)
      break
    case 'bed':
      additionalDetails=await resolveBedDetails(ss)
      break
    case 'table':
      additionalDetails=await resolveShapeDetails(ss)
      break
    case 'storage':
      break
    case 'lighting':
      break
    case 'rug':
      additionalDetails=await resolveShapeDetails(ss)
      break
    case 'plant':
      break
    case 'chair':
      break
    default:
      additionalDetails = null
  }

  const JSONoutput = {
    ...inputobject,
    additionalDetails,
  }
  return JSONoutput
}

export default objectRouter
