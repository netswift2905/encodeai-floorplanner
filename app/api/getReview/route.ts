import OpenAI from 'openai'
import {
  type ChatCompletion,
  type ChatCompletionMessageParam,
} from 'openai/resources'
import fs from 'fs'

import formidable from 'formidable'
import { get } from 'lodash'
import { NextResponse } from 'next/server'

const openaiapiKey = process.env.OPENAI_API_KEY

export async function POST(req: Request, res: Response): Promise<Response> {
  const body = await req.json()

  const base64 = body.base64
  const result = await getObject(base64)

  const toReturn = {
    response: result,
  }
  return Response.json(toReturn, { status: 200 })
}

const getObject = async (base64: string) => {
  const openai = new OpenAI({
    apiKey: openaiapiKey,
  })
  const inputMessages: ChatCompletionMessageParam[] = [
    {
      role: 'system',
      content: `
You are an interior designer assistant. You will be given an image of a floorplan designed by a user, and your job is to give comments on how to improve the floorplan, as well as give a rating out of 10 on how well the floorplan is designed.\
Provide your answer in a step by step approach, explaining what each aspect of the floorplan is and how it can be improved.\
At the end, give a description of why the rating you gave is appropriate. Limit your response to 1000 characters.
please give me a good and short review`,
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

  //   async function getOpenAIResponse(messages: ChatCompletionMessageParam[]) {

  const response: any = await openai.chat.completions.create({
    model: 'gpt-4-vision-preview',
    max_tokens: 1000,
    messages: inputMessages,
    // stream: true,
  })
  return response.choices[0].message.content

  //   for await (const part of response) {
  //     return part.choices[0].message.content
  //   }
  // console.log(`getobject usage ${JSON.stringify(response.usage)}`)
  // console.log(response.choices[0].message.content)
  // return response.choices[0].message.content

  //   const result = await getOpenAIResponse(inputmessages)

  //   return result
}
