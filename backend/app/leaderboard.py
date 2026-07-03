from contextlib import asynccontextmanager
from fastapi import Request, HTTPException, Depends
from psycopg import AsyncConnection

from uuid import UUID
from datetime import datetime

import request_body
import anticheat


@asynccontextmanager
async def pg_conn(request: Request):
    async with request.app.state.pg_pool.connection() as conn:
        yield conn


async def _postgres_create(conn: AsyncConnection):
    async with conn.cursor() as cur:
        await cur.execute("""
        CREATE TABLE IF NOT EXISTS scores (
            session_id UUID PRIMARY KEY,
            user_id UUID NOT NULL,
            username TEXT NOT NULL,
            score INT NOT NULL,
            created_at TIMESTAMP NOT NULL,
            finished_at TIMESTAMP NOT NULL
        );
        """)


async def _postgres_get_score(conn: AsyncConnection):
    async with conn.cursor() as cur:
        await cur.execute(
            "SELECT * FROM scores WHERE username = %s",
            ("test",),
        )
        row = await cur.fetchone()
        if row is not None:
            print(row[0])
            print(row[1])


async def _postgres_post_score(conn: AsyncConnection, session_id: UUID,
                               user_id: UUID, username: str, score: int,
                               created_at: datetime, finished_at: datetime):
    async with conn.cursor() as cur:
        await cur.execute(
            "INSERT INTO scores "
            "VALUES (%s, %s, %s, %s, %s, %s)",
            (session_id, user_id, username, score, created_at, finished_at),
        )


def _valid_score(request: Request, body: request_body.PublishScore): # redundant in normal use, but who knows, it might be useful against cheaters
    ac_delta = anticheat.get_score(request, body.session_id)
    lowest_allowable = ac_delta * 0.9
    highest_allowable = ac_delta * 1.1
    return (body.score >= lowest_allowable) and (body.score <= highest_allowable)


def _valid_playtime(request: Request, body: request_body.PublishScore):
    ac_delta = anticheat.get_time_delta(request, body.session_id)
    return ((body.score/10) >= ac_delta.seconds - 120) and ((body.score/10) <= ac_delta.seconds + 120) # 4 minutes window is plenty enough for any slow connection


async def post_score(request: Request, body: request_body.PublishScore):
    if not anticheat.exists(request, body.session_id):
        raise HTTPException(404, "Session non existent")

    if not anticheat.is_finished(request, body.session_id):
        raise HTTPException(403, "Session is not finished")

    if not _valid_playtime(request, body) or not _valid_score(request, body):
        raise HTTPException(403, "Invalid score")

    if (len(body.nickname) > 20) or not body.nickname.isprintable():
        raise HTTPException(403, "Invalid nickname")

    async with pg_conn(request) as conn:
        (start, end) = anticheat.get_start_end_time(request, body.session_id)
        await _postgres_post_score(conn, body.session_id, body.uid, body.nickname, body.score, start, end)

    anticheat.delete_session(request, body.session_id)
