import { LiveStorage } from '../src/LiveStorage'

interface Book {
  title: string
}

describe('getValue', () => {
  it('returns the initial value when no value exists', () => {
    const books = new LiveStorage<Book[]>('books', [])
    expect(books.getValue()).toEqual([])
  })

  it('returns the latest value when exists', () => {
    const books = new LiveStorage<Book[]>('books', [])
    books.update((prevBooks) =>
      prevBooks.concat({ title: 'The Lord of The Rings' }),
    )

    expect(books.getValue()).toEqual([{ title: 'The Lord of The Rings' }])
  })
})
