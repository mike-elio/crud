from fastapi import FastAPI, HTTPException, Response, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from pydantic import BaseModel


tasks = [
    {"id": 1, "title": "Learn FastAPI", "done": False},
    {"id": 2, "title": "Build REST API", "done": True},
    {"id": 3, "title": "Practice Python", "done": False},
]

app = FastAPI()


@app.exception_handler(RequestValidationError)
async def validation_error_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(status_code=400, content={"detail": "Invalid request body"})


@app.get("/tasks")
async def gettasks():
    return tasks


class TaskCreate(BaseModel):
    title: str


class TaskUpdate(BaseModel):
    title: str | None = None
    done: bool | None = None


@app.get("/tasks/{id}")
async def gettask(id: int):
    for task in tasks:
        if task["id"] == id:
            return task
    raise HTTPException(status_code=404, detail=f"Task {id} not found")


@app.post("/tasks", status_code=201)
async def create_task(data: TaskCreate):
    if not data.title.strip():
        raise HTTPException(status_code=400, detail="Title cannot be empty")

    new_task = {"id": len(tasks) + 1, "title": data.title, "done": False}
    tasks.append(new_task)
    return new_task


@app.put("/tasks/{id}")
async def update_task(id: int, data: TaskUpdate):
    if not data.model_fields_set:
        raise HTTPException(status_code=400, detail="Invalid request body")
    if "title" in data.model_fields_set and (data.title is None or not data.title.strip()):
        raise HTTPException(status_code=400, detail="Title cannot be empty")
    if "done" in data.model_fields_set and data.done is None:
        raise HTTPException(status_code=400, detail="Invalid request body")

    for task in tasks:
        if task["id"] == id:
            if "title" in data.model_fields_set:
                task["title"] = data.title
            if "done" in data.model_fields_set:
                task["done"] = data.done
            return task
    raise HTTPException(status_code=404, detail="Task not found")


@app.delete("/tasks/{id}", status_code=204)
async def delete_task(id: int):
    for task in tasks:
        if task["id"] == id:
            tasks.remove(task)
            return Response(status_code=204)
    raise HTTPException(status_code=404, detail="Task not found")

