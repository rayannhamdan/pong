import { useContext, useState } from 'react'
import { PhysicsContext } from './physics.ts'
import Box from '@mui/material/Box'

export function RacketScroll(props: {
    setNewTop: (position: number) => void
    top: number
    canShoot: boolean
    throwBall: (x: number, y: number) => void
    isLeftPlayer: boolean
}) {
    const [yPosition, setyPosition] = useState(0)
    const [shootYPosition, setShootYPosition] = useState(0)
    const [shootXPosition, setShootXPosition] = useState(0)
    const [shootable, setShootable] = useState(false)
    const [movable, setMovable] = useState(false)

    const physics = useContext(PhysicsContext)

    function resetShoot() {
        setShootable(false)
    }

    function onMouseOrTouchDown(x: number, y: number): void {
        {
            setMovable(true)
            setShootable(true)
            setyPosition(y)
            setShootXPosition(x)
            setShootYPosition(y)
        }
    }

    function onMouseOrTouchMove(y: number): void {
        if (!movable) return
        const topDiff = y - yPosition
        const newTop = Math.max(
            Math.min(props.top + topDiff, physics.maxRacketTop),
            physics.minRacketTop
        )
        props.setNewTop(newTop)
        setyPosition(y)
    }

    function onMouseOrTouchUp(): void {
        setMovable(false)
        resetShoot()
    }

    function onMouseOrTouchLeave(x: number, y: number): void {
        setMovable(false)
        if (!shootable || !props.canShoot) return
        const topDiff = y - shootYPosition
        const leftDiff = x - shootXPosition

        const shouldShoot =
            ((props.isLeftPlayer && leftDiff > 0) ||
                (!props.isLeftPlayer && leftDiff < 0)) &&
            Math.abs(leftDiff / topDiff) > physics.minShootingAngle

        if (shouldShoot) {
            props.throwBall(leftDiff, topDiff)
        }
        resetShoot()
    }

    let styleProps = {
        width: props.canShoot
            ? physics.racketScrollWidth
            : physics.racketScrollWidth / 2,
        height: '100%',
        position: 'absolute',
        zIndex: 1000000,
    }

    if (props.isLeftPlayer) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        styleProps = { ...styleProps, left: 0 }
    } else {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        styleProps = { ...styleProps, right: 0 }
    }

    return (
        <Box
            sx={styleProps}
            onMouseDown={(e) => onMouseOrTouchDown(e.pageX, e.pageY)}
            onTouchStart={(e) => {
                onMouseOrTouchDown(e.touches[0].pageX, e.touches[0].pageY)
            }}
            onTouchMove={(e) => {
                onMouseOrTouchMove(e.touches[0].pageY)
            }}
            onMouseMove={(e) => onMouseOrTouchMove(e.pageY)}
            onMouseUp={() => onMouseOrTouchUp()}
            onTouchCancel={() => onMouseOrTouchUp()}
            onTouchEnd={(e) => {
                onMouseOrTouchLeave(
                    e.changedTouches[0].pageX,
                    e.changedTouches[0].pageY
                )
            }}
            onMouseLeave={(e) => onMouseOrTouchLeave(e.pageX, e.pageY)}
        />
    )
}
