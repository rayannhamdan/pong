from enum import StrEnum

from flask import Flask, request
from flask_socketio import SocketIO, emit, ConnectionRefusedError
from redis import Redis
from werkzeug.local import LocalProxy

from state import RedisState, StateContainer, BasicState

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'
socketio = SocketIO(app, always_connect=False, cors_allowed_origins="*")

STATE_CONTAINER = StateContainer()

STATE = LocalProxy(lambda: STATE_CONTAINER.state)
redis = Redis(host='redis', port=6379)
STATE_CONTAINER.state = RedisState(redis)


@app.route("/health")
def health():
    return "OK"


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


def current_player():
    return STATE.get_player(request.sid)


def current_player_position():
    player = current_player()
    if player and player.match:
        match = STATE.get_match(player.match)
        if match:
            return "left" if match.left_player == player else "right"
    return None


def other_player():
    player = current_player()
    if player and player.match:
        match = STATE.get_match(player.match)
        if match:
            return match.right_player if match.left_player == player else match.left_player
    return None


@socketio.on('connect')
def on_connect(auth):
    STATE.register_player(request.sid)


def on_match_players_change(match):
    if not match:
        return
    if not match.right_player and not match.left_player:
        STATE.remove_match(match.id)
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
        match = STATE.get_match(player.match)
        if match and match.right_player == player:
            match.right_player = None
        elif match and match.left_player == player:
            match.left_player = None
        STATE.update_match(match)
        on_match_players_change(match)

    STATE.remove_player(player.sid)


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
    match = STATE.get_match(match_id)
    if not match:
        match = STATE.register_match(match_id)
    if match.left_player is None:
        match.left_player = player
    elif match.right_player is None:
        match.right_player = player
    else:
        raise ConnectionRefusedError("Match is full")
    STATE.update_match(match)
    on_match_players_change(match)
    player.match = match_id
    STATE.update_player(player)
    return "ACK"


@socketio.on(InboundMessage.SET_NAME)
def on_set_name(name):
    player = current_player()
    player.name = name
    STATE.update_player(player)
    return "ACK"


@socketio.on(InboundMessage.GET_MATCHES)
def on_get_matches():
    return [{"match": match.id, "players": [player.name for player in [match.left_player, match.right_player] if player]} for match in STATE.get_matches()]


@socketio.on(InboundMessage.END_MATCH)
def on_end_match():
    player = current_player()
    if not player or not player.match:
        return "ACK"
    match = STATE.get_match(player.match)
    if not match:
        return "ACK"
    if match.left_player:
        match.left_player.match = None
        STATE.update_player(match.left_player)
    elif match.right_player:
        match.right_player.match = None
        STATE.update_player(match.right_player)
    STATE.remove_match(match.id)
    return "ACK"


def dev():
    STATE_CONTAINER.state = BasicState()
    socketio.run(app, allow_unsafe_werkzeug=True, debug=True, host='0.0.0.0', port=5001)
