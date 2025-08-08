import './DotPulse.css'
import Box from '@mui/material/Box'

export function DotPulse() {
    return (
        <Box className="container">
            <Box
                className="dot-pulse"
                sx={{ color: 'primary.main', backgroundColor: 'primary.main' }}
            />
        </Box>
    )
}
