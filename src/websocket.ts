import React from 'react'
import { io, Socket } from 'socket.io-client'

export const socket = io(`ws://${window.location.hostname}:5001`)

export const SocketContext = React.createContext<{
    isConnected: boolean
    playerPosition: string | null
    socket: Socket
    [key: string]: any
}>({
    isConnected: false,
    playerPosition: null,
    otherPlayerIsPlaying: false,
    socket,
})
