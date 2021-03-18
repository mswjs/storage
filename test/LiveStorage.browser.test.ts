import * as path from 'path'
import { pageWith } from 'page-with'
import { LiveStorage } from '../src'

declare global {
  interface Window {
    storage: LiveStorage<number[]>
  }
}

function prepareRuntime() {
  return pageWith({
    example: path.resolve(__dirname, '../usage.ts'),
  })
}

it('persists the value between page reloads', async () => {
  const runtime = await prepareRuntime()
  await runtime.page.evaluate(() => {
    window.storage.update((prev) => prev.concat([2]))
  })
  await runtime.page.reload()
  const value = await runtime.page.evaluate(() => {
    return window.storage.getValue()
  })

  expect(value).toEqual([1, 2])
})

it('persists the value between multiple tabs', async () => {
  const runtime = await prepareRuntime()
  await runtime.page.evaluate(() => {
    window.storage.update((prev) => prev.concat(2))
  })
  const secondPage = await runtime.context.newPage()
  await secondPage.goto(runtime.origin, { waitUntil: 'networkidle' })
  const secondPageValue = await secondPage.evaluate(() => {
    return window.storage.getValue()
  })

  expect(secondPageValue).toEqual([1, 2])

  await secondPage.evaluate(() => {
    window.storage.update((prev) => prev.concat(3))
  })

  await runtime.page.bringToFront()
  const firstPageValue = await runtime.page.evaluate(() => {
    return window.storage.getValue()
  })

  expect(firstPageValue).toEqual([1, 2, 3])
})
