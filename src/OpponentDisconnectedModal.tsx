import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Button from '@mui/material/Button'
import { useMediaQuery, useTheme } from '@mui/material'
import DialogContentText from '@mui/material/DialogContentText'
import useSound from 'use-sound'
import { useEffect } from 'react'

export default function OpponentDisconnectedModal({
    open,
    name,
    handleClose,
}: {
    name: string
    handleClose: () => void
    open: boolean
}) {
    const theme = useTheme()
    const fullWidth = useMediaQuery(theme.breakpoints.down('sm'))
    const [opponentDisconnectedSound] = useSound(
        './sounds/Chicken-clucking.mp3'
    )

    useEffect(() => {
        if (open) {
            opponentDisconnectedSound()
        }
    }, [open, opponentDisconnectedSound])

    return (
        <Dialog open={open} onClose={handleClose} fullWidth={fullWidth}>
            <DialogTitle>Your opponent was disconnected!</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    Hey{' '}
                    <strong style={{ color: theme.palette.text.primary }}>
                        {name}
                    </strong>
                    , hope you are doing very well!
                    <br />
                    It looks like your opponent disconnected from the game,
                    schade 😞.
                    <br />
                    Or they chickened out 🐥, who knows!
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>Close</Button>
            </DialogActions>
        </Dialog>
    )
}
