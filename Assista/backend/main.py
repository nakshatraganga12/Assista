from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from motor.motor_asyncio import AsyncIOMotorClient

app = FastAPI()

# --- CORS setup ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # allow all origins (for now)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- MongoDB connection ---
client = AsyncIOMotorClient("mongodb://localhost:27017")
db = client["assista_db"]
users_collection = db["users"]

class User(BaseModel):
    name: str
    rollNo: str
    email: str
    mobile: str
    password: str

@app.post("/signup")
async def signup(user: User):
    existing = await users_collection.find_one({"rollNo": user.rollNo})
    if existing:
        raise HTTPException(status_code=400, detail="Roll number already exists")

    await users_collection.insert_one(user.dict())
    return {"message": "User registered successfully"}

# 👇 NEW LOGIN ROUTE
class LoginData(BaseModel):
    rollNo: str
    password: str

@app.post("/login")
async def login(data: LoginData):
    user = await users_collection.find_one({"rollNo": data.rollNo})
    if not user or user["password"] != data.password:
        raise HTTPException(status_code=401, detail="Invalid roll number or password")

    return {"message": "Login successful", "name": user["name"]}