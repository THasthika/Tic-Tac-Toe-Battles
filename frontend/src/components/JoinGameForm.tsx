import React, { useCallback, useState } from 'react';
import { PlayerType } from './PlayerType';
import { CellType } from './CellType';

interface JoinGameFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (gameId: string, playerType: PlayerType, rows: number, cols: number) => void;
}

const JoinGameForm: React.FC<JoinGameFormProps> = ({ isOpen, onClose, onSubmit }) => {
  const [gameId, setGameId] = useState('');
  const [playerType, setPlayerType] = useState('');
  const [rows, setRows] = useState('');
  const [cols, setCols] = useState('');

  const handleGameIdChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setGameId(event.target.value);
  };

  const handlePlayerTypeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPlayerType(event.target.value);
  };

  const handleRowsChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRows(event.target.value);
  };

  const handleColsChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCols(event.target.value);
  };

  const handleSubmit = useCallback((event: React.FormEvent) => {
    event.preventDefault();
    let playerTypeT = "WATCH" as PlayerType;
    if (playerType === 'X') {
        playerTypeT = CellType.X;
    } else if (playerType === 'O') {
        playerTypeT = CellType.O;
    }
    onSubmit(gameId, playerTypeT, Number(rows), Number(cols));
    onClose();
  }, [gameId, playerType, rows, cols]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-md">
        <h2 className="text-2xl font-semibold mb-4">Join Game</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="gameId" className="block font-semibold mb-1">Game ID:</label>
            <input
              type="text"
              id="gameId"
              value={gameId}
              onChange={handleGameIdChange}
              className="border border-gray-300 rounded-md p-2 w-full"
            />
          </div>
          <div className="mb-4">
            <label className="block font-semibold mb-1">Player Type:</label>
            <label className="mr-4">
              <input
                type="radio"
                value="X"
                checked={playerType === 'X'}
                onChange={handlePlayerTypeChange}
              />
              <span className="ml-2">X</span>
            </label>
            <label className="mr-4">
              <input
                type="radio"
                value="O"
                checked={playerType === 'O'}
                onChange={handlePlayerTypeChange}
              />
              <span className="ml-2">O</span>
            </label>
            <label>
              <input
                type="radio"
                value="watch"
                checked={playerType === 'watch'}
                onChange={handlePlayerTypeChange}
              />
              <span className="ml-2">Watch</span>
            </label>
          </div>
          <div className="mb-4">
            <label htmlFor="gameId" className="block font-semibold mb-1">Rows:</label>
            <input
              type="text"
              id="rows"
              value={rows}
              onChange={handleRowsChange}
              className="border border-gray-300 rounded-md p-2 w-full"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="gameId" className="block font-semibold mb-1">Cols:</label>
            <input
              type="text"
              id="cols"
              value={cols}
              onChange={handleColsChange}
              className="border border-gray-300 rounded-md p-2 w-full"
            />
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
            >
              Join Game
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default JoinGameForm;