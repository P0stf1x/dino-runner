from fastapi import Request
from result import Result, Ok, Err

from uuid import UUID, uuid4
from datetime import datetime, timedelta

import request_body


SESSION_TTL = 3600


def redis_make_session(request: Request) -> UUID:
    session_id = uuid4()
    now = datetime.now().timestamp()

    request.app.state.redis.hset(f"session:{session_id}", mapping={
        "created_at": now,
        "finished_at": now,
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
    now = datetime.now().timestamp()
    request.app.state.redis.hset(f"session:{body.session_id}", "finished_at", now)
    request.app.state.redis.expire(f"session:{body.session_id}", SESSION_TTL)


def delete_session(request: Request, session_id: UUID):
    result = request.app.state.redis.delete(f"session:{session_id}")
    return result


def exists(request: Request, session_id: UUID) -> bool:
    result = request.app.state.redis.exists(f"session:{session_id}")
    return result == 1


def is_finished(request: Request, session_id: UUID) -> bool:
    result = request.app.state.redis.hget(f"session:{session_id}", "finished")
    return result == "True"


def get_heartbeats(request: Request, session_id: UUID) -> int:
    return int(request.app.state.redis.hget(f"session:{session_id}", "heartbeats"))


def get_time_delta(request: Request, session_id: UUID) -> timedelta:
    start = datetime.fromtimestamp(float(request.app.state.redis.hget(f"session:{session_id}", "created_at")))
    end = datetime.fromtimestamp(float(request.app.state.redis.hget(f"session:{session_id}", "finished_at")))
    return end-start


def get_start_end_time(request: Request, session_id: UUID) -> tuple[datetime, datetime]:
    start = datetime.fromtimestamp(float(request.app.state.redis.hget(f"session:{session_id}", "created_at")))
    end = datetime.fromtimestamp(float(request.app.state.redis.hget(f"session:{session_id}", "finished_at")))
    return (start, end)
