import OpenAI from 'openai'
import {
  type ChatCompletion,
  type ChatCompletionMessageParam,
} from 'openai/resources'
import fs from 'fs'

const openaiapiKey = process.env.OPENAI_API_KEY

import formidable from 'formidable'
import { get } from 'lodash'

export const config = {
  api: {
    bodyParser: false,
  },
}

export async function POST(req: Request, res: Response): Promise<Response> {
  const body = await req.json()

  let base64 = body.base64
  let result = await getObject(base64)
  let toReturn = {
    response: result,
  }
  //   console.log(result)
  //   const formData = await req.formData()
  //   const file = formData.get('floorplan')

  //   console.log('File:', file)
  return Response.json(toReturn, { status: 200 })
}

const getObject = async (base64: string) => {
  const openai = new OpenAI({
    apiKey: openaiapiKey,
  })
  const inputmessages: ChatCompletionMessageParam[] = [
    {
      role: 'system',
      content: `
You are an interior designer assistant. You will be given an image of a floorplan designed by a user, and your job is to give comments on how to improve the floorplan, as well as give a rating out of 10 on how well the floorplan is designed.\
Provide your answer in a step by step approach, explaining what each aspect of the floorplan is and how it can be improved.\
At the end, give a description of why the rating you gave is appropriate.`,
    },
    {
      role: 'user',
      content: [
        {
          type: 'image_url',
          image_url: {
            url: `data:image/jpeg;base64,${base64}`,
            detail: 'low',
          },
        },
      ],
    },
  ]

  async function getOpenAIResponse(messages: ChatCompletionMessageParam[]) {
    const response: ChatCompletion = await openai.chat.completions.create({
      model: 'gpt-4-vision-preview',
      max_tokens: 1000,
      messages,
    })
    console.log(`getobject usage ${JSON.stringify(response.usage)}`)
    console.log(response.choices[0].message.content)
    return response.choices[0].message.content
  }

  const result = await getOpenAIResponse(inputmessages)

  return result
}
