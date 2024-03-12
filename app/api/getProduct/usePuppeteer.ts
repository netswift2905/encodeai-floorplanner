/* eslint-disable no-await-in-loop */
/* eslint-disable no-useless-escape */
/* eslint-disable no-cond-assign */
/* eslint-disable no-restricted-syntax */
/* eslint-disable max-len */
import puppeteer from 'puppeteer-core'
// import puppeteerLocal from 'puppeteer-extra'
// import puppeteerStealth from 'puppeteer-extra-plugin-stealth'
import chromium from '@sparticuz/chromium'
import getDimensions from './getDimensions'
import getObject from './getScreenshotDetails'
import objectRouter from './objectRouter'

const usePuppeteer = async (url: string) => {
  let browser
  let version
  try {
    if (process.env.LOCAL === '1') {
      version = 'puppeteer -- local'
      // puppeteer.use(puppeteerStealth())
      browser = await puppeteer.launch({
        headless: true,
        executablePath:
          '/Users/ayush.rodrigues/Documents/test-devs/floorplan/node_modules/chromium/lib/chromium/chrome-mac/Chromium.app/Contents/MacOS/Chromium',
        args: [
          // ...chromiumLocal.args,
          // extensions from /Users/XYZ/Library/Application Support/Google/Chrome/Profile 1/Extensions/
          // or we can just host in the US and probably avoid these popups
          '--disable-extensions-except=./app/api/getProduct/puppeteer-extensions/cookieblocker,./app/api/getProduct/puppeteer-extensions/cookieblocker2',
          '--load-extension=./app/api/getProduct/puppeteer-extensions/cookieblocker,./app/api/getProduct/puppeteer-extensions/cookieblocker2',
        ],
      })
    } else {
      version = 'puppeteer core -- prod'
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
    }

    console.log('puppeteer launched ' + version)
  } catch (error) {
    console.error('Failed to launch browser:', error)

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
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 7000 })
  } catch (e) {
    console.log('Page loading timed out')
  }
  // remove any popups and wait for them to fade out
  console.log('goto loaded')
  await new Promise((resolve) => setTimeout(resolve, 300))
  await page.mouse.click(0, 0, { count: 2 })

  await new Promise((resolve) => setTimeout(resolve, 500))

  // if ((process.env.LOCAL = '1')) {
  //   await page.screenshot({
  //     path: './app/api/getProduct/screenshot.jpg',
  //     optimizeForSpeed: true,
  //     clip: {
  //       x: 0,
  //       y: 0,
  //       height: 1000,
  //       width: 1280,
  //     },
  //   })
  // }

  async function extractText() {
    const extractedText = await page.evaluate(() => {
      // Target more specific elements to reduce the workload
      const elements = document.querySelectorAll(
        'p, h1, h2, h3, h4, h5, h6, li, span, a'
      ) // Adjust this selector based on your needs
      let combinedText = ''
      // Iterate through the elements and build the text string efficiently
      elements.forEach((el) => {
        const textContent = el.textContent?.trim() || ''
        if (textContent) {
          combinedText += textContent + ' ' // Add a space to separate text content
        }
      })

      return combinedText.toLowerCase().replace(/[\n\t]/g, '') // Perform cleaning in the browser context
    })

    console.log('text extracted and cleaned')

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
        while (
          (termIndex = extractedText.indexOf(term, termIndex + 1)) !== -1
        ) {
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
        extractedText.length,
        index + term.length + contextLength
      )
      return extractedText.substring(start, end)
    })
    // console.log(snippets);

    const criteriaRegex = /cm|centimeters| x |centimetres|inch|"/i

    const exclusionRegex = /[\{\}\[\]_]/

    // Filter the 'snippets' array based on the criteria and exclusion regex
    const filteredSnippets = snippets.filter(
      (snippet) => criteriaRegex.test(snippet) && !exclusionRegex.test(snippet)
    )
    const uniqueSnippets = [...new Set(filteredSnippets)]
    console.log('unique snippets done ' + uniqueSnippets)

    const firstThreeSnippets = uniqueSnippets.slice(0, 3)
    return firstThreeSnippets
  }

  // if no text found first, then try click on words in the hope of surfacing dimensions.
  async function extractAndRetryWithDifferentClicks() {
    console.log('trying to extract text')
    let gptDimensionsInput = await extractText()
    console.log(gptDimensionsInput)
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
          units: 'cm',
          widthX: 100,
          widthY: 100,
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

  await browser.close()

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
