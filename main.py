from fastapi import FastAPI

app = FastAPI()


@app.get("/")
async def root():
    return {"message": "Hello World"}
@app.get('/Tasks') 
async def gettask():
    return { "name": "Task API", "version": "1.0", "endpoints": ["/Tasks"] }
@app.get('/health')
async def check():
    return { "status": "ok" }
