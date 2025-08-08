import { createContext } from 'react'

const params = {
    racketWidthRatio: 0.02,
    racketHeightRatio: 0.15,
    ballSizeRatio: 0.03,
    paddingRightRatio: 0.01,
    baseVelocity: 1000,
    racketScrollWidthRatio: 0.35,
    ballRacketMarginPx: 20,
    racketDeviationCoefficient: 0.2,
    minShootingAngle: 0.5,
}

export type BallPosition = {
    top: number
    left: number
}

export type BallVelocity = {
    x: number
    y: number
}

export type BallConstraints = {
    minTop: number
    maxTop: number
    minLeft: number
    maxLeft: number
    size: number
}

export type RacketPosition = {
    top: number
    bottom: number
}

export function moveBall(
    position: BallPosition,
    velocity: BallVelocity,
    ms: number,
    ballConstraints: BallConstraints,
    isLeftPlayer: boolean,
    racketPosition: RacketPosition,
    bounce: boolean,
    sendToOpponent: (pos: BallPosition, vel: BallVelocity) => void,
    onBallHit: () => void = () => {},
    onBallBounce: () => void = () => {},
    onBallLost: () => void = () => {}
): { position: BallPosition; velocity: BallVelocity; bounce: boolean } {
    let newTop = position.top + (params.baseVelocity * velocity.y * ms) / 1000
    const newLeft =
        position.left + (params.baseVelocity * velocity.x * ms) / 1000

    const newBottom = newTop + ballConstraints.size

    if (!bounce) {
        return { position: { top: newTop, left: newLeft }, velocity, bounce }
    }

    const ballEnteringRacketEdge =
        (!isLeftPlayer && newLeft > ballConstraints.maxLeft) ||
        (isLeftPlayer && newLeft < ballConstraints.minLeft)

    const ballEnteringMiddleEdge =
        (isLeftPlayer && newLeft > ballConstraints.maxLeft) ||
        (!isLeftPlayer && newLeft < ballConstraints.minLeft)

    if (ballEnteringRacketEdge) {
        if (
            newTop < racketPosition.top - params.ballRacketMarginPx ||
            newBottom > racketPosition.bottom + params.ballRacketMarginPx
        ) {
            onBallLost()
            return {
                position: { top: newTop, left: newLeft },
                velocity,
                bounce: false,
            }
        } else {
            onBallHit()
            const randomVelocityShift =
                (Math.random() * 2 - 1) * params.racketDeviationCoefficient
            velocity.y = Math.max(
                Math.min(velocity.y + randomVelocityShift, 0.9),
                -0.9
            )
            velocity.x =
                Math.sqrt(1 - Math.pow(velocity.y, 2)) *
                Math.sign(velocity.x) *
                -1
        }
    } else if (ballEnteringMiddleEdge) {
        sendToOpponent(
            { top: newTop, left: newLeft },
            { x: velocity.x, y: velocity.y }
        )
        return {
            position: { top: newTop, left: newLeft },
            velocity,
            bounce: false,
        }
    }

    if (newTop < ballConstraints.minTop) {
        onBallBounce()
        newTop = ballConstraints.minTop
        velocity.y = -velocity.y
    } else if (newTop > ballConstraints.maxTop) {
        onBallBounce()
        newTop = ballConstraints.maxTop
        velocity.y = -velocity.y
    }

    return { position: { top: newTop, left: newLeft }, velocity, bounce: true }
}

export function computePhysicsParams() {
    const racketWidth = params.racketWidthRatio * window.innerWidth
    const racketHeight = params.racketHeightRatio * window.innerHeight
    const ballSize = params.ballSizeRatio * window.innerWidth
    const minRacketTop = 0
    const maxRacketTop = window.innerHeight - racketHeight
    const paddingRight = params.paddingRightRatio * window.innerWidth
    const racketScrollWidth = params.racketScrollWidthRatio * window.innerWidth
    const ballSpaceWidth = window.innerWidth - racketWidth - paddingRight

    const minBallTop = 0
    const minBallLeft = 0
    const maxBallTop = window.innerHeight - ballSize
    const maxBallLeft = ballSpaceWidth - ballSize

    return {
        racketWidth,
        racketHeight,
        ballSize,
        minRacketTop,
        maxRacketTop,
        paddingRight,
        racketScrollWidth,
        ballSpaceWidth,
        ballConstraints: {
            minTop: minBallTop,
            maxTop: maxBallTop,
            minLeft: minBallLeft,
            maxLeft: maxBallLeft,
            size: ballSize,
        },
        minShootingAngle: params.minShootingAngle,
    }
}

export type PhysicsContextValue = ReturnType<typeof computePhysicsParams>

export const PhysicsContext = createContext(computePhysicsParams())
