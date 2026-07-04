from pydantic import BaseModel
from uuid import UUID


class StartSession(BaseModel):
    uid: UUID


class HeartbeatSession(BaseModel):
    uid: UUID
    session_id: UUID


class FinishSession(BaseModel):
    uid: UUID
    session_id: UUID


class PublishScore(BaseModel):
    uid: UUID
    session_id: UUID
    score: int
    nickname: str


class GetScore(BaseModel):
    uid: UUID
    page: int = 0
    nickname: str | None = None
