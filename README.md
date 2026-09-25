# In-Memory Task API

A small FastAPI task API that stores tasks in a Python list. It supports creating, listing, reading, updating, and deleting tasks.

## Install and run

Run this one command from the project folder:

```sh
python -m pip install fastapi uvicorn && python -m uvicorn stage2:app --reload
```

Open [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs) to use Swagger UI.

## Endpoints

| Method | Path | Purpose | Success status |
| --- | --- | --- | --- |
| GET | `/tasks` | List all tasks | 200 |
| POST | `/tasks` | Create a task with `{"title":"Buy milk"}` | 201 |
| GET | `/tasks/{id}` | Get one task | 200 |
| PUT | `/tasks/{id}` | Update `title`, `done`, or both | 200 |
| DELETE | `/tasks/{id}` | Delete a task; has no request body | 204 |

Missing task IDs return 404. Empty or invalid POST/PUT bodies return 400.

## `curl -i` example

This is the captured response for creating a task:

```http
HTTP/1.1 201 Created
date: Fri, 25 Sep 2026 19:49:08 GMT
server: uvicorn
content-length: 49
content-type: application/json

{"id":4,"title":"Buy milk via curl","done":false}
```

The complete check results for both Swagger UI and `curl -i` are in [results.html](results.html). A printable copy is available as [PDF](output/pdf/task-api-crud-results.pdf).

## Swagger UI

The API exposes all five endpoints in Swagger UI. POST and PUT show request body editors; DELETE has no request body.

The full CRUD cycle was exercised with Swagger UI's **Try it out**. More screenshots of the requests and responses are in [results.html](results.html).

![Swagger UI showing all five task endpoints](Screenshot%202026-09-25%20231518.png)

