// Посилання на API
const API_DOCTORS = '/api/doctors';
const API_APPOINTMENTS = '/api/appointments';

const doctorsList = document.getElementById('doctors-list');
const modal = document.getElementById('modal');
const closeModalBtn = document.getElementById('close-modal');
const form = document.getElementById('appointment-form');
const modalTitle = document.getElementById('modal-title');
const doctorIdInput = document.getElementById('doctor-id');
const formMessage = document.getElementById('form-message');

// 1. Завантаження лікарів з бази даних
async function loadDoctors() {
  try {
    const response = await fetch(API_DOCTORS);
    const doctors = await response.json();
    
    doctorsList.innerHTML = ''; // Очищаємо список
    
    doctors.forEach(doctor => {
      const card = document.createElement('div');
      card.className = 'doctor-card';
      
      // Створюємо HTML без onclick
      card.innerHTML = `
        <h3>${doctor.name}</h3>
        <div class="specialty">${doctor.specialty} • ${doctor.clinic}</div>
        <div class="rating">⭐ ${doctor.rating} (Стаж: ${doctor.experience} років)</div>
        <button class="book-btn">Записатися</button>
      `;
      
      // Знаходимо кнопку всередині картки і додаємо їй подію кліку
      const btn = card.querySelector('.book-btn');
      btn.addEventListener('click', () => openModal(doctor.id, doctor.name));
      
      doctorsList.appendChild(card);
    });
  } catch (error) {
    console.error(error);
    doctorsList.innerHTML = '<p style="color:red">Помилка завантаження лікарів.</p>';
  }
}

// 2. Відкриття модального вікна
function openModal(id, name) {
  doctorIdInput.value = id;
  modalTitle.textContent = `Запис до ${name}`;
  formMessage.textContent = '';
  formMessage.className = 'message';
  form.reset();
  doctorIdInput.value = id; // Повертаємо ID після form.reset()
  modal.classList.add('active');
}

// Закриття модального вікна
closeModalBtn.addEventListener('click', () => {
  modal.classList.remove('active');
});

modal.addEventListener('click', (e) => {
  if (e.target === modal) {
    modal.classList.remove('active');
  }
});

// 3. Відправка форми на сервер
form.addEventListener('submit', async (e) => {
  e.preventDefault(); 
  
  formMessage.textContent = 'Відправка...';
  formMessage.className = 'message';

  const data = {
    doctor_id: doctorIdInput.value,
    patient_name: document.getElementById('patient-name').value,
    phone: document.getElementById('phone').value,
    email: document.getElementById('email').value,
    appointment_date: document.getElementById('date').value
  };

  try {
    const response = await fetch(API_APPOINTMENTS, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    const result = await response.json();

    if (response.ok) {
      formMessage.textContent = 'Ви успішно записані! Наш адміністратор зв’яжеться з вами.';
      formMessage.classList.add('success');
      form.reset();
      setTimeout(() => modal.classList.remove('active'), 3000);
    } else {
      formMessage.textContent = result.error || 'Помилка при записі';
      formMessage.classList.add('error');
    }
  } catch (error) {
    formMessage.textContent = 'Помилка з’єднання з сервером';
    formMessage.classList.add('error');
  }
});

// Запускаємо завантаження при відкритті сторінки
loadDoctors();