import React, { useContext } from 'react'
import { PhysicsContext } from './physics.ts'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import Slide from '@mui/material/Slide'

function ScoreCounter({
    score,
    ref,
}: {
    score: number
    ref: HTMLElement | null
}) {
    return (
        <Slide
            key={score}
            in={!!ref}
            direction="up"
            container={ref}
            timeout={1000}
        >
            <Typography variant="h6" component="p">
                {score}
            </Typography>
        </Slide>
    )
}

export function ScoreBoard({
    isLeftPlayer,
    name,
    score,
    opponentName,
    opponentScore,
}: {
    isLeftPlayer: boolean
    name: string
    score: number
    opponentName: string
    opponentScore: number
}) {
    const physics = useContext(PhysicsContext)
    const containerRef = React.useRef<HTMLElement>(null)

    const leftName = isLeftPlayer ? name : opponentName
    const rightName = isLeftPlayer ? opponentName : name
    const leftScore = isLeftPlayer ? score : opponentScore
    const rightScore = isLeftPlayer ? opponentScore : score
    return (
        <Box
            sx={{
                position: 'absolute',
                display: 'flex',
                width: physics.ballSpaceWidth + physics.racketWidth,
                justifyContent: 'center',
                paddingLeft: `${isLeftPlayer ? 0 : physics.paddingRight}px`,
                paddingRight: `${isLeftPlayer ? physics.paddingRight : 0}px`,
            }}
        >
            <Box>
                <Typography variant="h6" component="p">
                    {leftName}
                </Typography>
            </Box>
            <Box
                sx={{
                    marginLeft: 5,
                    marginRight: 5,
                    display: 'flex',
                    alignItems: 'center',
                }}
                ref={containerRef}
            >
                <ScoreCounter score={leftScore} ref={containerRef.current} />
                <Divider
                    sx={{
                        marginRight: 2,
                        marginLeft: 2,
                        borderWidth: 5,
                        borderColor: 'text.primary',
                    }}
                    orientation="vertical"
                    flexItem
                    variant="middle"
                />
                <ScoreCounter score={rightScore} ref={containerRef.current} />
            </Box>
            <Box>
                <Typography variant="h6" component="p">
                    {rightName}
                </Typography>
            </Box>
        </Box>
    )
}
