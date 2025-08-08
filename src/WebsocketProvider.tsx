import React, { useEffect, useState } from 'react'
import { socket, SocketContext } from './websocket'
import type { BallPosition, BallVelocity } from './physics.ts'

export type InboundEvent<T> = {
    id: number
    data: T
}

function useInboundEvent<T>(event: string): InboundEvent<T> | null {
    const [value, setValue] = useState<InboundEvent<T> | null>(null)

    useEffect(() => {
        function handler(data: T) {
            setValue({ data, id: Date.now() })
        }
        socket.on(event, handler)
        return () => {
            socket.off(event, handler)
        }
    }, [event])
    return value
}

export function SocketProvider(props: { children: React.ReactNode }) {
    const [isConnected, setIsConnected] = useState(false)
    const matchUpdateEvent = useInboundEvent<{
        position: string | null
        players: number
        other: string | null
        maxScore: number
    }>('MATCH_UPDATE')
    const ballLost = useInboundEvent<null>('BALL_LOST')
    const ballThrown = useInboundEvent<null>('BALL_THROWN')
    const ballCrossed = useInboundEvent<{
        position: BallPosition
        velocity: BallVelocity
    }>('BALL_CROSSED')

    const [playerPosition, setPlayerPosition] = useState<string | null>(null)
    const [currentMatch, setCurrentMatch] = useState<string | null>(null)
    const [name, setName] = useState<string | null>(null)
    const [otherPlayerName, setOtherPlayerName] = useState<string | null>(null)
    const [maxScore, setMaxScore] = useState<number | null>(null)
    const [, setGameStarted] = useState(false)
    const [opponentDisconnected, setOpponentDisconnected] = useState(false)
    const [gameComplete, setGameComplete] = useState<{ won: boolean } | null>(
        null
    )

    React.useEffect(() => {
        if (matchUpdateEvent?.data?.players === 2) {
            setPlayerPosition(matchUpdateEvent.data.position)
            setOtherPlayerName(matchUpdateEvent.data.other)
            setMaxScore(matchUpdateEvent.data.maxScore)
            setGameStarted(true)
            setGameComplete(null)
            setOpponentDisconnected(false)
        } else {
            setPlayerPosition(null)
            setOtherPlayerName(null)
            setMaxScore(null)
            setGameStarted((gs) => {
                if (gs) setOpponentDisconnected(true)
                return false
            })
            setGameComplete(null)
        }
    }, [matchUpdateEvent])

    async function joinMatch(match: string): Promise<void> {
        await socket.emitWithAck('JOIN_MATCH', match)
        setCurrentMatch(match)
    }

    async function registerName(name: string): Promise<void> {
        await socket.emitWithAck('SET_NAME', name)
        setName(name)
    }

    async function endMatch(won: boolean | null): Promise<void> {
        await socket.emitWithAck('END_MATCH')
        setCurrentMatch(null)
        setPlayerPosition(null)
        setOtherPlayerName(null)
        setMaxScore(null)
        setGameStarted(false)
        setGameComplete(won === null ? null : { won })
    }

    React.useEffect(() => {
        function onConnect() {
            setIsConnected(true)
        }

        function onDisconnect() {
            setIsConnected(false)
            setCurrentMatch(null)
            setPlayerPosition(null)
            setName(null)
            setOtherPlayerName(null)
            setMaxScore(null)
            setOpponentDisconnected(false)
            setGameStarted(false)
            setGameComplete(null)
        }

        socket.on('connect', onConnect)
        socket.on('disconnect', onDisconnect)

        return () => {
            socket.off('connect', onConnect)
            socket.off('disconnect', onDisconnect)
        }
    }, [])
    return (
        <SocketContext.Provider
            value={{
                isConnected,
                playerPosition,
                ballLost,
                ballThrown,
                ballCrossed,
                joinMatch,
                currentMatch,
                registerName,
                name,
                otherPlayerName,
                maxScore,
                endMatch,
                opponentDisconnected,
                setOpponentDisconnected,
                gameComplete,
                setGameComplete,
                socket: socket,
            }}
        >
            {props.children}
        </SocketContext.Provider>
    )
}
