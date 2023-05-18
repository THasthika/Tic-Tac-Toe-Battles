import React, { useCallback, useEffect, useMemo, useState } from 'react';
import TicTacToeBoard from './components/TicTacToeBoard';
import { CellType } from './components/CellType';

import io, { Socket } from 'socket.io-client';
import JoinGameForm from './components/JoinGameForm';
import { PlayerType } from './components/PlayerType';
import GameInfo from './components/GameInfo';

interface GameState {
  gameId: string;
  playerType: PlayerType;
  activeTurn: CellType.X | CellType.O;
  board: CellType[][];
  rows: number;
  cols: number;
}

function App() {

  const [socket, setSocket] = useState<Socket | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [showJoinGameModal, setShowJoinGameModal] = useState(false);

  useEffect(() => {
    // Connect to the Socket.IO server
    const socket = io('http://localhost:8000', { path: '/ws/socket.io' });

    // Event handlers for Socket.IO events
    socket.on('connect', () => {
      setSocket(socket);
      console.log('Connected to server');
    });

    socket.on('game-join-failed', (message) => {
      alert(message);
    });

    socket.on('play-failed', (message) => {
      alert(message);
    });

    socket.on('game-updated', (data) => {
      const activePlayer = data.active_player;
      const board = data.board;
      setGameState(oldState => {
        if (oldState === null) return null;
        const newState = {...oldState, activeTurn: activePlayer, board};
        console.log(newState);
        return newState;
      });
    });

    socket.on('game-joined', (data) => {

      const gameId = data.id;
      const rows = Number(data.rows);
      const cols = Number(data.cols);
      const board = data.board;
      const activePlayer = data.active_player;
      const playerType = data.player_type;

      const newGameState: GameState = {
        gameId,
        rows,
        cols,
        board,
        activeTurn: activePlayer,
        playerType
      };

      setGameState(newGameState);
    });

    // socket.on('message', (data: any) => {
    //   console.log('Received message:', data);
    // });

    // Clean up the connection on component unmount
    return () => {
      setSocket(null);
      socket.disconnect();
    };
  }, []);


  const username = useMemo(() => {
    return socket === null ? "None" : socket.id;
  }, [socket])

  const onClickHandle = useCallback((row: number, col: number) => {
    if (gameState?.playerType === "WATCH" || socket === null) return;
    const gameId = gameState?.gameId;
    socket.emit('play', {gameId, row, col})
  }, [gameState?.playerType, socket]);

  const onJoinGameSubmit = useCallback((gameId: string, playerType: PlayerType, rows: number, cols: number) => {
    if (socket === null) {
      alert("Could not connect to backend!");
      return;
    }

    socket.emit('join-game', {gameId, playerType, rows, cols});

  }, [socket]);

  return (
    <div className='container mx-auto lg:w-1/2'>
      <JoinGameForm isOpen={showJoinGameModal} onClose={() => {
        setShowJoinGameModal(false);
      }} onSubmit={onJoinGameSubmit}
      />
      <div className='flex flex-col items-center justify-center space-y-5 mt-5'>
        <div>
          <h1 className='text-4xl'>Tic Tac Toe Battles</h1>
        </div>
        {gameState !== null ?
          <>
            <TicTacToeBoard playable={gameState.activeTurn === gameState.playerType} onClick={onClickHandle} board={gameState.board} rows={gameState.rows} cols={gameState.cols} />
            <GameInfo playerType={gameState.playerType} activePlayer={gameState.activeTurn} />
          </>
          : <div>Please Join Game</div>}
        <div>
            Username: {username}
          </div>

        <button
          type="button"
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
          onClick={() => { setShowJoinGameModal(true) }}
        >
          Join Game
        </button>
      </div>
    </div>
  );
}

export default App;
