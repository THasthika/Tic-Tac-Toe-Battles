import React from 'react'
import { PlayerType } from './PlayerType'
import { CellType } from './CellType';

interface GameInfoProps {
    playerType: PlayerType;
    activePlayer: CellType.X | CellType.O;
}


const GameInfo: React.FC<GameInfoProps> = ({playerType, activePlayer}) => {
    return (
        <>
            <div>Player Type: {playerType}</div>
            <div>Active Player: {activePlayer}</div>
        </>
    )
}

export default GameInfo;
