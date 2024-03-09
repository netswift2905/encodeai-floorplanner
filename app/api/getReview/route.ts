import OpenAI from 'openai'
import {
  type ChatCompletion,
  type ChatCompletionMessageParam,
} from 'openai/resources'
import fs from 'fs'

const openaiapiKey = process.env.OPENAI_API_KEY

import formidable from 'formidable'

export const config = {
  api: {
    bodyParser: false,
  },
}

export async function POST(req: Request, res: Response): Promise<Response> {
  const formData = await req.formData()
  const file = formData.get('floorplan')

  console.log('File:', file)
  return new Response('Hello World', { status: 200 })
}

// const getObject = async (base64: string) => {
//   const openai = new OpenAI({
//     apiKey: openaiapiKey,
//   })
//   const inputmessages: ChatCompletionMessageParam[] = [
//     {
//       role: 'system',
//       content: `
// Your role is to be a floorplan designer.
// Please give a review from 1-10 of the following image of a floorplan.`,
//     },
//     {
//       role: 'user',
//       content: [
//         {
//           type: 'image_url',
//           image_url: {
//             url: `data:image/jpeg;base64,${base64}`,
//             detail: 'low',
//           },
//         },
//       ],
//     },
//   ]

//   async function getOpenAIResponse(messages: ChatCompletionMessageParam[]) {
//     const response: ChatCompletion = await openai.chat.completions.create({
//       model: 'gpt-4-vision-preview',
//       max_tokens: 1000,
//       messages,
//     })
//     console.log(`getobject usage ${JSON.stringify(response.usage)}`)
//     console.log(response.choices[0].message.content)
//     try {
//       const JSONoutput = JSON.parse(response.choices[0].message.content ?? '')
//       return JSONoutput
//     } catch (e) {
//       // if output is not a JSON
//       return {
//         object: 'other',
//         colour: null,
//         price: null,
//         currency: null,
//       }
//     }
//   }

//   const result: IInitProduct = !isDummy
//     ? await getOpenAIResponse(inputmessages)
//     : {
//         // dummy response
//         object: 'sofa',
//         colour: '#0080ff',
//         price: 99,
//         currency: 'GBP',
//       }

//   return result
// }
