import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Button from '@mui/material/Button'
import { DotPulse } from './DotPulse.tsx'
import { useState } from 'react'
import { useMediaQuery, useTheme } from '@mui/material'
import DialogContentText from '@mui/material/DialogContentText'

export default function WaitingForOpponentModal({
    name,
    match,
    leaveMatch,
    open,
}: {
    name: string
    match: string
    leaveMatch: () => Promise<void>
    open: boolean
}) {
    const theme = useTheme()
    const fullWidth = useMediaQuery(theme.breakpoints.down('sm'))
    const [loading, setLoading] = useState(false)
    return (
        <Dialog open={open} fullWidth={fullWidth}>
            <DialogTitle>Waiting for a worthy opponent to join!</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    Hey{' '}
                    <strong style={{ color: theme.palette.text.primary }}>
                        {name}
                    </strong>
                    , hope you are having a fantastic day!
                    <br />
                    Please wait until an opponent dares to fight you!
                    <br />
                    Your match is called:{' '}
                    <strong style={{ color: theme.palette.text.primary }}>
                        {match}
                    </strong>
                </DialogContentText>
                <DotPulse />
            </DialogContent>
            <DialogActions>
                <Button
                    onClick={async (e) => {
                        e.preventDefault()
                        setLoading(true)
                        await leaveMatch()
                        setLoading(false)
                    }}
                    loading={loading}
                >
                    Leave match
                </Button>
            </DialogActions>
        </Dialog>
    )
}
