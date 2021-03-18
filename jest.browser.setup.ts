import { CreateBrowserApi, createBrowser } from 'page-with'

let browser: CreateBrowserApi

beforeAll(async () => {
  browser = await createBrowser()
})

afterAll(async () => {
  await browser.cleanup()
})
