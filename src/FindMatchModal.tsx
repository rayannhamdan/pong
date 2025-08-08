import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import List from '@mui/material/List'
import React, { useContext, useState } from 'react'
import { SocketContext } from './websocket.ts'
import ListItem from '@mui/material/ListItem'
import IconButton from '@mui/material/IconButton'
import type { Socket } from 'socket.io-client'
import LoginIcon from '@mui/icons-material/Login'
import ListItemText from '@mui/material/ListItemText'
import CircularProgress from '@mui/material/CircularProgress'
import ListSubheader from '@mui/material/ListSubheader'
import RefreshIcon from '@mui/icons-material/Refresh'
import { Typography, useMediaQuery, useTheme } from '@mui/material'
import Box from '@mui/material/Box'

type Match = {
    match: string
    players: string[]
}

export default function FindMatchModal({
    open,
    name,
    joinMatch,
}: {
    name: string
    joinMatch: (a: string) => Promise<string>
    open: boolean
}) {
    const theme = useTheme()
    const fullWidth = useMediaQuery(theme.breakpoints.down('sm'))
    const { socket } = useContext(SocketContext)
    const [availableMatches, setAvailableMatches] = useState<Match[]>([])
    const [loadingMatches, setLoadingMatches] = useState(false)

    const [loadingJoinMatch, setLoadingJoinMatch] = useState(false)
    const [matchPendingJoin, setMatchPendingJoin] = useState<string | null>(
        null
    )

    const [inputMatch, setInputMatch] = useState('')

    async function getMatches(socket: Socket) {
        setLoadingMatches(true)
        const matches = await socket.emitWithAck('GET_MATCHES')
        setAvailableMatches(matches)
        setLoadingMatches(false)
    }

    async function attemptJoinMatch(match: string) {
        if (loadingJoinMatch) return
        setLoadingJoinMatch(true)
        setMatchPendingJoin(match)
        await joinMatch(match)
        setLoadingJoinMatch(false)
        setMatchPendingJoin(null)
    }

    React.useEffect(() => {
        if (!open) return
        setMatchPendingJoin(null)
        getMatches(socket)
    }, [open, socket])

    return (
        <Dialog open={open} fullWidth={fullWidth} fullScreen={fullWidth}>
            <DialogTitle>Find a match, {name}!</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    Hiii{' '}
                    <strong style={{ color: theme.palette.text.primary }}>
                        {name}
                    </strong>
                    , hope things are going great for you!
                    <br />
                    Welcome to the game that is going viral in 2025!
                    <br />
                    You can find a match in the list below or create new one.
                </DialogContentText>
                <List
                    subheader={
                        <ListSubheader
                            component="div"
                            id="nested-list-subheader"
                            disableGutters
                        >
                            <Box
                                sx={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                }}
                            >
                                <Typography>Available matches ⬇️</Typography>
                                <IconButton
                                    onClick={async () =>
                                        await getMatches(socket)
                                    }
                                    loading={loadingMatches}
                                    size="small"
                                >
                                    <RefreshIcon />
                                </IconButton>
                            </Box>
                        </ListSubheader>
                    }
                >
                    {loadingMatches ? (
                        <CircularProgress
                            style={{ margin: 'auto', display: 'block' }}
                        />
                    ) : availableMatches.length > 0 ? (
                        availableMatches
                            .filter((m) => m.players.length < 2)
                            .map((match) => (
                                <ListItem
                                    key={match.match}
                                    secondaryAction={
                                        <IconButton
                                            aria-label="comment"
                                            loading={
                                                loadingJoinMatch &&
                                                match.match === matchPendingJoin
                                            }
                                            disabled={
                                                loadingJoinMatch &&
                                                match.match !== matchPendingJoin
                                            }
                                        >
                                            <LoginIcon
                                                onClick={async () =>
                                                    await attemptJoinMatch(
                                                        match.match
                                                    )
                                                }
                                            />
                                        </IconButton>
                                    }
                                >
                                    <ListItemText>
                                        {match.match} -{' '}
                                        {match.players.join(',')}
                                    </ListItemText>
                                </ListItem>
                            ))
                    ) : (
                        <ListItem>
                            <ListItemText secondary="No matches found, create a new one!" />
                        </ListItem>
                    )}
                </List>
                <form
                    onSubmit={async (e) => {
                        e.preventDefault()
                        await attemptJoinMatch(inputMatch)
                        setInputMatch('')
                    }}
                    id="create-match-form"
                >
                    <TextField
                        autoFocus
                        required
                        margin="dense"
                        id="matchName"
                        name="matchName"
                        label="New match name"
                        type="matchName"
                        fullWidth
                        variant="standard"
                        value={inputMatch}
                        onChange={(e) => setInputMatch(e.target.value)}
                    />
                </form>
            </DialogContent>
            <DialogActions>
                <Button
                    type="submit"
                    form="create-match-form"
                    loading={loadingJoinMatch}
                    disabled={!inputMatch}
                >
                    Create match
                </Button>
            </DialogActions>
        </Dialog>
    )
}
