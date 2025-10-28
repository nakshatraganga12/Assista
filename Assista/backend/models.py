from pydantic import BaseModel

class EventCreate(BaseModel):
    title: str
    date: str

class Event(EventCreate):
    id: int
