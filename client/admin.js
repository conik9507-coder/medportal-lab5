const API_APPOINTMENTS = '/api/appointments';
const appointmentsList = document.getElementById('appointments-list');

// 1. Завантаження всіх записів
async function loadAppointments() {
  try {
    const response = await fetch(API_APPOINTMENTS);
    const appointments = await response.json();
    
    appointmentsList.innerHTML = ''; // Очищаємо таблицю
    
    if (appointments.length === 0) {
      appointmentsList.innerHTML = '<tr><td colspan="6">Записів поки немає.</td></tr>';
      return;
    }

    appointments.forEach(app => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${app.id}</td>
        <td>${app.patient_name}</td>
        <td>${app.phone}</td>
        <td>${app.doctor_name} (${app.specialty})</td>
        <td>${app.appointment_date}</td>
        <td><button class="btn-delete" onclick="deleteAppointment(${app.id})">Видалити</button></td>
      `;
      appointmentsList.appendChild(tr);
    });
  } catch (error) {
    appointmentsList.innerHTML = '<tr><td colspan="6" style="color:red">Помилка завантаження записів.</td></tr>';
  }
}

// 2. Видалення запису
window.deleteAppointment = async function(id) {
  if (!confirm('Ви впевнені, що хочете видалити цей запис?')) return;

  try {
    const response = await fetch(`${API_APPOINTMENTS}/${id}`, {
      method: 'DELETE'
    });

    if (response.ok) {
      loadAppointments(); // Оновлюємо таблицю після видалення
    } else {
      alert('Помилка при видаленні');
    }
  } catch (error) {
    alert('Помилка з’єднання з сервером');
  }
}

// Запускаємо при відкритті сторінки
loadAppointments();