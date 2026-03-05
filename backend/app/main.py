from fastapi import FastAPI

app = FastAPI(
    title="Football Data Analysis API",
    version="1.0.0"
)

@app.get("/")
def root():
    return {"message": "Football Data Analysis API is running"}