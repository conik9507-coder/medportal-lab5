require('dotenv').config();
const Database = require('better-sqlite3');

const db = new Database(process.env.DB_FILE || 'app.db');
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// --- Таблиця лікарів ---
db.prepare(`
  CREATE TABLE IF NOT EXISTS doctors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    specialty TEXT NOT NULL,
    rating REAL NOT NULL DEFAULT 0,
    experience INTEGER NOT NULL DEFAULT 0,
    clinic TEXT NOT NULL DEFAULT ''
  )
`).run();

// --- Таблиця записів ---
db.prepare(`
  CREATE TABLE IF NOT EXISTS appointments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    doctor_id INTEGER NOT NULL,
    patient_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT NOT NULL,
    appointment_date TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'new',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE
  )
`).run();

// --- Seed лікарів (тільки якщо порожньо) ---
const count = db.prepare('SELECT COUNT(*) AS c FROM doctors').get().c;
if (count === 0) {
  const insert = db.prepare(
    'INSERT INTO doctors (name, specialty, rating, experience, clinic) VALUES (?, ?, ?, ?, ?)'
  );
  const seed = [
    ['Іваненко О.П.', 'Кардіолог', 4.9, 15, 'MedPortal Центр'],
    ['Петренко М.І.', 'Невролог', 4.7, 12, 'MedPortal Центр'],
    ['Сидоренко Л.В.', 'Педіатр', 4.8, 10, 'MedPortal Дитячий'],
    ['Коваленко А.С.', 'Терапевт', 4.6, 8, 'MedPortal Північ'],
    ['Мельник І.О.', 'Дерматолог', 4.5, 6, 'MedPortal Південь'],
    ['Бондаренко Т.В.', 'Офтальмолог', 4.8, 11, 'MedPortal Південь'],
  ];
  const tx = db.transaction((rows) => rows.forEach((r) => insert.run(...r)));
  tx(seed);
}

module.exports = db;