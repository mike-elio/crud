const Database = require('better-sqlite3');

const db = new Database('tasks.db');

db.exec(`
  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY,
    title TEXT NOT NULL,
    done INTEGER NOT NULL DEFAULT 0
  )
`);
// db.exec('DELETE FROM tasks');

const { count } = db.prepare('SELECT COUNT(*) AS count FROM tasks').get();

if (count === 0) {
  const insertTask = db.prepare('INSERT INTO tasks (title, done) VALUES (?, ?)');
  const initialTasks = [
    ['Learn Express', 0],
    ['Build a CRUD API', 0],
    ['Try Swagger UI', 1]
  ];

  for (const [title, done] of initialTasks) {
    insertTask.run(title, done);
  }
}

module.exports = db;

