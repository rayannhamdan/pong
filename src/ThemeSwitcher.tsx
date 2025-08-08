import { useContext } from 'react'
import { ThemeSwitcherContext } from './themeSwitcherContext.ts'
import Switch from '@mui/material/Switch'
import Box from '@mui/material/Box'
import { Typography } from '@mui/material'
import useSound from 'use-sound'

export function ThemeSwitcher() {
    const { dark, setDark } = useContext(ThemeSwitcherContext)
    const [switchSound] = useSound('./sounds/light-switch-on-382714.mp3')
    return (
        <Box
            sx={{
                position: 'fixed',
                bottom: 0,
                width: '100%',
                display: 'flex',
                zIndex: 10000,
            }}
        >
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    margin: 'auto',
                }}
            >
                <Typography>Light</Typography>
                <Switch
                    checked={dark}
                    onChange={(e) => {
                        switchSound()
                        setDark(e.target.checked)
                    }}
                />
                <Typography>Dark</Typography>
            </Box>
        </Box>
    )
}
