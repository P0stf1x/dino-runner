from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, HTTPException
import redis

import anticheat
import request_body


@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.redis = redis.Redis("redis", decode_responses=True)
    yield
    app.state.redis.close()


app = FastAPI(lifespan=lifespan)


@app.get("/")
@app.post("/")
async def root():
    return {"Hello": "World"}


@app.post("/start")
async def start_session(request: Request, body: request_body.StartSession):
    session_id = anticheat.redis_make_session(request)
    return {"session_id": session_id}


@app.post("/heartbeat")
async def heartbeat_session(request: Request, body: request_body.HeartbeatSession):
    result = anticheat.redis_heartbeat_session(request, body)
    if result.is_ok():
        return {"ok": result.ok()}
    else:
        raise HTTPException(result.err()[0], result.err()[1]) # pyright: ignore[reportOptionalSubscript]


@app.post("/finish")
async def finish_session(request: Request, body: request_body.FinishSession):
    anticheat.redis_finish_session(request, body)
    return {"ok": "ok"}
