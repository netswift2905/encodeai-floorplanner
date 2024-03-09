import OpenAI from 'openai'
import {
  type ChatCompletion,
  type ChatCompletionMessageParam,
} from 'openai/resources'

const openaiapiKey = process.env.OPENAI_API_KEY

const isDummy = false

const getObject = async (base64: string) => {
  const openai = new OpenAI({
    apiKey: openaiapiKey,
  })
  const inputmessages: ChatCompletionMessageParam[] = [
    {
      role: 'system',
      content: `Your role is to place the screenshot of this furniture product page into an object category, the colour as viewed from the top down, and pull the price of the object. 
          The object can ONLY be one of:
            - "chair"
            - "sofa" (including 1 seater sofa armchairs)
            - "lighting"
            - "bed"
            - "table"
            - "storage"
            - "rug"
            - "other"

            1. Place the object in the category that most closely matches it. If there is no match, then place it in 'other'.
            2. Then, pull the colour of the object as viewed from the top down. This can be estimated. Please give the output in hexadecimal colour code format.
            3. Also pull the price and currency, which should be present in the screenshot. Currency should be in 3 letter code format. Note well the difference between EUR and GBP symbols which can look similar.  
          
          Respond in the following JSON format, with no trailing commas or any other formatting. Only output the JSON response. 
          {
            "object": <enum from above>,
            "colour": <hex colour code, or null if not found>,
            "price": <number, or null if not found>,
            "currency": <3 letter currency code, or null if not found>
          }
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
    const response: ChatCompletion = await openai.chat.completions.create({
      model: 'gpt-4-vision-preview',
      max_tokens: 1000,
      messages,
    })
    console.log(`getobject usage ${JSON.stringify(response.usage)}`)
    console.log(response.choices[0].message.content)
    try {
      const JSONoutput = JSON.parse(response.choices[0].message.content ?? '')
      return JSONoutput
    } catch (e) {
      // if output is not a JSON
      return {
        object: 'other',
        colour: null,
        price: null,
        currency: null,
      }
    }
  }

  const result: IInitProduct = !isDummy
    ? await getOpenAIResponse(inputmessages)
    : {
        // dummy response
        object: 'sofa',
        colour: '#0080ff',
        price: 99,
        currency: 'GBP',
      }

  return result
}

export default getObject
