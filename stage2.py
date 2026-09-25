from fastapi import FastAPI,Request, HTTPException
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
@app.post("/tasks", status_code=201)
async def create_new(request: Request):

    data = await request.json()

    title = data.get("title")

    if not title or not title.strip():
        raise HTTPException(
            status_code=400,
            detail="Title is required and cannot be empty"
        )

    new_task = {
        "id": len(tasks) + 1,
        "title": title,
        "done": False
    }

    tasks.append(new_task)

    return new_task
