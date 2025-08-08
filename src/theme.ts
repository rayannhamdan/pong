import { createTheme, responsiveFontSizes } from '@mui/material'
import { blue, red } from '@mui/material/colors'

const baseThemeOptions = {
    typography: {
        htmlFontSize: 16,
        fontFamily: 'Bold Pixels',
    },
    colorSchemes: {
        dark: {
            palette: {
                primary: { main: '#fff', contrastText: 'rgba(0, 0, 0, 0.87)' },
                secondary: {
                    main: blue[300],
                    contrastText: 'rgba(0, 0, 0, 0.87)',
                },
                background: {
                    paper: '#101010',
                    default: '#242424',
                },
                text: {
                    primary: '#fff',
                    secondary: 'rgba(255, 255, 255, 0.7)',
                    disabled: 'rgba(255, 255, 255, 0.5)',
                },
                divider: 'rgba(255, 255, 255, 0.12)',
            },
        },
        light: {
            palette: {
                primary: { main: blue[900], contrastText: 'white' },
                secondary: { main: red[300], contrastText: 'white' },
                background: {
                    paper: '#fff',
                    default: '#fafafa',
                },
                text: {
                    primary: 'rgba(0, 0, 0, 0.87)',
                    secondary: 'rgba(0, 0, 0, 0.6)',
                    disabled: 'rgba(0, 0, 0, 0.38)',
                },
                divider: 'rgba(0, 0, 0, 0.12)',
            },
        },
    },
}

const darkTheme = responsiveFontSizes(
    createTheme({
        ...baseThemeOptions,
        palette: {
            ...baseThemeOptions.colorSchemes.dark.palette,
            mode: 'dark',
        },
        colorSchemes: undefined,
    })
)
const lightTheme = responsiveFontSizes(
    createTheme({
        ...baseThemeOptions,
        palette: baseThemeOptions.colorSchemes.light.palette,
        colorSchemes: undefined,
    })
)
export { darkTheme, lightTheme }
