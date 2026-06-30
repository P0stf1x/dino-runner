from fastapi import Request
from result import Result, Ok, Err

import uuid
import datetime

import request_body


SESSION_TTL = 300


def redis_make_session(request: Request) -> uuid.UUID:
    session_id = uuid.uuid4()
    now = datetime.datetime.now().__repr__()

    request.app.state.redis.hset(f"session:{session_id}", mapping={
        "created_at": now,
        "heartbeats": 0,
        "finished": "False",
    })
    request.app.state.redis.expire(f"session:{session_id}", SESSION_TTL)

    return session_id


def redis_heartbeat_session(request: Request, body: request_body.HeartbeatSession) -> Result[int, tuple[int, str]]:
    if not request.app.state.redis.exists(f"session:{body.session_id}"):
        return Err((404, "Value non existent"))
    if "True" == request.app.state.redis.hget(f"session:{body.session_id}", "finished"):
        return Err((403, "Session finished"))

    result = request.app.state.redis.hincrby(f"session:{body.session_id}", "heartbeats", 1)
    request.app.state.redis.expire(f"session:{body.session_id}", SESSION_TTL)
    return Ok(result)


def redis_finish_session(request: Request, body: request_body.FinishSession):
    request.app.state.redis.hset(f"session:{body.session_id}", "finished", "True")
    request.app.state.redis.expire(f"session:{body.session_id}", SESSION_TTL)
