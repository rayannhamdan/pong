import React, { useEffect, useState } from 'react'
import { computePhysicsParams, PhysicsContext } from './physics.ts'

export function PhysicsProvider(props: { children: React.ReactNode }) {
    const [windowWidth, setWindowWidth] = useState(window.innerWidth)
    const [windowHeight, setWindowHeight] = useState(window.innerHeight)
    const [params, setParams] = useState(computePhysicsParams())

    useEffect(() => {
        const handleResize = () => {
            setParams(computePhysicsParams())
            setWindowWidth(window.innerWidth)
            setWindowHeight(window.innerHeight)
        }

        window.addEventListener('resize', handleResize)
        return () => {
            window.removeEventListener('resize', handleResize)
        }
    }, [windowWidth, windowHeight])

    return (
        <PhysicsContext.Provider value={params}>
            {props.children}
        </PhysicsContext.Provider>
    )
}
