import React, { useCallback } from 'react';
import { CellType } from './CellType';

interface TicTacToeBoardProps {
    board: CellType[][];
    cols: number;
    rows: number;
    playable: boolean;
    onClick: (row: number, col: number) => void;
}

const TicTacToeBoard: React.FC<TicTacToeBoardProps> = ({ board, cols, rows, onClick, playable }) => {

    const renderRow = useCallback(function (boardRow: CellType[], rowIndex: number, cols: number) {
        if (boardRow.length !== cols) {
            throw new Error(`Invalid Number of Cells should be: ${cols}`);
        }
        return boardRow.map((cell, columnIndex) => (
            <div key={columnIndex} onClick={() => onClick(rowIndex, columnIndex)} className={`cell flex items-center justify-center bg-gray-200 h-16 w-16 text-4xl font-bold mr-2 ${cell === CellType.Empty && playable ? `hover:bg-gray-500 hover:cursor-pointer` : ``}`}>
                {cell}
            </div>
        ))
    }, []);

    const renderBoard = useCallback(function (board: CellType[][], rows: number, cols: number) {
        if (board.length !== rows) {
            throw new Error(`Invalid Number of Rows should be: ${rows}`);
        }
        return board.map((row, rowIndex) => (
            <div key={rowIndex} className="row flex">
                {renderRow(row, rowIndex, cols)}
            </div>
        ))
    }, [renderRow]);

    return (
        <div className={`board grid grid-cols-${cols} gap-2`}>
            {renderBoard(board, rows, cols)}
        </div>
    );
};

export default TicTacToeBoard;