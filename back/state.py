import json
from abc import ABC, abstractmethod
from dataclasses import dataclass, asdict
from typing import Optional, List

from redis import Redis


@dataclass
class Player:
    sid: str
    name: str = ""
    match: Optional[str] = None

    def __eq__(self, other):
        if not isinstance(other, Player):
            return False
        return self.sid == other.sid


@dataclass
class Match:
    id: str
    left_player: Optional[Player] = None
    right_player: Optional[Player] = None
    max_score: int = 3

    def __eq__(self, other):
        if not isinstance(other, Match):
            return False
        return self.id == other.id


class State(ABC):
    @abstractmethod
    def register_player(self, sid: str) -> Player:
        pass

    def get_player(self, sid: str) -> Optional[Player]:
        pass

    def remove_player(self, sid: str) -> None:
        pass

    def update_player(self, player: Player) -> Player:
        pass

    def get_match(self, match_id: str) -> Optional[Match]:
        pass

    def register_match(self, match_id: str) -> Match:
        pass

    def remove_match(self, match_id: str) -> None:
        pass

    def update_match(self, match: Match) -> Match:
        pass

    def get_matches(self) -> List[Match]:
        pass


class BasicState(State):
    def __init__(self):
        self.players = {}
        self.matches = {}

    def register_player(self, sid: str) -> Player:
        player = Player(sid)
        self.players[sid] = player
        return player

    def get_player(self, sid: str) -> Optional[Player]:
        return self.players.get(sid)

    def remove_player(self, sid: str) -> None:
        self.players.pop(sid, None)

    def update_player(self, player: Player) -> Player:
        self.players[player.sid] = player
        return player

    def get_match(self, match_id: str) -> Optional[Match]:
        return self.matches.get(match_id)

    def register_match(self, match_id: str) -> Match:
        match = Match(match_id)
        self.matches[match_id] = match
        return match

    def remove_match(self, match_id: str) -> None:
        self.matches.pop(match_id, None)

    def update_match(self, match: Match) -> Match:
        self.matches[match.id] = match
        return match

    def get_matches(self) -> List[Match]:
        return list(self.matches.values())



class RedisState(State):
    @staticmethod
    def _build_player_key(sid: str) -> str:
        return f"player:{sid}"

    @staticmethod
    def _serialize(obj):
        return json.dumps(asdict(obj), indent=None)

    @staticmethod
    def _deserialize_player(data):
        return Player(**json.loads(data))

    @staticmethod
    def _deserialize_match(data):
        match = Match(**json.loads(data))
        if match.left_player:
            match.left_player = Player(**match.left_player)
        if match.right_player:
            match.right_player = Player(**match.right_player)
        return match


    @staticmethod
    def _build_match_key(match_id: str) -> str:
        return f"match:{match_id}"

    def __init__(self, redis: Redis):
        self.redis = redis

    def register_player(self, sid: str) -> Player:
        player = Player(sid)
        self.redis.set(RedisState._build_player_key(sid), RedisState._serialize(player))
        return player

    def get_player(self, sid: str) -> Optional[Player]:
        value = self.redis.get(RedisState._build_player_key(sid))
        if not value:
            return None
        return RedisState._deserialize_player(value)

    def remove_player(self, sid: str) -> None:
        return self.redis.delete(RedisState._build_player_key(sid))

    def update_player(self, player: Player) -> Player:
        self.redis.set(RedisState._build_player_key(player.sid), RedisState._serialize(player))
        return player

    def get_match(self, match_id: str) -> Optional[Match]:
        value = self.redis.get(RedisState._build_match_key(match_id))
        if not value:
            return None
        return RedisState._deserialize_match(value)

    def register_match(self, match_id: str) -> Match:
        match = Match(match_id)
        self.redis.set(RedisState._build_match_key(match_id), RedisState._serialize(match))
        return match

    def remove_match(self, match_id: str) -> None:
        return self.redis.delete(RedisState._build_match_key(match_id))

    def update_match(self, match: Match) -> Match:
        self.redis.set(RedisState._build_match_key(match.id), RedisState._serialize(match))
        return match

    def get_matches(self) -> List[Match]:
        keys = self.redis.keys("match:*")
        return [RedisState._deserialize_match(value) for value in self.redis.mget(keys) if value]


class StateContainer:
    def __init__(self, state: State = None):
        self.state = state
