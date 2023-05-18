from fastapi import FastAPI, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi_socketio import SocketManager
from pydantic import BaseModel
from enum import StrEnum
from typing import List, Dict, Optional, Union
import json
import threading

app = FastAPI()
sio = SocketManager(app=app, cors_allowed_origins=[])

app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class CellType(StrEnum):
    TYPE_X = 'X'
    TYPE_O = 'O'
    EMPTY = ''


class PlayerType(StrEnum):
    TYPE_X = 'X'
    TYPE_O = 'O'


class Game(BaseModel):
    id: str
    rows: int
    cols: int
    active_player: PlayerType
    player_x: Optional[str]
    player_o: Optional[str]
    board: List[List[CellType]]


games: Dict[str, Game] = {}
write_locks: Dict[str, threading.Lock] = {}
active_players: Dict[str, str] = {}
# watching: Dict[str, set] = {}


def create_game(game_id: str, rows: int, cols: int) -> Game | None:

    if game_id in games:
        return None

    board = []
    for _ in range(rows):
        row = []
        for _ in range(cols):
            row.append(CellType.EMPTY)
        board.append(row)

    game = Game(id=game_id, rows=rows, cols=cols, board=board,
                active_player=PlayerType.TYPE_X)

    write_locks[game_id] = threading.Lock()

    write_locks[game_id].acquire()
    games[game_id] = game
    write_locks[game_id].release()

    return game


def game_set_player(game_id: str, player_type: str, sid: str) -> bool:

    if game_id not in games:
        print("NO GAME FOUND!")
        return False
    
    write_locks[game_id].acquire()
    
    game = games[game_id]

    if player_type == "X" and game.player_x is None:
        game.player_x = sid
        active_players[sid] = game_id
    elif player_type == "O" and game.player_o is None:
        game.player_o = sid
        active_players[sid] = game_id
    elif player_type != "WATCH":
        write_locks[game_id].release()    
        return False
    
    games[game_id] = game

    write_locks[game_id].release()
    return True


def game_handle_play(game_id: str, sid: str, row: int, col: int):

    game = games[game_id]

    cell_type = CellType.TYPE_O
    player_type = PlayerType.TYPE_O
    next_player = PlayerType.TYPE_X
    if game.player_x == sid:
        cell_type = CellType.TYPE_X
        player_type = PlayerType.TYPE_X
        next_player = PlayerType.TYPE_O

    if game.active_player != player_type:
        return False
    write_locks[game_id].acquire()
    if game.board[row][col] == CellType.EMPTY:
        game.board[row][col] = cell_type
    # change active player
    game.active_player = next_player
    games[game_id] = game
    write_locks[game_id].release()

    return True


def remove_from_active_game(sid: str):
    if sid in active_players:
        game_id = active_players[sid]
        write_locks[game_id].acquire()
        game = games[game_id]
        if sid == game.player_o:
            game.player_o = None
        if sid == game.player_x:
            game.player_x = None
        games[game_id] = game
        write_locks[game_id].release()
        app.sio.leave_room(sid, game_id)

        del active_players[sid]


def get_game(game_id: str) -> Game | None:
    if game_id in games:
        return games[game_id].copy()
    return None


@app.get("/ping")
def ping():
    return Response("", 200)


@app.sio.on('connect')
def connect(sid, environ):
    print('connect ', sid)


@app.sio.on('disconnect')
def disconnect(sid):
    remove_from_active_game(sid)


@app.sio.on('join-game')
async def join_game(sid, data):
    game_id = data['gameId']
    player_type = data['playerType']
    rows = data['rows']
    cols = data['cols']

    game = create_game(game_id, rows, cols)
    if game is None:
        print("Game Already Exists!, trying to joing...")

    if game_set_player(game_id, player_type, sid) is False:
        await app.sio.emit('game-join-failed', "Cannot Join Game", to=sid)
        return
    
    game = get_game(game_id)
    
    app.sio.enter_room(sid, game.id)

    out = dict(game)
    out['player_type'] = player_type

    await app.sio.emit('game-joined', out, to=sid)


@app.sio.on('play')
async def handle_play(sid, data):

    game_id = data['gameId']
    row = data['row']
    col = data['col']

    if sid not in active_players:
        await app.sio.emit('play-failed', "Not an Active User!", to=sid)
        return
    
    if game_id != active_players[sid]:
        await app.sio.emit('play-failed', "Incorrect Game ID!", to=sid)
        return

    if game_handle_play(game_id, sid, row, col) is False:
        await app.sio.emit('play-failed', "Invalid Move!", to=sid)
        return
    
    game = get_game(game_id)
    await sio.emit('game-updated', dict(game), room=game_id)


# @app.sio.on('')
# def connect(sid, environ):
#     print("OK!")
#     raise ConnectionRefusedError('Auth Failed!')


# @sio.on('join')
# async def handle_join(sid, *args, **kwargs):
#     print("OK!")
#     return


# @sio.on('leave')
# async def handle_leave(sid, *args, **kwargs):
#     print("LEAVE")
#     return


# def create_new_game():
