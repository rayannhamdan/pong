import React, { useState } from 'react'
import { ThemeProvider } from '@mui/material'
import { darkTheme, lightTheme } from './theme.ts'
import { ThemeSwitcherContext } from './themeSwitcherContext.ts'

export function ThemeSwitcherProvider({
    children,
}: {
    children: React.ReactNode
}) {
    const [dark, setDark] = useState(true)
    return (
        <ThemeSwitcherContext.Provider value={{ dark, setDark }}>
            <ThemeProvider theme={dark ? darkTheme : lightTheme}>
                {children}
            </ThemeProvider>
        </ThemeSwitcherContext.Provider>
    )
}
