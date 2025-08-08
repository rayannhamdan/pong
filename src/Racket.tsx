import Box from '@mui/material/Box'

export function Racket(props: { top: number }) {
    return (
        <Box
            sx={{
                height: '15%',
                width: '2%',
                top: props.top,
                position: 'sticky',
                backgroundColor: 'primary.main',
            }}
        />
    )
}
