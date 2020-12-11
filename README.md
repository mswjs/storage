# Storage

Data storage and persistency layer for testing JavaScript applications.

## Features

### Persistency

The values of a live storage are persisted in the session. In a browser that is achieved by [`sessionStorage`](https://developer.mozilla.org/en-US/docs/Web/API/Window/sessionStorage).

### Real-time synchronization

Updates to the storage are synchronized between all active clients in real time. In a browser that is achieved by using a [`BroadcastChannel`](https://developer.mozilla.org/en-US/docs/Web/API/BroadcastChannel) to signal updates.

## When to use?

- When writing CRUD operations in tests;
- When conducting local in-browser testing/debugging;
- In combination with API mocking tools (i.e. [MSW](https://github.com/mswjs/msw))

## Get started

### Install

```bash
$ npm install @mswjs/storage --save-dev
```

### Create storage

```js
import { LiveStorage } from '@mswjs/storage'

// Instantiate a new storage with a unique string key
// and initial value.
const posts = new LiveStorage('posts', [])
```

### Update values

```js
// Storage update is a function that derives the next value
// from the previous storage value.
posts.update((prevPosts) => prevPosts.concat({ title: 'Brave new world' });
```

### Get value

```js
posts.getValue() // [{ title: 'Brave new world' }]
```
