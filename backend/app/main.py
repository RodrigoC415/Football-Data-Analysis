from fastapi import FastAPI
from app.routers import seasons, players
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="Football Data Analysis API",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(seasons.router)
app.include_router(players.router)

@app.get("/")
def root():
    return {"message": "Football Data Analysis API is running"}