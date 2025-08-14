import { useContext } from 'react'

import './App.css'
import { SocketProvider } from './WebsocketProvider.tsx'
import { SocketContext } from './websocket.ts'
import { Game } from './Game.tsx'
import { PhysicsProvider } from './PhysicsProvider.tsx'
import SetNameModal from './SetNameModal.tsx'
import FindMatchModal from './FindMatchModal.tsx'
import WaitingForOpponentModal from './WaitingForOpponentModal.tsx'
import OpponentDisconnectedModal from './OpponentDisconnectedModal.tsx'
import GameCompleteModal from './GameCompleteModal.tsx'
import { CssBaseline } from '@mui/material'
import { ThemeSwitcherProvider } from './ThemeSwitcherProvider.tsx'
import { ThemeSwitcher } from './ThemeSwitcher.tsx'

const NAVIGATION_SCREENS = {
    SET_NAME: 'SET_NAME',
    CONNECT_ERROR: 'CONNECT_ERROR',
    FIND_MATCH: 'FIND_MATCH',
    WAIT_FOR_PLAYERS: 'WAIT_FOR_PLAYERS',
    GAME: 'GAME',
    GAME_COMPLETE: 'GAME_COMPLETE',
}

function Inner() {
    const {
        isConnected,
        playerPosition,
        currentMatch,
        joinMatch,
        name,
        registerName,
        otherPlayerName,
        maxScore,
        endMatch,
        opponentDisconnected,
        setOpponentDisconnected,
        gameComplete,
        setGameComplete,
    } = useContext(SocketContext)

    function navigationFlow(): string {
        if (name === null) {
            return NAVIGATION_SCREENS.SET_NAME
        }
        if (!isConnected) {
            return NAVIGATION_SCREENS.CONNECT_ERROR
        }
        if (gameComplete) {
            return NAVIGATION_SCREENS.GAME_COMPLETE
        }
        if (currentMatch === null) {
            return NAVIGATION_SCREENS.FIND_MATCH
        }
        if (playerPosition === null) {
            return NAVIGATION_SCREENS.WAIT_FOR_PLAYERS
        }
        return NAVIGATION_SCREENS.GAME
    }

    const screen = navigationFlow()

    return (
        <>
            {screen === NAVIGATION_SCREENS.GAME && (
                <Game
                    isLeftPlayer={playerPosition === 'left'}
                    name={name}
                    otherPlayerName={otherPlayerName}
                    maxScore={maxScore}
                    endMatch={endMatch}
                />
            )}

            <SetNameModal
                defaultName={name}
                setName={registerName}
                open={screen === NAVIGATION_SCREENS.SET_NAME}
            />
            <FindMatchModal
                joinMatch={joinMatch}
                name={name}
                open={screen === NAVIGATION_SCREENS.FIND_MATCH}
            />

            <WaitingForOpponentModal
                name={name}
                leaveMatch={async () => await endMatch(null)}
                match={currentMatch}
                open={screen === NAVIGATION_SCREENS.WAIT_FOR_PLAYERS}
            />

            <OpponentDisconnectedModal
                name={name}
                handleClose={() => setOpponentDisconnected(false)}
                open={opponentDisconnected}
            />

            <GameCompleteModal
                name={name}
                open={!!gameComplete}
                handleClose={() => setGameComplete(false)}
                won={gameComplete?.won}
            />
            <ThemeSwitcher />
        </>
    )
}

function App() {
    return (
        <ThemeSwitcherProvider>
            <CssBaseline />
            <SocketProvider>
                <PhysicsProvider>
                    <Inner />
                </PhysicsProvider>
            </SocketProvider>
        </ThemeSwitcherProvider>
    )
}

export default App
