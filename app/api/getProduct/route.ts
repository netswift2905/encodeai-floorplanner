import getDetails from './usePuppeteer'
import { NextResponse } from 'next/server'

const isDummy = true

export async function POST(req: Request) {
  const inputUrl: string = await req.json()

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _response: IResolvedProduct = !isDummy
    ? await getDetails(inputUrl)
    : {
        url: inputUrl,
        object: 'sofa',
        colour: '#964B00',
        price: 449.99,
        currency: 'GBP',
        units: 'cm',
        width: 200,
        depth: 140,
        additionalDetails: {
          mainSection: { numberOfSeatCushions: 3 },
          right: { numberOfSeatCushions: 1, isChaise: true },
        },
      }
  // @ts-expect-error
  return Response.json(_response, { status: 200 })
  // return NextResponse.redirect(new URL('/build', req.url))
  // return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })

  // return new Response(JSON.stringify(response), {
  //   status: 200,
  //   headers: {
  //     'Content-Type': 'application/json',
  //   },
  // })

  /**
   * Type error: Property 'json' does not exist on type '{ new (body?: BodyInit | null | undefined,
   * init?: ResponseInit | undefined): Response; prototype: Response; error(): Response;
   * redirect(url: string | URL, status?: number | undefined): Response; }'
   */
  // return Response
  // return Response.json(response)
}
