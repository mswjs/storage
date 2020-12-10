interface BroadcastChannelMessageType<ValueType> {
  HYDRATE: never
  UPDATE: {
    nextValue: ValueType
  }
}

// Jest jsdom contains `window` object in Node => detect required features
const IS_BROWSER =
  typeof BroadcastChannel !== 'undefined' &&
  typeof sessionStorage !== 'undefined'

export class LiveStorage<ValueType> {
  public id: string
  private value: ValueType

  private channel: BroadcastChannel | null

  constructor(id: string, initialValue: ValueType) {
    this.id = id
    const hydratedValue = this.hydrateValue()
    this.value = hydratedValue || initialValue
    this.channel = IS_BROWSER ? new BroadcastChannel(id) : null

    if (IS_BROWSER) {
      // Create a BroadcastChannel to sync the value updates between the clients.
      this.channel = new BroadcastChannel(id)
      this.channel.addEventListener(
        'message',
        <MessageType extends keyof BroadcastChannelMessageType<ValueType>>(
          event: MessageEvent<{
            type: MessageType
            payload: BroadcastChannelMessageType<ValueType>[MessageType]
          }>,
        ) => {
          switch (event.data.type) {
            // Broadcast the current storage's value to all other storages
            // in case of the hydrate request.
            case 'HYDRATE': {
              this.broadcastValue(this.value)
              break
            }

            case 'UPDATE': {
              this.value = event.data.payload.nextValue

              // Persist the synced value, because each client keeps
              // the value in its own session storage. That way the
              // persistency layer auto-cleans itself when a client closes.
              this.persistValue()
              break
            }
          }
        },
      )

      // When there's no hydated value for the current client,
      // request hydration from another opened client to pull its value.
      if (!hydratedValue) {
        this.postMessage('HYDRATE')
      }
    }
  }

  /**
   * Send the current value to other clients to inherit it.
   */
  private broadcastValue = (nextValue: ValueType) => {
    this.postMessage('UPDATE', {
      nextValue,
    })
  }

  update = (updater: (prevValue: ValueType) => ValueType) => {
    const nextValue = updater(this.value)
    this.value = nextValue

    if (IS_BROWSER) {
      this.persistValue()
      this.broadcastValue(this.value)
    }
  }

  getValue = () => this.value

  private serialize = (value: ValueType): string => {
    return JSON.stringify(value)
  }

  private deserialize = (str: string): ValueType => {
    return JSON.parse(str)
  }

  /**
   * Flush the value into the persistency layer.
   */
  private persistValue = () => {
    if (IS_BROWSER) {
      sessionStorage.setItem(this.id, this.serialize(this.value))
    }
  }

  /**
   * Hydrate the value from the persistency layer.
   */
  private hydrateValue = (): ValueType | null => {
    if (IS_BROWSER) {
      const storedValue = sessionStorage.getItem(this.id)
      return storedValue ? this.deserialize(storedValue) : null
    }

    return this.value
  }

  private postMessage = <
    MessageType extends keyof BroadcastChannelMessageType<ValueType>,
    MessagePayload extends BroadcastChannelMessageType<ValueType>[MessageType]
  >(
    type: MessageType,
    ...rest: MessagePayload extends never ? never : [MessagePayload]
  ) => {
    this.channel?.postMessage({
      type,
      payload: rest[0],
    })
  }
}
