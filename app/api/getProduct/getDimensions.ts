import OpenAI from 'openai'
import { type ChatCompletionMessageParam } from 'openai/resources'

const openaiapiKey = process.env.OPENAI_API_KEY

const isDummy = false

const getDimensions = async (snippets: string[]) => {
  const openai = new OpenAI({
    apiKey: openaiapiKey,
  })
  const inputmessages: ChatCompletionMessageParam[] = [
    {
      role: 'system',
      content: `Your role is to pull the overall widthX and widthY of an object from a snippet of text from a product website. Ignore any reference to height.
          The user will input 3 snippets from the product website. At least one of these contains the product dimensions. 
          You will respond with the overall widthX and widthY of the object as if viewed from the top down. 
        
          WidthX and WidthY can also be known as Width right and Width left in some snippets. Sometimes the information is contained in a table format that you must read. 
          
          If an objects has only height and diameter, then the diameter is both the widthX and widthY.  
          If there is only a length measurement and no depth measurement, use the length as depth.
          
          Respond in the following JSON format, with no trailing commas or any other formatting. Start your response only with curly braces:
          {
            "units": <cm or inches>
            "widthX": <integer, or null if not found>,
            "widthY": <integer, or null if not found>,
          }
                    `,
    },

    {
      role: 'user',
      content: [
        {
          type: 'text',
          text: snippets[0],
        },
        {
          type: 'text',
          text: snippets[1],
        },
        {
          type: 'text',
          text: snippets[3],
        },
      ],
    },
  ]

  async function getOpenAIResponse(messages: ChatCompletionMessageParam[]) {
    const response = await openai.chat.completions.create({
      model: 'gpt-4-1106-preview',
      response_format: { type: 'json_object' },
      max_tokens: 1000,
      messages,
    })
    console.log(`getDimensions usage ${JSON.stringify(response.usage)}`)
    try {
      const JSONoutput = JSON.parse(response.choices[0].message.content ?? '')
      return JSONoutput
    } catch (e) {
      // if output is not a JSON
      return {
        units: 'cm',
        widthX: null,
        widthY: null,
      }
    }
  }

  const result: IDimensions = !isDummy
    ? await getOpenAIResponse(inputmessages)
    : {
        // dummy response
        units: 'cm',
        widthX: 200,
        widthY: 100,
      }

  return result
}

export default getDimensions
