from fastapi import FastAPI
from app.routers import seasons

app = FastAPI(
    title="Football Data Analysis API",
    version="1.0.0"
)

app.include_router(seasons.router)

@app.get("/")
def root():
    return {"message": "Football Data Analysis API is running"}