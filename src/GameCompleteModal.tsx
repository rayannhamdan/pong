import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Button from '@mui/material/Button'
import { useMediaQuery, useTheme } from '@mui/material'
import DialogContentText from '@mui/material/DialogContentText'
import useSound from 'use-sound'
import { useEffect } from 'react'

export default function GameCompleteModal({
    name,
    won,
    handleClose,
    open,
}: {
    name: string
    won: boolean
    handleClose: () => Promise<void>
    open: boolean
}) {
    const [winGameSound] = useSound(
        './sounds/Elderly-man-happy-cheers-and-applause.mp3'
    )
    const [lostGameSound] = useSound('./sounds/Kid-disappointed-grunt.mp3')

    useEffect(() => {
        if (open && won) {
            setTimeout(winGameSound, 500)
        }
        if (open && !won) {
            setTimeout(lostGameSound, 500)
        }
    }, [open, won, winGameSound, lostGameSound])

    const theme = useTheme()
    const fullWidth = useMediaQuery(theme.breakpoints.down('sm'))
    return (
        <Dialog open={open} onClose={handleClose} fullWidth={fullWidth}>
            {won ? (
                <DialogTitle>Congratz {name}, you won! 🎉</DialogTitle>
            ) : (
                <DialogTitle>
                    Ah schaaaaade {name}, you got your ass kicked! 👞🍑
                </DialogTitle>
            )}
            {won ? (
                <DialogContent>
                    <DialogContentText>
                        Well{' '}
                        <strong style={{ color: theme.palette.text.primary }}>
                            {name}
                        </strong>
                        , hope you are doing even better now!
                        <br />
                        This day just keeps on giving, doesn't it? 😊
                    </DialogContentText>
                </DialogContent>
            ) : (
                <DialogContent>
                    <DialogContentText>
                        Hey{' '}
                        <strong style={{ color: theme.palette.text.primary }}>
                            {name}
                        </strong>
                        , hope you're not forgetting that today is a beautiful
                        day!
                        <br />
                        Your self-worth is not defined by this silly (and poorly
                        coded) game.
                        <br />
                        You are worthy, you deserve the best!☀️
                    </DialogContentText>
                </DialogContent>
            )}
            <DialogActions>
                <Button onClick={handleClose}>Close</Button>
            </DialogActions>
        </Dialog>
    )
}
