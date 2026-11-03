const express = require('express');
const swaggerUi = require('swagger-ui-express');
const openapi = require('./openapi.json');
const db = require('./database');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (req, res) => {
  res.json({ name: 'Task API', version: '1.0', endpoints: ['/tasks'] });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/tasks', (req, res) => {
  const rows = db.prepare('SELECT * FROM tasks').all();
  const result = rows.map((task) => ({ ...task, done: Boolean(task.done) }));
  res.json(result);
});

app.get('/tasks/:id', (req, res) => {
  const id = Number(req.params.id);
  const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
  if (!task) return res.status(404).json({ error: 'Task not found' });
  res.json({ ...task, done: Boolean(task.done) });
});

app.post('/tasks', (req, res) => {
  const { title } = req.body || {};
  if (typeof title !== 'string' || !title.trim()) {
    return res.status(400).json({ error: 'title is required and must be a non-empty string' });
  }

  const done = false;
  const insert = db.prepare('INSERT INTO tasks (title, done) VALUES (?, ?)');
  const result = insert.run(title.trim(), done ? 1 : 0);
  const row = db.prepare('SELECT * FROM tasks WHERE id = ?').get(result.lastInsertRowid);
  const task = { ...row, done: Boolean(row.done) };
  res.status(201).json(task);
});

const isObjectBody = (body) => body && typeof body === 'object' && !Array.isArray(body);

app.put('/tasks/:id', (req, res) => {
  const id = Number(req.params.id);
  const existingTask = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
  if (!existingTask) return res.status(404).json({ error: 'Task not found' });

  const body = req.body;
  if (!isObjectBody(body)) {
    return res.status(400).json({ error: 'Request body must be a JSON object' });
  }

  if (typeof body.title !== 'string' || !body.title.trim() || typeof body.done !== 'boolean') {
    return res.status(400).json({ error: 'PUT requires a non-empty title and a boolean done value' });
  }

  db.prepare('UPDATE tasks SET title = ?, done = ? WHERE id = ?')
    .run(body.title.trim(), body.done ? 1 : 0, id);

  const updatedTask = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
  res.json({ ...updatedTask, done: Boolean(updatedTask.done) });
});

app.patch('/tasks/:id', (req, res) => {
  const id = Number(req.params.id);
  const existingTask = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
  if (!existingTask) return res.status(404).json({ error: 'Task not found' });
  const body = req.body;
  if (!isObjectBody(body)) {
    return res.status(400).json({ error: 'Request body must be a JSON object' });
  }

  const hasTitle = Object.hasOwn(body, 'title');
  const hasDone = Object.hasOwn(body, 'done');
  if (!hasTitle && !hasDone) {
    return res.status(400).json({ error: 'Provide a title and/or done field to update' });
  }
  if (hasTitle && (typeof body.title !== 'string' || !body.title.trim())) {
    return res.status(400).json({ error: 'title must be a non-empty string' });
  }
  if (hasDone && typeof body.done !== 'boolean') {
    return res.status(400).json({ error: 'done must be a boolean' });
  }

  const title = hasTitle ? body.title.trim() : existingTask.title;
  const done = hasDone ? body.done : Boolean(existingTask.done);
  db.prepare('UPDATE tasks SET title = ?, done = ? WHERE id = ?')
    .run(title, done ? 1 : 0, id);

  const updatedTask = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
  res.json({ ...updatedTask, done: Boolean(updatedTask.done) });
});

app.delete('/tasks/:id', (req, res) => {
  const id = Number(req.params.id);
  const result = db.prepare('DELETE FROM tasks WHERE id = ?').run(id);
  if (result.changes === 0) {
    return res.status(404).json({ error: 'Task not found' });
  }
  res.status(204).end();
});

app.use('/docs', swaggerUi.serve, swaggerUi.setup(openapi));

app.use((error, req, res, next) => {
  if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
    return res.status(400).json({ error: 'Request body must contain valid JSON' });
  }
  next(error);
});

app.listen(port, () => {
  console.log(`Task API listening at http://localhost:${port}`);
});

