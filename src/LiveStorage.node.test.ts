import { LiveStorage } from './LiveStorage'

test('REAME example', () => {
  const posts = new LiveStorage('posts', [] as any[])
  posts.update((prevPosts) => prevPosts.concat({ title: 'Brave new world' }))

  expect(posts.getValue()).toEqual([{ title: 'Brave new world' }])
})
