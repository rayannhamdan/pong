import { useEffect, useRef } from 'react'
import type { InboundEvent } from './WebsocketProvider.tsx'

export function useRegisterInboundEventProcessor<T>(
    data: InboundEvent<T>,
    handler: (args: T) => void
) {
    const lastProcessedId = useRef<number>(0)
    useEffect(() => {
        if (!data || lastProcessedId.current === data.id) return
        lastProcessedId.current = data.id
        handler(data.data)
    }, [data, handler])
}
