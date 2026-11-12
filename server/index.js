require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_ORIGIN || '*' }));
app.use(express.json());
app.use(express.static('client')); // Роздача файлів клієнта

// --- API для лікарів ---
app.get('/api/doctors', (req, res) => {
  const rows = db.prepare('SELECT * FROM doctors').all();
  res.json(rows);
});

// --- API для записів на прийом ---
// Отримати всі записи
app.get('/api/appointments', (req, res) => {
  const rows = db.prepare(`
    SELECT a.*, d.name as doctor_name, d.specialty 
    FROM appointments a 
    JOIN doctors d ON a.doctor_id = d.id 
    ORDER BY a.id DESC
  `).all();
  res.json(rows);
});

// Створити новий запис (з валідацією)
app.post('/api/appointments', (req, res) => {
  const { doctor_id, patient_name, phone, email, appointment_date } = req.body;

  // Перевірка
  if (!doctor_id || !patient_name || !phone || !email || !appointment_date) {
    return res.status(400).json({ error: 'Усі поля обов’язкові' });
  }
  
  const phoneRegex = /^\+380\d{9}$/;
  if (!phoneRegex.test(phone)) {
    return res.status(400).json({ error: 'Формат телефону: +380XXXXXXXXX' });
  }

  const info = db.prepare(`
    INSERT INTO appointments (doctor_id, patient_name, phone, email, appointment_date) 
    VALUES (?, ?, ?, ?, ?)
  `).run(doctor_id, patient_name.trim(), phone.trim(), email.trim(), appointment_date);

  const created = db.prepare('SELECT * FROM appointments WHERE id = ?').get(info.lastInsertRowid);
  res.status(201).json(created);
});

// Видалити запис
app.delete('/api/appointments/:id', (req, res) => {
  const info = db.prepare('DELETE FROM appointments WHERE id = ?').run(req.params.id);
  if (info.changes === 0) return res.status(404).json({ error: 'Запис не знайдено' });
  res.status(204).end();
});

// Обробка помилок
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Внутрішня помилка сервера' });
});

app.listen(PORT, () => {
  console.log(`Сервер запущено на http://localhost:${PORT}`);
});