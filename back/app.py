from dataclasses import dataclass
from enum import StrEnum
from typing import Optional, Dict

from flask import Flask, request
from flask_socketio import SocketIO, emit, ConnectionRefusedError

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'
socketio = SocketIO(app, always_connect=False, cors_allowed_origins="*")

@app.route("/")
def hello():
    return "Hello, World!"


class InboundMessage(StrEnum):
    BALL_THROWN = 'BALL_THROWN'
    BALL_LOST = 'BALL_LOST'
    BALL_CROSSED = 'BALL_CROSSED'
    JOIN_MATCH = 'JOIN_MATCH'
    SET_NAME = 'SET_NAME'
    GET_MATCHES = 'GET_MATCHES'
    END_MATCH = 'END_MATCH'


class OutboundMessage(StrEnum):
    MATCH_UPDATE = 'MATCH_UPDATE'
    BALL_THROWN = 'BALL_THROWN'
    BALL_LOST = 'BALL_LOST'
    BALL_CROSSED = 'BALL_CROSSED'


@dataclass
class Player:
    sid: str
    name: str = ""
    match: Optional[str] = None


@dataclass
class Match:
    id: str
    left_player: Optional[Player] = None
    right_player: Optional[Player] = None
    max_score: int = 3


PLAYERS: Dict[str, Player] = {}
MATCHES: Dict[str, Match] = {}


def current_player():
    return PLAYERS.get(request.sid)


def current_player_position():
    player = current_player()
    if player and player.match:
        match = MATCHES.get(player.match)
        if match:
            return "left" if match.left_player == player else "right"
    return None


def other_player():
    player = current_player()
    if player and player.match:
        match = MATCHES.get(player.match)
        if match:
            return match.right_player if match.left_player == player else match.left_player
    return None


@socketio.on('connect')
def on_connect(auth):
    PLAYERS[request.sid] = Player(sid=request.sid)


def on_match_players_change(match):
    if not match:
        return
    if not match.right_player and not match.left_player:
        MATCHES.pop(match.id)
        return
    n_players = bool(match.right_player) + bool(match.left_player)
    if match.left_player:
        emit(OutboundMessage.MATCH_UPDATE, {'position': 'left', "players": n_players, 'other': match.right_player.name if match.right_player else None, "maxScore": match.max_score}, to=match.left_player.sid)
    if match.right_player:
        emit(OutboundMessage.MATCH_UPDATE, {'position': 'right', "players": n_players, 'other': match.left_player.name if match.left_player else None, "maxScore": match.max_score}, to=match.right_player.sid)


@socketio.on('disconnect')
def on_disconnect(reason):
    player = current_player()
    if not player:
        return
    if player and player.match:
        match = MATCHES.get(player.match)
        if match and match.right_player == player:
            match.right_player = None
        elif match and match.left_player == player:
            match.left_player = None
        on_match_players_change(match)

    PLAYERS.pop(player.sid)


@socketio.on(InboundMessage.BALL_THROWN)
def on_ball_thrown():
    emit(OutboundMessage.BALL_THROWN, to=other_player().sid)


@socketio.on(InboundMessage.BALL_LOST)
def on_ball_lost():
    emit(OutboundMessage.BALL_LOST, to=other_player().sid)


@socketio.on(InboundMessage.BALL_CROSSED)
def on_ball_crossed(data):
    emit(OutboundMessage.BALL_CROSSED, data, to=other_player().sid)


@socketio.on(InboundMessage.JOIN_MATCH)
def on_join_match(match_id):
    player = current_player()
    if match_id not in MATCHES:
        MATCHES[match_id] = Match(id=match_id)
    match = MATCHES[match_id]
    if match.left_player is None:
        match.left_player = player
    elif match.right_player is None:
        match.right_player = player
    else:
        raise ConnectionRefusedError("Match is full")
    on_match_players_change(match)
    player.match = match_id
    return "ACK"


@socketio.on(InboundMessage.SET_NAME)
def on_set_name(name):
    PLAYERS[request.sid].name = name
    return "ACK"


@socketio.on(InboundMessage.GET_MATCHES)
def on_get_matches():
    return [{"match": match.id, "players": [player.name for player in [match.left_player, match.right_player] if player]} for match in MATCHES.values()]


@socketio.on(InboundMessage.END_MATCH)
def on_end_match():
    player = current_player()
    if not player or not player.match or not player.match in MATCHES:
        return "ACK"
    match = MATCHES[player.match]
    if match.left_player:
        match.left_player.match = None
    elif match.right_player:
        match.right_player.match = None
    MATCHES.pop(match.id)
    return "ACK"


if __name__ == '__main__':
    socketio.run(app, allow_unsafe_werkzeug=True, debug=True, host='0.0.0.0', port=5001)

