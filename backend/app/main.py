from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, HTTPException
import redis
import psycopg_pool
import os

import anticheat
import request_body
import leaderboard


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Redis
    app.state.redis = redis.Redis("redis", decode_responses=True)

    # Postgres
    db = os.environ["POSTGRES_DB"]
    user = os.environ["POSTGRES_USER"]
    password = os.environ["POSTGRES_PASSWORD"]
    app.state.pg_pool = psycopg_pool.AsyncConnectionPool(
        f"postgresql://{user}:{password}@postgresql/{db}",
        min_size=1,
        max_size=10,
        open=False,
    )
    await app.state.pg_pool.open()
    async with app.state.pg_pool.connection() as conn:
        await leaderboard._postgres_create(conn)
    try:
        yield
    finally:
        app.state.redis.close()
        await app.state.pg_pool.close()


app = FastAPI(lifespan=lifespan)


@app.get("/")
@app.post("/")
async def root():
    return {"Hello": "World"}


@app.post("/leaderboard/get")
async def get_score(request: Request, body: request_body.GetScore):
    result = await leaderboard.get_score(request, body)
    return result


@app.post("/leaderboard/post")
async def post_score(request: Request, body: request_body.PublishScore):
    await leaderboard.post_score(request, body)
    return {"ok": "ok"}


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
