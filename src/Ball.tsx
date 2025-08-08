import { type BallPosition, PhysicsContext } from './physics.ts'
import { useContext } from 'react'
import Box from '@mui/material/Box'

export function Ball(props: { position: BallPosition }) {
    const physics = useContext(PhysicsContext)

    return (
        <Box
            sx={{
                width: physics.ballSize,
                height: physics.ballSize,
                top: props.position.top,
                left: props.position.left,
                borderRadius: '50%',
                backgroundColor: 'primary.main',
                position: 'relative',
            }}
        />
    )
}
