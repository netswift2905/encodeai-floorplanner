/* eslint-disable no-await-in-loop */
/* eslint-disable no-useless-escape */
/* eslint-disable no-cond-assign */
/* eslint-disable no-restricted-syntax */
/* eslint-disable max-len */
import puppeteer from 'puppeteer-core'
// import puppeteerStealth from 'puppeteer-extra-plugin-stealth'
import chromium from '@sparticuz/chromium'
import getDimensions from './getDimensions'
import getObject from './getScreenshotDetails'
import objectRouter from './objectRouter'

const usePuppeteer = async (url: string) => {
  // puppeteer.use(puppeteerStealth())
  let browser
  try {
    console.log('attempting to launch puppeteer')

    browser = await puppeteer.launch({
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
      ignoreHTTPSErrors: true,
      args: [
        ...chromium.args,
        '--hide-scrollbars',
        '--disable-web-security',
        '--disable-extensions-except=./app/api/getProduct/puppeteer-extensions/cookieblocker,./app/api/getProduct/puppeteer-extensions/cookieblocker2',
        '--load-extension=./app/api/getProduct/puppeteer-extensions/cookieblocker,./app/api/getProduct/puppeteer-extensions/cookieblocker2',
      ],
    })
    console.log('it launched')
  } catch (error) {
    console.error('Failed to launch browser:', error.code)

    throw error // or return; depending on your error handling strategy
  }
  const page = await browser.newPage()

  await page.setExtraHTTPHeaders({
    'user-agent':
      'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36',
    'upgrade-insecure-requests': '1',
    accept:
      'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
    'accept-encoding': 'gzip, deflate, br',
    'accept-language': 'en-US,en;q=0.9,en;q=0.8',
  })
  await page.setViewport({ width: 1280, height: 720 })
  try {
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 3000 })
  } catch (e) {
    console.log('Page loading timed out')
  }
  // remove any popups and wait for them to fade out
  console.log('goto loaded')
  await new Promise((resolve) => setTimeout(resolve, 300))
  await page.mouse.click(0, 0, { count: 2 })

  await new Promise((resolve) => setTimeout(resolve, 500))

  // await page.screenshot({
  //   path: './app/api/getProduct/screenshot.jpg',
  //   optimizeForSpeed: true,
  //   clip: {
  //     x: 0,
  //     y: 0,
  //     height: 1000,
  //     width: 1280,
  //   },
  // })

  async function extractText() {
    const extractedText = (
      await page.$$eval('*', (elements: Element[]) =>
        elements.map((el) => el.textContent?.trim() ?? '').join(' ')
      )
    ).toLowerCase()
    const cleanedText = extractedText.replace(/[\n\t]/g, '')
    const contextLength = 150
    const searchTerms = [
      'dimensions',
      'specifications',
      'measurement',
      'depth',
      'length',
    ]

    // Use reduce to accumulate matching occurrences along with their positions
    const occurrences = searchTerms.reduce(
      (accumulator: Array<{ term: string; index: number }>, term) => {
        let termIndex = -1
        while ((termIndex = cleanedText.indexOf(term, termIndex + 1)) !== -1) {
          accumulator.push({ term, index: termIndex })
        }
        return accumulator
      },
      []
    )

    // Sort the occurrences based on their index (position in the text)
    occurrences.sort((a, b) => a.index - b.index)

    const snippets = occurrences.map(({ term, index }) => {
      const start = Math.max(0, index - contextLength)
      const end = Math.min(
        cleanedText.length,
        index + term.length + contextLength
      )
      return cleanedText.substring(start, end)
    })
    // console.log(snippets);

    const criteriaRegex = /cm|centimeters| x |centimetres|inch|"/i

    const exclusionRegex = /[\{\}\[\]_]/

    // Filter the 'snippets' array based on the criteria and exclusion regex
    const filteredSnippets = snippets.filter(
      (snippet) => criteriaRegex.test(snippet) && !exclusionRegex.test(snippet)
    )
    const uniqueSnippets = [...new Set(filteredSnippets)]

    const firstThreeSnippets = uniqueSnippets.slice(0, 3)
    return firstThreeSnippets
  }

  // if no text found first, then try click on words in the hope of surfacing dimensions.
  async function extractAndRetryWithDifferentClicks() {
    let gptDimensionsInput = await extractText()

    // Early return if initial extraction is successful
    if (gptDimensionsInput.length > 0) {
      return gptDimensionsInput
    }

    const wordsToClick: string[] = ['imensions', 'easurements', 'pecifications']

    for (const word of wordsToClick) {
      const xpathExpression = `//body//*[text()[contains(., '${word}')]]`
      const clickTargets = await page.$$(`xpath/${xpathExpression}`)

      for (const clickTarget of clickTargets) {
        console.log(`Trying to click on element containing '${word}'`)
        try {
          await clickTarget.click({ delay: 200 })
          await new Promise((resolve) => setTimeout(resolve, 500))

          gptDimensionsInput = await extractText()
          if (gptDimensionsInput.length > 0) {
            console.log(
              `Content found after clicking on element containing '${word}'`
            )
            return gptDimensionsInput // Return the result if content is found
          }
        } catch (error) {
          console.error(`Error while clicking on element: ${error}`)
        }
      }
    }

    // Return the result, empty if no content was found after all attempts
    return gptDimensionsInput
  }

  async function runWorkflows() {
    async function runWorkflow1() {
      try {
        const base64ss = await page.screenshot({
          clip: {
            x: 0,
            y: 0,
            height: 1000,
            width: 1280,
          },
          encoding: 'base64',
        })
        const initialDetails = await getObject(base64ss)
        const screenshotDetails = await objectRouter(initialDetails, base64ss)
        return screenshotDetails
      } catch (error) {
        console.error('Error in workflow 1:', error)
        return {
          object: null,
          colour: null,
          price: null,
          currency: null,
          additionalDetails: null,
        }
      }
    }

    async function runWorkflow2() {
      try {
        const gptSnippets = await extractAndRetryWithDifferentClicks()
        if (gptSnippets.length > 0) {
          return await getDimensions(gptSnippets)
        } else {
          throw new Error('gptSnippets is empty')
        }
      } catch (error) {
        console.error('Error in workflow 2:', error)
        return {
          units: null,
          widthX: null,
          widthY: null,
        }
      }
    }
    // Execute both workflows in parallel
    const [baseDetails, dimensions]: [
      IInitProduct & { additionalDetails: any },
      IDimensions,
    ] = await Promise.all([runWorkflow1(), runWorkflow2()])

    // console.log('baseDetails:', baseDetails);
    // console.log('dimensions:', dimensions);

    const output = {
      url,
      object: baseDetails.object,
      colour: baseDetails.colour,
      price: baseDetails.price,
      currency: baseDetails.currency,
      units: dimensions.units,
      width: dimensions.widthX,
      depth: dimensions.widthY,
      additionalDetails: baseDetails.additionalDetails,
    }
    // console.log(output);
    return output
  }
  const details = await runWorkflows()
  // const initDetails = JSON.stringify(details);
  console.log(details)

  // await browser.close()

  // const details = {
  //   object: 'sofa',
  //   colour: '#0080ff',
  //   price: 699.99,
  //   currency: 'GBP',
  //   width: 197,
  //   depth: 134,
  //   url,
  // }
  // const initDetails = await JSON.stringify(initData);
  return details
}

export default usePuppeteer
