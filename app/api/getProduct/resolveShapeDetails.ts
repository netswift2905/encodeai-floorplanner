/* eslint-disable max-len */
import OpenAI from 'openai'
import { type ChatCompletionMessageParam } from 'openai/resources'

const openaiapiKey = process.env.OPENAI_API_KEY

const isDummy = false

const resolveshapeDetails = async (base64: string) => {
  const openai = new OpenAI({
    apiKey: openaiapiKey,
  })
  const inputmessages: ChatCompletionMessageParam[] = [
    {
      role: 'system',
      content: `You are an expert in shape analysis, look at the shape of the furniture screenshot provided
            and determine whether it is circular or square
            If circular output a C, if square output an S
                  
                  Only output that. The response should be a single word or letter. Do not output any other wording or formatting. 
                    `,
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
    const response = await openai.chat.completions.create({
      model: 'gpt-4-vision-preview',
      max_tokens: 3000,
      messages,
    })
    console.log(`shapeDetails usage ${JSON.stringify(response.usage)}`)
    return response.choices[0].message
  }

  async function main() {
    const initialResponse = await getOpenAIResponse(inputmessages)
    // console.log(`${initialResponse.content} (init shapedetails response)`)
    let JSONresult = '{"shape":"square"}'
    switch (initialResponse.content?.trim().toLowerCase()) {
      case 'C':
        JSONresult = '{"shape":"circle"}'
        break
    }

    try {
      const JSONoutput = JSON.parse(JSONresult)
      return JSONoutput
    } catch (e) {
      // if output is not a JSON
      console.log('error parsing JSON at resolveshapeDetails')
      return {}
    }
  }

  const result: IShapeDetails = !isDummy ? await main() : { shape: 'square' }

  return result
}

export default resolveshapeDetails
