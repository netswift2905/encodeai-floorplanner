/* eslint-disable max-len */
import OpenAI from 'openai'
import { type ChatCompletionMessageParam } from 'openai/resources'

const openaiapiKey = process.env.OPENAI_API_KEY

const isDummy = false

const resolveBedDetails = async (base64: string) => {
    const openai = new OpenAI({
        apiKey: openaiapiKey,
    })
    const inputmessages: ChatCompletionMessageParam[] = [
        {
            role: 'system',
            content: `You are an expert in Bed Layouts, look at the bed screenshot provided and determine whether it is a single our double bed.
            If single output an S, if double output a D
                  
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
        console.log(`bedDetails usage ${JSON.stringify(response.usage)}`)
        return response.choices[0].message
    }

    async function main() {

        const initialResponse = await getOpenAIResponse(inputmessages)
        // console.log(`${initialResponse.content} (init beddetails response)`)
        let JSONresult = '{"double":true}'
        if (initialResponse.content?.trim().toLowerCase() === 's' ){
            JSONresult='{"double":false}'
        }

        try {

            const JSONoutput = JSON.parse(JSONresult)
            return JSONoutput
        } catch (e) {
            // if output is not a JSON
            console.log('error parsing JSON at resolvebedDetails')
            return {}
        }
    }

    const result: IBedDetails = !isDummy
        ? await main()
        : {double:true}

    return result
}

export default resolveBedDetails
