import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import { useState } from 'react'
import { useMediaQuery, useTheme } from '@mui/material'

export default function SetNameModal(props: {
    defaultName: string | null
    setName: (a: string) => Promise<void>
    open: boolean
}) {
    const [loading, setLoading] = useState(false)
    const [inputName, setInputName] = useState('')
    const theme = useTheme()
    const fullWidth = useMediaQuery(theme.breakpoints.down('sm'))
    return (
        <Dialog open={props.open} fullWidth={fullWidth}>
            <DialogTitle>Choose a name, player!</DialogTitle>
            <DialogContent>
                <form
                    onSubmit={async (e) => {
                        setLoading(true)
                        e.preventDefault()
                        await props.setName(inputName)
                        setLoading(false)
                    }}
                    id="set-name-form"
                >
                    <TextField
                        autoFocus
                        required
                        margin="dense"
                        id="name"
                        name="name"
                        label="Name"
                        defaultValue={props.defaultName}
                        type="name"
                        fullWidth
                        variant="standard"
                        value={inputName}
                        onChange={(e) => setInputName(e.target.value)}
                    />
                </form>
            </DialogContent>
            <DialogActions>
                <Button
                    type="submit"
                    form="set-name-form"
                    loading={loading}
                    disabled={!inputName}
                >
                    Choose name
                </Button>
            </DialogActions>
        </Dialog>
    )
}
