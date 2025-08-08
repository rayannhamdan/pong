import React, { useContext, useEffect, useMemo, useRef, useState } from 'react'

import { SocketContext } from './websocket.ts'
import {
    type BallPosition,
    type BallVelocity,
    moveBall,
    PhysicsContext,
    type PhysicsContextValue,
} from './physics.ts'
import { Racket } from './Racket.tsx'
import { RacketScroll } from './RacketScroll.tsx'
import { Ball } from './Ball.tsx'
import { useRegisterInboundEventProcessor } from './eventProcessor.ts'
import type { Socket } from 'socket.io-client'
import { ScoreBoard } from './ScoreBoard.tsx'
import Box from '@mui/material/Box'
import useSound from 'use-sound'

type BallAndRacketPhysics = {
    position: BallPosition
    velocity: BallVelocity
    bounce: boolean
    racketPosition: number
}

function racketAndBallPositionForService(
    physics: PhysicsContextValue
): BallAndRacketPhysics {
    return {
        position: { top: 0, left: 0 },
        velocity: { x: Math.sqrt(0.5), y: Math.sqrt(0.5) },
        bounce: true,
        racketPosition: (physics.minRacketTop + physics.maxRacketTop) / 2,
    }
}

export function Game({
    isLeftPlayer,
    name,
    otherPlayerName,
    endMatch,
    maxScore,
}: {
    isLeftPlayer: boolean
    name: string
    otherPlayerName: string
    endMatch: (a: boolean) => Promise<void>
    maxScore: number
}) {
    const [ballHitSound] = useSound(
        './sounds/Soccer-ball-being-solidly-kicked-grass.mp3'
    )
    const [gameBeginSound] = useSound('./sounds/ready-fight-37973.mp3')
    const [ballBounceSound] = useSound('./sounds/Cartoon-boing.mp3')
    const [ballLostSound] = useSound('./sounds/Disappointed-male-reaction.mp3')
    const [ballWonSound] = useSound('./sounds/Crowd-reaction-yeah.mp3')
    const [ballServeSound] = useSound('./sounds/Strong-tennis-serve.mp3')
    const [opponentBallServeSound] = useSound(
        './sounds/Strong-tennis-serve.mp3',
        { volume: 0.5 }
    )
    const physics = useContext(PhysicsContext)
    const physicsRef = useRef(physics)

    const [ownScore, setOwnScore] = useState(0)
    const [opponentScore, setOpponentScore] = useState(0)

    React.useEffect(() => {
        physicsRef.current = physics
    }, [physics])

    const [ballAndRacketPhysics, setBallAndRacketPhysics] = useState(
        racketAndBallPositionForService(physics)
    )
    const [inRound, setInRound] = useState(false)
    const [ballOnOpponentSide, setBallOnOpponentSide] = useState(false)

    const { socket, ballCrossed, ballThrown, ballLost } =
        useContext(SocketContext)
    const ballUpdateInterval = 10

    // At start of game
    useEffect(() => {
        if (!otherPlayerName) return
        gameBeginSound()
        beforeNextRound(isLeftPlayer)
        setOwnScore(0)
        setOpponentScore(0)
    }, [isLeftPlayer, otherPlayerName, gameBeginSound])

    function onRoundEnd(won: boolean): void {
        if (won) {
            setOwnScore((score) => score + 1)
        } else {
            setOpponentScore((score) => score + 1)
        }
        setInRound(false)
    }

    function onRoundStart(): void {
        setInRound(true)
    }

    useEffect(() => {
        if (!maxScore) return
        if (ownScore === maxScore || opponentScore === maxScore) {
            endMatch(ownScore === maxScore)
        }
    }, [ownScore, opponentScore, maxScore, endMatch])

    function beforeNextRound(shouldStart: boolean): void {
        setBallOnOpponentSide(!shouldStart)
    }

    function sendBallToOpponentSide(
        position: BallPosition,
        velocity: BallVelocity,
        socket: Socket
    ) {
        setBallOnOpponentSide(true)
        position.top = position.top / window.innerHeight
        socket.emit('BALL_CROSSED', { position, velocity })
    }

    // Constantly
    useEffect(() => {
        const id = setInterval(() => {
            if (ballOnOpponentSide) return
            if (inRound) {
                setBallAndRacketPhysics((ballPhys) => ({
                    ...moveBall(
                        ballPhys.position,
                        ballPhys.velocity,
                        ballUpdateInterval,
                        physics.ballConstraints,
                        isLeftPlayer,
                        {
                            top: ballPhys.racketPosition,
                            bottom:
                                ballPhys.racketPosition + physics.racketHeight,
                        },
                        ballPhys.bounce,
                        (position, velocity) =>
                            sendBallToOpponentSide(position, velocity, socket),
                        ballHitSound,
                        ballBounceSound,
                        ballLostSound
                    ),
                    racketPosition: ballPhys.racketPosition,
                }))
            } else {
                setBallAndRacketPhysics((ballPhys) => ({
                    position: {
                        top:
                            ballPhys.racketPosition +
                            physics.racketHeight / 2 -
                            physics.ballSize / 2,
                        left: isLeftPlayer
                            ? physics.ballConstraints.minLeft
                            : physics.ballConstraints.maxLeft,
                    },
                    velocity: ballPhys.velocity,
                    bounce: ballPhys.bounce,
                    racketPosition: ballPhys.racketPosition,
                }))
            }
        }, ballUpdateInterval)
        return () => clearInterval(id)
    }, [
        physics,
        inRound,
        isLeftPlayer,
        ballOnOpponentSide,
        socket,
        ballHitSound,
        ballBounceSound,
        ballLostSound,
    ])

    const onBallReceived = useMemo<
        (data: { position: BallPosition; velocity: BallVelocity }) => void
    >(
        () => (data: { position: BallPosition; velocity: BallVelocity }) => {
            setBallOnOpponentSide(false)
            const newPosition = {
                top: data.position.top,
                left: data.position.left,
            }
            if (isLeftPlayer) {
                newPosition.left = physics.ballConstraints.maxLeft
            } else {
                newPosition.left = physics.ballConstraints.minLeft
            }
            newPosition.top = data.position.top * window.innerHeight
            setBallAndRacketPhysics((ballPhys) => ({
                ...ballPhys,
                position: newPosition,
                velocity: data.velocity,
                bounce: true,
            }))
            setInRound(true)
        },
        [isLeftPlayer, physics.ballConstraints]
    )

    const onOpponentBallLost = useMemo<() => void>(() => {
        return () => {
            ballWonSound()
            onRoundEnd(true)
        }
    }, [ballWonSound])

    const onOpponentBallThrown = useMemo<() => void>(() => {
        return () => {
            opponentBallServeSound()
            onRoundStart()
        }
    }, [opponentBallServeSound])

    // On loss
    useEffect(() => {
        if (
            ballAndRacketPhysics.bounce ||
            ballOnOpponentSide ||
            !physicsRef.current
        )
            return
        socket.emit('BALL_LOST')
        setTimeout(() => {
            setBallAndRacketPhysics(
                racketAndBallPositionForService(physicsRef.current)
            )
            onRoundEnd(false)
        }, 500)
    }, [ballAndRacketPhysics.bounce, socket, ballOnOpponentSide, physicsRef])

    function throwBall(x: number, y: number) {
        ballServeSound()
        setBallAndRacketPhysics((ballPhys) => ({
            ...ballPhys,
            velocity: {
                x: x / Math.sqrt(x * x + y * y),
                y: y / Math.sqrt(x * x + y * y),
            },
            bounce: true,
        }))
        socket.emit('BALL_THROWN')
        onRoundStart()
    }

    // On ball received
    useRegisterInboundEventProcessor(ballCrossed, onBallReceived)
    useRegisterInboundEventProcessor(ballThrown, onOpponentBallThrown)
    useRegisterInboundEventProcessor(ballLost, onOpponentBallLost)

    const BallComponent = (
        <Box
            sx={{
                width: `${physics.ballSpaceWidth}px`,
                height: '100%',
                visibility: ballOnOpponentSide ? 'hidden' : 'visible',
            }}
        >
            <Ball position={ballAndRacketPhysics.position} />
        </Box>
    )

    return (
        <Box
            sx={{
                position: 'relative',
                display: 'flex',
                flexDirection: 'row',
                height: '100%',
                paddingRight: isLeftPlayer ? 0 : `${physics.paddingRight}px`,
                paddingLeft: isLeftPlayer ? `${physics.paddingRight}px` : 0,
            }}
        >
            {isLeftPlayer ? (
                <Racket top={ballAndRacketPhysics.racketPosition} />
            ) : (
                BallComponent
            )}
            {isLeftPlayer ? (
                BallComponent
            ) : (
                <Racket top={ballAndRacketPhysics.racketPosition} />
            )}
            <RacketScroll
                setNewTop={(top: number) =>
                    setBallAndRacketPhysics((props) => ({
                        ...props,
                        racketPosition: top,
                    }))
                }
                top={ballAndRacketPhysics.racketPosition}
                canShoot={!inRound && !ballOnOpponentSide}
                throwBall={throwBall}
                isLeftPlayer={isLeftPlayer}
            />
            <ScoreBoard
                isLeftPlayer={isLeftPlayer}
                name={name}
                score={ownScore}
                opponentScore={opponentScore}
                opponentName={otherPlayerName}
            />
        </Box>
    )
}
