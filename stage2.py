from fastapi import FastAPI
tasks = [
    {
        "id": 1,
        "title": "Learn FastAPI",
        "done": False
    },
    {
        "id": 2,
        "title": "Build REST API",
        "done": True
    },
    {
        "id": 3,
        "title": "Practice Python",
        "done": False
    }
]

app = FastAPI()
@app.get('/tasks')
async def gettasks():
    return tasks
@app.get('/tasks/{id}')
async def gettask(id: int):
    if id not in tasks:
        return { "error": f"Task {id} not found" }
    return tasks[id-1]

