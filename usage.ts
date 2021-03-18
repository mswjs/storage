import { LiveStorage } from './lib'

// @ts-ignore
window.storage = new LiveStorage('number', [1])
