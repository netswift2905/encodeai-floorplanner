/* eslint-disable max-len */
import OpenAI from 'openai'
import { type ChatCompletionMessageParam } from 'openai/resources'

const openaiapiKey = process.env.OPENAI_API_KEY

const isDummy = false

const resolveSofaDetails = async (base64: string) => {
  const openai = new OpenAI({
    apiKey: openaiapiKey,
  })
  const inputmessages: ChatCompletionMessageParam[] = [
    {
      role: 'system',
      content: `You are an expert in sofa layouts. Look at the sofa screenshot provided by the user and output whether the sofa layout is either: 
                  1. Straight: Shape=Rectangular; Orientation=Horizontal; The simplest and most common sofa type.
                  2. L: Shape=L; Orientation=TwoSides; Having 1 corner in the sofa layout.
                  3. U: Sections=Multiple; Arrangement=Enclosing; Attributes=ExtendedArms or Chaise; Form=Concave; Orientation=MultipleAngles; Having 2 corners in the layout.
                  4. Other: if you cannot determine the shape or the input is not a sofa.

                  Ignore any other words on the page, only look at the image of the sofa. 
                  
                  Only output 1 of the 4 options above. The response should be a single word or letter. Do not output any other wording or formatting. 
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
    console.log(`sofaDetails usage ${JSON.stringify(response.usage)}`)
    return response.choices[0].message
  }

  async function main() {
    const initialResponse = await getOpenAIResponse(inputmessages)
    console.log(`${initialResponse.content} (init sofadetails response)`)
    inputmessages.push(initialResponse)

    let followUpResponse
    // Analyze the response and branch logic
    if (initialResponse.content?.trim().toLowerCase() === 'l') {
      const newMessages: ChatCompletionMessageParam[] = [
        ...inputmessages,
        {
          role: 'system',
          content: `
            You are an expert in describing sofa L sofa layouts and spacial recognition. Follow the instructions:

            1. Main Section Identification:
        The 'mainSection' refers to the longest continuous line of sofa seat cushions.
        Include corner cushions as part of the 'mainSection'.
        If cushions cannot be identified, use an estimate for the number of seats. 
       
        2. Left or Right Section:
        Since this is an L shaped sofa, there will be a perpendicular section such as a chaise extending from either end of the 'mainSection'.
        Determine the orientation ('left' or 'right') as if you were viewing on the sofa directly.
        Exclude corner seat cushions from 'left' or 'right' sections as they are counted in the 'mainSection'.
        
        4. Chaise Details:
        For 'left' or 'right' sections, indicate the presence of a chaise with 'isChaise'. These are treated as 2 separate seat cushions - 1 for the seated section in main section, and 1 for the footrest.
        If a section extends with a full backrest, mark 'isChaise' as false.
        If isChaise is true, then the number of seat cushions must be 1. Chaises are only ever 1 sofa seat cushion. 

        Follow this JSON structure:
  
  {
    "mainSection": {
      "numberOfSeatCushions": <SEAT_CUSHIONS_IN_MAIN_SECTION>,  // longest continuous line of sofa seat cushions, including corner seat cushions. Use estimates if seat cushions unclear. 
    },
    "left": { // Include only if a 'left' section exists. 
      "numberOfSeatCushions": <SEAT_CUSHIONS_IN_LEFT_SECTION>, // excluding corner seat cushions, as they are counted in the main section
      "isChaise": <BOOLEAN_IS_CHAISE> // If a section extends with a full backrest, mark 'isChaise' as false. If true, numberOfSeatCushions must be == 1
    },
    "right": { // Include only if a 'right' section exists.
      "numberOfSeatCushions": <SEAT_CUSHIONS_IN_RIGHT_SECTION>, // excluding corner seat cushions, as they are counted in the main section
      "isChaise": <BOOLEAN_IS_CHAISE> // If a section extends with a full backrest, mark 'isChaise' as false. If true, numberOfSeatCushions must be == 1
    }
  }
  Note: The terms 'left' and 'right' are from the viewer's perspective facing the sofa.
  If you cannot determine the sofa layout, output: "error"
            `,
        },

        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: {
                url: 'https://i.imgur.com/eEMp5S7.png',
                detail: 'low',
              },
            },
          ],
        },
        {
          role: 'assistant',
          content: `
          There are 3 sofa cushions in the main section, including the corner cushions
          There is a 1 seat chaise on the left side, facing the sofa. We treat this as a separate seat cushion. 

          {
          {
            "mainSection": {
              "numberOfSeatCushions": 3, 
            },
            "left": {
              "numberOfSeatCushions": 1, 
              "isChaise": true
            }
          }
        `,
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              // text: 'Now do the original image, using the previous example as reference. Use chain of thought and show your reasoning. ',
              text: 'Now do the original image, using the previous example as reference. Only output the JSON and no extra wording.',
            },
          ],
        },
      ]
      followUpResponse = await getOpenAIResponse(newMessages)
    }

    if (initialResponse.content?.trim().toLowerCase() === 'u') {
      console.log('u')
      // const newMessages = [...inputmessages, { /* Your new message here */ }];
      // followUpResponse = await getOpenAIResponse(newMessages);
    }
    console.log(followUpResponse?.content)

    try {
      const JSONoutput = JSON.parse(followUpResponse?.content ?? '')
      return JSONoutput
    } catch (e) {
      // if output is not a JSON
      console.log('error parsing JSON at resolveSofaDetails')
      return {}
    }
  }

  const result: ISofaDetails = !isDummy
    ? await main()
    : {
        // dummy response, U shape sofa
        mainSection: {
          numberOfSeatCushions: 4,
        },
        left: {
          numberOfSeatCushions: 2,
          isChaise: false,
        },
        right: {
          numberOfSeatCushions: 1,
          isChaise: true,
        },
      }

  return result
}

export default resolveSofaDetails
