import { createContext } from 'react'

export const ThemeSwitcherContext = createContext<{
    dark: boolean
    setDark: (a: boolean) => void
}>({ dark: true, setDark: () => {} })
