# Live Storage

Data storage and persistency for testing JavaScript applications.

## Get started

### Install

```bash
$ npm install live-storage
```

### Create storage

```js
import { LiveStorage } from "live-storage";

const posts = new LiveStorage("posts", []);

posts.update((prevPosts) => prevPosts.concat({ title: "Brave new world" });
```

## What does this do?

### Persistency

Live storage uses [`sessionStorage`](https://developer.mozilla.org/en-US/docs/Web/API/Window/sessionStorage) for client-side data persistency.

### Live synchronization

Live storage shares all value updates between all opened clients via [`BroadcastChannel`](https://developer.mozilla.org/en-US/docs/Web/API/BroadcastChannel).
