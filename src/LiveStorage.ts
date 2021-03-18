interface BroadcastChannelMessageType<ValueType> {
  HYDRATE: never
  UPDATE: {
    nextValue: ValueType
  }
}

const features = {
  sessionStorage: typeof sessionStorage !== 'undefined',
  broadcastChannel: typeof BroadcastChannel !== 'undefined',
}

export class LiveStorage<ValueType> {
  public storageId: string
  private value: ValueType
  private channel?: BroadcastChannel

  constructor(id: string, initialValue: ValueType) {
    this.storageId = id
    const hydratedValue = this.hydrate()
    this.value = hydratedValue || initialValue
    this.channel = features.broadcastChannel
      ? new BroadcastChannel(id)
      : undefined

    if (features.broadcastChannel) {
      // Create a BroadcastChannel to sync the value updates between the clients.
      this.channel = new BroadcastChannel(this.storageId)
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
              this.broadcast(this.value)
              break
            }

            case 'UPDATE': {
              this.value = event.data.payload.nextValue

              // Persist the synced value, because each client keeps
              // the value in its own session storage. That way the
              // persistency layer auto-cleans itself when a client closes.
              this.persist()
              break
            }
          }
        },
      )

      // Request hydration from other opened clients to pull in the value
      // when there's no hydrated value in the current session.
      if (!hydratedValue) {
        this.postMessage('HYDRATE')
      }
    }
  }

  /**
   * Broadcast the current value to other clients to inherit it.
   */
  private broadcast(nextValue: ValueType) {
    this.postMessage('UPDATE', {
      nextValue,
    })
  }

  update(updater: (prevValue: ValueType) => ValueType) {
    const nextValue = updater(this.value)
    this.value = nextValue

    if (features.broadcastChannel) {
      this.persist()
      this.broadcast(this.value)
    }
  }

  getValue() {
    return this.value
  }

  private serialize(value: ValueType): string {
    return JSON.stringify(value)
  }

  private deserialize(serializedValue: string): ValueType {
    return JSON.parse(serializedValue)
  }

  /**
   * Flush the value into the persistency layer.
   */
  private persist() {
    if (features.sessionStorage) {
      sessionStorage.setItem(this.storageId, this.serialize(this.value))
    }
  }

  /**
   * Hydrate the value from the persistency layer.
   */
  private hydrate(): ValueType | null {
    if (features.sessionStorage) {
      const storedValue = sessionStorage.getItem(this.storageId)
      return storedValue ? this.deserialize(storedValue) : null
    }

    return this.value
  }

  private postMessage<
    MessageType extends keyof BroadcastChannelMessageType<ValueType>,
    MessagePayload extends BroadcastChannelMessageType<ValueType>[MessageType]
  >(
    type: MessageType,
    ...rest: MessagePayload extends never ? never : [MessagePayload]
  ) {
    if (!this.channel) {
      return
    }

    this.channel.postMessage({
      type,
      payload: rest[0],
    })
  }
}
