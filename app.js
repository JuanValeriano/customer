// ==========================================
// DocSpot Odonto - Application Logic
// ==========================================

// State Management
const AppState = {
  currentUser: null,
  selectedRole: null,
  appointments: [],
  users: [],
}

// Initialize app
document.addEventListener("DOMContentLoaded", () => {
  initializeLocalStorage()
  setupEventListeners()
  checkExistingSession()
})

// Initialize localStorage with sample data
function initializeLocalStorage() {
  // Initialize users if not exists
  if (!localStorage.getItem("docspot_users")) {
    const sampleUsers = [
      {
        id: "doc_1",
        username: "doc_alva",
        password: "123456",
        role: "doctor",
        name: "Dr. Carlos Alva",
        clinic: "Clínica Sonrisas Trujillanas",
        email: "doc.alva@email.com",
        phone: "+51 999 111 222",
      },
      {
        id: "doc_2",
        username: "doc_maria",
        password: "123456",
        role: "doctor",
        name: "Dra. María García",
        clinic: "Centro Dental Premium",
        email: "maria.garcia@email.com",
        phone: "+51 999 333 444",
      },
      {
        id: "pac_1",
        username: "carlos_m",
        password: "123456",
        role: "paciente",
        name: "Carlos Mendez",
        email: "carlos.mendez@email.com",
        phone: "+51 999 555 666",
      },
    ]
    localStorage.setItem("docspot_users", JSON.stringify(sampleUsers))
  }

  // Initialize appointments if not exists
  if (!localStorage.getItem("docspot_appointments")) {
    const sampleAppointments = [
      {
        id: "apt_1",
        doctorId: "doc_1",
        doctorName: "Dr. Carlos Alva",
        clinic: "Clínica Sonrisas Trujillanas",
        service: "Limpieza Dental",
        time: "5:00 PM",
        date: getTodayDate(),
        price: 50,
        commission: 2,
        status: "available",
        patientId: null,
        patientName: null,
      },
      {
        id: "apt_2",
        doctorId: "doc_2",
        doctorName: "Dra. María García",
        clinic: "Centro Dental Premium",
        service: "Blanqueamiento",
        time: "3:00 PM",
        date: getTodayDate(),
        price: 150,
        commission: 2,
        status: "available",
        patientId: null,
        patientName: null,
      },
    ]
    localStorage.setItem("docspot_appointments", JSON.stringify(sampleAppointments))
  }

  // Load data into state
  AppState.users = JSON.parse(localStorage.getItem("docspot_users"))
  AppState.appointments = JSON.parse(localStorage.getItem("docspot_appointments"))
}

// Get today's date formatted
function getTodayDate() {
  const today = new Date()
  return today.toLocaleDateString("es-PE", { weekday: "long", day: "numeric", month: "long" })
}

// Setup event listeners
function setupEventListeners() {
  // Role selection
  document.querySelectorAll(".role-card").forEach((card) => {
    card.addEventListener("click", () => selectRole(card.dataset.role))
  })

  // Navigation buttons
  document.getElementById("back-to-roles")?.addEventListener("click", showRoleSelection)
  document.getElementById("back-to-login")?.addEventListener("click", showLoginForm)
  document.getElementById("go-to-register")?.addEventListener("click", showRegisterForm)

  // Forms
  document.getElementById("login-form-element")?.addEventListener("submit", handleLogin)
  document.getElementById("register-form-element")?.addEventListener("submit", handleRegister)

  // Password toggles
  document.querySelectorAll(".toggle-password").forEach((btn) => {
    btn.addEventListener("click", function () {
      const input = this.previousElementSibling
      input.type = input.type === "password" ? "text" : "password"
    })
  })
}

// Check for existing session
function checkExistingSession() {
  const session = localStorage.getItem("docspot_session")
  if (session) {
    const user = JSON.parse(session)
    AppState.currentUser = user
    if (user.role === "doctor") {
      showDoctorDashboard()
    } else {
      showPatientDashboard()
    }
  }
}

// Role selection
function selectRole(role) {
  AppState.selectedRole = role

  const roleIcon = document.getElementById("selected-role-icon")
  const loginSubtitle = document.getElementById("login-subtitle")
  const registerSubtitle = document.getElementById("register-subtitle")
  const clinicField = document.getElementById("clinic-field")

  if (role === "doctor") {
    roleIcon.className = "selected-role-icon doctor"
    roleIcon.innerHTML = `
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.5">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
                <path d="M12 11v4M10 13h4"/>
            </svg>
        `
    loginSubtitle.textContent = "Ingresa como Doctor"
    registerSubtitle.textContent = "Regístrate como Doctor"
    clinicField.style.display = "block"
  } else {
    roleIcon.className = "selected-role-icon patient"
    roleIcon.innerHTML = `
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.5">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
            </svg>
        `
    loginSubtitle.textContent = "Ingresa como Paciente"
    registerSubtitle.textContent = "Regístrate como Paciente"
    clinicField.style.display = "none"
  }

  showLoginForm()
}

// Show/hide auth steps
function showRoleSelection() {
  document.querySelectorAll(".auth-step").forEach((step) => step.classList.remove("active"))
  document.getElementById("role-selection").classList.add("active")
}

function showLoginForm() {
  document.querySelectorAll(".auth-step").forEach((step) => step.classList.remove("active"))
  document.getElementById("login-form").classList.add("active")
}

function showRegisterForm() {
  document.querySelectorAll(".auth-step").forEach((step) => step.classList.remove("active"))
  document.getElementById("register-form").classList.add("active")
}

// Handle login
function handleLogin(e) {
  e.preventDefault()

  const username = document.getElementById("login-username").value
  const password = document.getElementById("login-password").value

  const user = AppState.users.find(
    (u) => u.username === username && u.password === password && u.role === AppState.selectedRole,
  )

  if (user) {
    AppState.currentUser = user
    localStorage.setItem("docspot_session", JSON.stringify(user))

    showToast("success", "Bienvenido", `Hola ${user.name}`)

    setTimeout(() => {
      if (user.role === "doctor") {
        showDoctorDashboard()
      } else {
        showPatientDashboard()
      }
    }, 500)
  } else {
    showToast("error", "Error", "Usuario o contraseña incorrectos")
  }
}

// Handle register
function handleRegister(e) {
  e.preventDefault()

  const name = document.getElementById("register-name").value
  const username = document.getElementById("register-username").value
  const email = document.getElementById("register-email").value
  const phone = document.getElementById("register-phone").value
  const password = document.getElementById("register-password").value
  const clinic = document.getElementById("register-clinic")?.value || ""

  // Check if username exists
  if (AppState.users.find((u) => u.username === username)) {
    showToast("error", "Error", "El nombre de usuario ya existe")
    return
  }

  const newUser = {
    id: `${AppState.selectedRole === "doctor" ? "doc" : "pac"}_${Date.now()}`,
    username,
    password,
    role: AppState.selectedRole,
    name,
    email,
    phone,
    ...(AppState.selectedRole === "doctor" && { clinic }),
  }

  AppState.users.push(newUser)
  localStorage.setItem("docspot_users", JSON.stringify(AppState.users))

  AppState.currentUser = newUser
  localStorage.setItem("docspot_session", JSON.stringify(newUser))

  showToast("success", "Cuenta creada", "Tu cuenta ha sido creada exitosamente")

  setTimeout(() => {
    if (newUser.role === "doctor") {
      showDoctorDashboard()
    } else {
      showPatientDashboard()
    }
  }, 500)
}

// Show Doctor Dashboard
function showDoctorDashboard() {
  const user = AppState.currentUser
  const doctorAppointments = AppState.appointments.filter((apt) => apt.doctorId === user.id)
  const availableCount = doctorAppointments.filter((apt) => apt.status === "available").length
  const reservedCount = doctorAppointments.filter((apt) => apt.status === "reserved").length
  const earnings = doctorAppointments
    .filter((apt) => apt.status === "reserved")
    .reduce((sum, apt) => sum + (apt.price - apt.commission), 0)

  document.getElementById("doctor-dashboard").innerHTML = `
        <div class="dashboard">
            <header class="dashboard-header">
                <div class="header-content">
                    <div class="header-left">
                        <a href="#" class="header-logo">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                                <path d="M12 2C8 2 6 5 6 8c0 2 1 4 2 5l-1 7c0 1 1 2 2 2h6c1 0 2-1 2-2l-1-7c1-1 2-3 2-5 0-3-2-6-6-6z"/>
                                <path d="M9 8h6M12 8v4"/>
                            </svg>
                            <span>DocSpot Odonto</span>
                        </a>
                    </div>
                    <div class="header-right">
                        <div class="user-menu">
                            <div class="user-avatar">${user.name.charAt(0)}</div>
                            <div class="user-info">
                                <span class="user-name">${user.name}</span>
                                <span class="user-role">${user.clinic}</span>
                            </div>
                        </div>
                        <button class="btn-logout" onclick="logout()">Salir</button>
                    </div>
                </div>
            </header>
            
            <main class="dashboard-content">
                <div class="welcome-section">
                    <h1>Panel del Doctor</h1>
                    <p>Gestiona tus citas disponibles y reservaciones</p>
                </div>
                
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-icon primary">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                                <line x1="16" y1="2" x2="16" y2="6"/>
                                <line x1="8" y1="2" x2="8" y2="6"/>
                                <line x1="3" y1="10" x2="21" y2="10"/>
                            </svg>
                        </div>
                        <div class="stat-info">
                            <h3>${availableCount}</h3>
                            <p>Citas Disponibles</p>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon success">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
                                <polyline points="22,4 12,14.01 9,11.01"/>
                            </svg>
                        </div>
                        <div class="stat-info">
                            <h3>${reservedCount}</h3>
                            <p>Citas Reservadas</p>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon warning">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="12" y1="1" x2="12" y2="23"/>
                                <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
                            </svg>
                        </div>
                        <div class="stat-info">
                            <h3>S/ ${earnings}</h3>
                            <p>Ganancias Hoy</p>
                        </div>
                    </div>
                </div>
                
                <div class="section">
                    <div class="section-header">
                        <h2>Abrir Nueva Cita</h2>
                    </div>
                    <div class="section-content">
                        <form class="appointment-form" id="new-appointment-form">
                            <div class="form-group">
                                <label>Servicio</label>
                                <select id="apt-service" required>
                                    <option value="">Seleccionar servicio</option>
                                    <option value="Limpieza Dental">Limpieza Dental</option>
                                    <option value="Blanqueamiento">Blanqueamiento</option>
                                    <option value="Extracción">Extracción</option>
                                    <option value="Ortodoncia">Ortodoncia - Consulta</option>
                                    <option value="Endodoncia">Endodoncia</option>
                                    <option value="Consulta General">Consulta General</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Hora</label>
                                <select id="apt-time" required>
                                    <option value="">Seleccionar hora</option>
                                    <option value="9:00 AM">9:00 AM</option>
                                    <option value="10:00 AM">10:00 AM</option>
                                    <option value="11:00 AM">11:00 AM</option>
                                    <option value="12:00 PM">12:00 PM</option>
                                    <option value="3:00 PM">3:00 PM</option>
                                    <option value="4:00 PM">4:00 PM</option>
                                    <option value="5:00 PM">5:00 PM</option>
                                    <option value="6:00 PM">6:00 PM</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Precio (S/)</label>
                                <input type="number" id="apt-price" placeholder="50" min="10" required>
                            </div>
                            <div class="commission-notice">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <circle cx="12" cy="12" r="10"/>
                                    <line x1="12" y1="16" x2="12" y2="12"/>
                                    <line x1="12" y1="8" x2="12.01" y2="8"/>
                                </svg>
                                <span>La comisión de DocSpot es de S/ 2.00 por cita reservada</span>
                            </div>
                            <div class="form-actions">
                                <button type="submit" class="btn-primary">
                                    Publicar Cita
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
                
                <div class="section">
                    <div class="section-header">
                        <h2>Mis Citas de Hoy</h2>
                    </div>
                    <div class="section-content">
                        <div class="appointments-list" id="doctor-appointments-list">
                            ${renderDoctorAppointments(doctorAppointments)}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    `

  // Setup new appointment form
  document.getElementById("new-appointment-form").addEventListener("submit", handleNewAppointment)

  showScreen("doctor-dashboard")
}

// Render doctor appointments
function renderDoctorAppointments(appointments) {
  if (appointments.length === 0) {
    return `
            <div class="empty-state">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                    <line x1="16" y1="2" x2="16" y2="6"/>
                    <line x1="8" y1="2" x2="8" y2="6"/>
                    <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
                <h3>No hay citas publicadas</h3>
                <p>Publica una cita disponible para empezar a recibir pacientes</p>
            </div>
        `
  }

  return appointments
    .map(
      (apt) => `
        <div class="appointment-card">
            <div class="appointment-info">
                <div class="appointment-time">${apt.time}</div>
                <div class="appointment-details">
                    <h4>${apt.service}</h4>
                    <p>${apt.status === "reserved" ? `Reservado por ${apt.patientName}` : apt.date}</p>
                </div>
            </div>
            <span class="appointment-price">S/ ${apt.price}</span>
            <span class="appointment-status ${apt.status === "available" ? "status-available" : "status-reserved"}">
                ${apt.status === "available" ? "Disponible" : "Reservado"}
            </span>
            ${
              apt.status === "available"
                ? `
                <div class="appointment-actions">
                    <button class="btn-sm btn-danger" onclick="cancelAppointment('${apt.id}')">Cancelar</button>
                </div>
            `
                : ""
            }
        </div>
    `,
    )
    .join("")
}

// Handle new appointment
function handleNewAppointment(e) {
  e.preventDefault()

  const user = AppState.currentUser
  const service = document.getElementById("apt-service").value
  const time = document.getElementById("apt-time").value
  const price = Number.parseInt(document.getElementById("apt-price").value)

  const newAppointment = {
    id: `apt_${Date.now()}`,
    doctorId: user.id,
    doctorName: user.name,
    clinic: user.clinic,
    service,
    time,
    date: getTodayDate(),
    price,
    commission: 2,
    status: "available",
    patientId: null,
    patientName: null,
  }

  AppState.appointments.push(newAppointment)
  localStorage.setItem("docspot_appointments", JSON.stringify(AppState.appointments))

  showToast("success", "Cita Publicada", `Tu cita de ${service} a las ${time} está disponible`)

  // Refresh dashboard
  showDoctorDashboard()
}

// Cancel appointment
function cancelAppointment(id) {
  AppState.appointments = AppState.appointments.filter((apt) => apt.id !== id)
  localStorage.setItem("docspot_appointments", JSON.stringify(AppState.appointments))

  showToast("success", "Cita Cancelada", "La cita ha sido eliminada")
  showDoctorDashboard()
}

// Show Patient Dashboard
function showPatientDashboard() {
  const user = AppState.currentUser
  const availableAppointments = AppState.appointments.filter((apt) => apt.status === "available")
  const myReservations = AppState.appointments.filter((apt) => apt.patientId === user.id)

  document.getElementById("patient-dashboard").innerHTML = `
        <div class="dashboard">
            <header class="dashboard-header">
                <div class="header-content">
                    <div class="header-left">
                        <a href="#" class="header-logo">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                                <path d="M12 2C8 2 6 5 6 8c0 2 1 4 2 5l-1 7c0 1 1 2 2 2h6c1 0 2-1 2-2l-1-7c1-1 2-3 2-5 0-3-2-6-6-6z"/>
                                <path d="M9 8h6M12 8v4"/>
                            </svg>
                            <span>DocSpot Odonto</span>
                        </a>
                    </div>
                    <div class="header-right">
                        <div class="user-menu">
                            <div class="user-avatar" style="background: #3B82F6">${user.name.charAt(0)}</div>
                            <div class="user-info">
                                <span class="user-name">${user.name}</span>
                                <span class="user-role">Paciente</span>
                            </div>
                        </div>
                        <button class="btn-logout" onclick="logout()">Salir</button>
                    </div>
                </div>
            </header>
            
            <main class="dashboard-content">
                <div class="welcome-section">
                    <h1>Hola, ${user.name.split(" ")[0]}</h1>
                    <p>Encuentra citas dentales disponibles para hoy</p>
                </div>
                
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-icon primary">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                                <line x1="16" y1="2" x2="16" y2="6"/>
                                <line x1="8" y1="2" x2="8" y2="6"/>
                                <line x1="3" y1="10" x2="21" y2="10"/>
                            </svg>
                        </div>
                        <div class="stat-info">
                            <h3>${availableAppointments.length}</h3>
                            <p>Citas Disponibles</p>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon success">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
                                <polyline points="22,4 12,14.01 9,11.01"/>
                            </svg>
                        </div>
                        <div class="stat-info">
                            <h3>${myReservations.length}</h3>
                            <p>Mis Reservaciones</p>
                        </div>
                    </div>
                </div>
                
                <div class="section">
                    <div class="section-header">
                        <h2>Citas Disponibles Hoy</h2>
                    </div>
                    <div class="section-content">
                        <div class="available-grid" id="available-appointments">
                            ${renderAvailableAppointments(availableAppointments)}
                        </div>
                    </div>
                </div>
                
                ${
                  myReservations.length > 0
                    ? `
                    <div class="section">
                        <div class="section-header">
                            <h2>Mis Reservaciones</h2>
                        </div>
                        <div class="section-content">
                            <div class="appointments-list">
                                ${renderPatientReservations(myReservations)}
                            </div>
                        </div>
                    </div>
                `
                    : ""
                }
            </main>
        </div>
    `

  showScreen("patient-dashboard")
}

// Render available appointments for patient
function renderAvailableAppointments(appointments) {
  if (appointments.length === 0) {
    return `
            <div class="empty-state" style="grid-column: 1 / -1">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="8" x2="12" y2="12"/>
                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <h3>No hay citas disponibles</h3>
                <p>No hay citas disponibles en este momento. Vuelve a revisar más tarde.</p>
            </div>
        `
  }

  return appointments
    .map(
      (apt) => `
        <div class="available-card">
            <div class="clinic-info">
                <div class="clinic-avatar">${apt.clinic.charAt(0)}</div>
                <div class="clinic-details">
                    <h4>${apt.clinic}</h4>
                    <p>${apt.doctorName}</p>
                </div>
            </div>
            <div class="service-info">
                <div class="service-name">${apt.service}</div>
                <div class="service-meta">
                    <span>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"/>
                            <polyline points="12,6 12,12 16,14"/>
                        </svg>
                        ${apt.time}
                    </span>
                    <span>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                            <line x1="16" y1="2" x2="16" y2="6"/>
                            <line x1="8" y1="2" x2="8" y2="6"/>
                            <line x1="3" y1="10" x2="21" y2="10"/>
                        </svg>
                        Hoy
                    </span>
                </div>
            </div>
            <div class="card-footer">
                <span class="price-tag">S/ ${apt.price}</span>
                <button class="btn-reserve" onclick="showReserveModal('${apt.id}')">Reservar</button>
            </div>
        </div>
    `,
    )
    .join("")
}

// Render patient reservations
function renderPatientReservations(reservations) {
  return reservations
    .map(
      (apt) => `
        <div class="appointment-card">
            <div class="appointment-info">
                <div class="appointment-time">${apt.time}</div>
                <div class="appointment-details">
                    <h4>${apt.service}</h4>
                    <p>${apt.clinic} - ${apt.doctorName}</p>
                </div>
            </div>
            <span class="appointment-price">S/ ${apt.price}</span>
            <span class="appointment-status status-reserved">Confirmado</span>
        </div>
    `,
    )
    .join("")
}

// Show reserve modal
function showReserveModal(appointmentId) {
  const apt = AppState.appointments.find((a) => a.id === appointmentId)
  if (!apt) return

  const modal = document.createElement("div")
  modal.className = "modal-overlay"
  modal.id = "reserve-modal"
  modal.innerHTML = `
        <div class="modal modal-payment">
            <div class="modal-header">
                <h3>Confirmar y Pagar</h3>
                <button class="modal-close" onclick="closeModal()">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"/>
                        <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                </button>
            </div>
            <div class="modal-body">
                <div class="confirm-icon">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                        <line x1="1" y1="10" x2="23" y2="10"/>
                    </svg>
                </div>
                <div class="confirm-text">
                    <h4>Resumen de tu cita</h4>
                    <p>Completa el pago para confirmar tu reserva</p>
                </div>
                <div class="confirm-details">
                    <p><span>Clínica:</span> <strong>${apt.clinic}</strong></p>
                    <p><span>Doctor:</span> <strong>${apt.doctorName}</strong></p>
                    <p><span>Servicio:</span> <strong>${apt.service}</strong></p>
                    <p><span>Hora:</span> <strong>${apt.time}</strong></p>
                    <p class="total-price"><span>Total a pagar:</span> <strong>S/ ${apt.price}</strong></p>
                </div>
                
                <div class="payment-section">
                    <h4 class="payment-title">Método de Pago</h4>
                    
                    <div class="payment-methods">
                        <label class="payment-method selected">
                            <input type="radio" name="payment-method" value="card" checked>
                            <div class="method-content">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                                    <line x1="1" y1="10" x2="23" y2="10"/>
                                </svg>
                                <span>Tarjeta de Crédito/Débito</span>
                            </div>
                        </label>
                        <label class="payment-method">
                            <input type="radio" name="payment-method" value="yape">
                            <div class="method-content">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <rect x="5" y="2" width="14" height="20" rx="2" ry="2"/>
                                    <line x1="12" y1="18" x2="12.01" y2="18"/>
                                </svg>
                                <span>Yape / Plin</span>
                            </div>
                        </label>
                    </div>
                    
                    <div id="card-form" class="payment-form">
                        <div class="form-group">
                            <label>Número de Tarjeta</label>
                            <div class="card-input-wrapper">
                                <input type="text" id="card-number" placeholder="1234 5678 9012 3456" maxlength="19">
                                <div class="card-icons">
                                    <svg width="32" height="20" viewBox="0 0 32 20" class="card-visa">
                                        <rect width="32" height="20" rx="2" fill="#1A1F71"/>
                                        <text x="16" y="13" text-anchor="middle" fill="white" font-size="8" font-weight="bold">VISA</text>
                                    </svg>
                                    <svg width="32" height="20" viewBox="0 0 32 20" class="card-mc">
                                        <rect width="32" height="20" rx="2" fill="#EB001B"/>
                                        <circle cx="12" cy="10" r="6" fill="#EB001B"/>
                                        <circle cx="20" cy="10" r="6" fill="#F79E1B"/>
                                    </svg>
                                </div>
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>Fecha de Expiración</label>
                                <input type="text" id="card-expiry" placeholder="MM/AA" maxlength="5">
                            </div>
                            <div class="form-group">
                                <label>CVV</label>
                                <input type="text" id="card-cvv" placeholder="123" maxlength="4">
                            </div>
                        </div>
                        <div class="form-group">
                            <label>Nombre en la Tarjeta</label>
                            <input type="text" id="card-name" placeholder="JUAN PEREZ">
                        </div>
                    </div>
                    
                    <div id="yape-form" class="payment-form" style="display: none;">
                        <div class="yape-instructions">
                            <div class="qr-placeholder">
                                <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
                                    <rect width="120" height="120" fill="#f0f0f0" rx="8"/>
                                    <rect x="20" y="20" width="20" height="20" fill="#333"/>
                                    <rect x="80" y="20" width="20" height="20" fill="#333"/>
                                    <rect x="20" y="80" width="20" height="20" fill="#333"/>
                                    <rect x="45" y="20" width="10" height="10" fill="#333"/>
                                    <rect x="60" y="30" width="15" height="15" fill="#333"/>
                                    <rect x="45" y="50" width="30" height="20" fill="#333"/>
                                    <rect x="25" y="50" width="15" height="10" fill="#333"/>
                                    <rect x="80" y="55" width="15" height="15" fill="#333"/>
                                    <rect x="55" y="80" width="20" height="15" fill="#333"/>
                                </svg>
                            </div>
                            <p>Escanea el código QR con tu app de Yape o Plin</p>
                            <p class="yape-amount">Monto: <strong>S/ ${apt.price}</strong></p>
                        </div>
                    </div>
                </div>
                
                <div class="secure-badge">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                        <path d="M7 11V7a5 5 0 0110 0v4"/>
                    </svg>
                    <span>Pago seguro encriptado con SSL</span>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn-secondary" onclick="closeModal()">Cancelar</button>
                <button class="btn-primary btn-pay" onclick="processPayment('${apt.id}')">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                        <path d="M7 11V7a5 5 0 0110 0v4"/>
                    </svg>
                    Pagar S/ ${apt.price}
                </button>
            </div>
        </div>
    `

  document.body.appendChild(modal)

  // Setup payment method toggle
  setupPaymentMethodToggle()

  // Setup card input formatting
  setupCardInputFormatting()
}

// Close modal
function closeModal() {
  const modal = document.getElementById("reserve-modal")
  if (modal) modal.remove()
}

// Setup payment method toggle
function setupPaymentMethodToggle() {
  const methods = document.querySelectorAll(".payment-method input")
  const cardForm = document.getElementById("card-form")
  const yapeForm = document.getElementById("yape-form")

  methods.forEach((method) => {
    method.addEventListener("change", (e) => {
      // Update selected state
      document.querySelectorAll(".payment-method").forEach((m) => m.classList.remove("selected"))
      e.target.closest(".payment-method").classList.add("selected")

      // Toggle forms
      if (e.target.value === "card") {
        cardForm.style.display = "block"
        yapeForm.style.display = "none"
      } else {
        cardForm.style.display = "none"
        yapeForm.style.display = "block"
      }
    })
  })
}

// Setup card input formatting
function setupCardInputFormatting() {
  const cardNumber = document.getElementById("card-number")
  const cardExpiry = document.getElementById("card-expiry")
  const cardCvv = document.getElementById("card-cvv")

  if (cardNumber) {
    cardNumber.addEventListener("input", (e) => {
      let value = e.target.value.replace(/\D/g, "")
      value = value.replace(/(\d{4})(?=\d)/g, "$1 ")
      e.target.value = value.substring(0, 19)
    })
  }

  if (cardExpiry) {
    cardExpiry.addEventListener("input", (e) => {
      let value = e.target.value.replace(/\D/g, "")
      if (value.length >= 2) {
        value = value.substring(0, 2) + "/" + value.substring(2, 4)
      }
      e.target.value = value
    })
  }

  if (cardCvv) {
    cardCvv.addEventListener("input", (e) => {
      e.target.value = e.target.value.replace(/\D/g, "").substring(0, 4)
    })
  }
}

// Process payment
function processPayment(appointmentId) {
  const selectedMethod = document.querySelector('input[name="payment-method"]:checked').value
  const user = AppState.currentUser

  // Validate card inputs if card method selected
  if (selectedMethod === "card") {
    const cardNumber = document.getElementById("card-number").value
    const cardExpiry = document.getElementById("card-expiry").value
    const cardCvv = document.getElementById("card-cvv").value
    const cardName = document.getElementById("card-name").value

    if (!cardNumber || cardNumber.replace(/\s/g, "").length < 16) {
      showToast("error", "Error", "Ingresa un número de tarjeta válido")
      return
    }
    if (!cardExpiry || cardExpiry.length < 5) {
      showToast("error", "Error", "Ingresa la fecha de expiración")
      return
    }
    if (!cardCvv || cardCvv.length < 3) {
      showToast("error", "Error", "Ingresa el CVV")
      return
    }
    if (!cardName) {
      showToast("error", "Error", "Ingresa el nombre del titular")
      return
    }
  }

  // Show processing state
  const payBtn = document.querySelector(".btn-pay")
  payBtn.disabled = true
  payBtn.innerHTML = `
    <svg class="spinner" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <circle cx="12" cy="12" r="10"/>
    </svg>
    Procesando...
  `

  // Simulate payment processing
  setTimeout(() => {
    confirmReservation(appointmentId)
  }, 2000)
}

// Confirm reservation
function confirmReservation(appointmentId) {
  const user = AppState.currentUser
  const aptIndex = AppState.appointments.findIndex((a) => a.id === appointmentId)

  if (aptIndex > -1) {
    const apt = AppState.appointments[aptIndex]

    AppState.appointments[aptIndex].status = "reserved"
    AppState.appointments[aptIndex].patientId = user.id
    AppState.appointments[aptIndex].patientName = user.name
    AppState.appointments[aptIndex].paymentStatus = "paid"
    AppState.appointments[aptIndex].paymentDate = new Date().toISOString()

    localStorage.setItem("docspot_appointments", JSON.stringify(AppState.appointments))

    closeModal()

    // Show success modal with email notification
    showSuccessModal(apt)
  }
}

// Show success modal with email notification
function showSuccessModal(apt) {
  const user = AppState.currentUser

  const modal = document.createElement("div")
  modal.className = "modal-overlay"
  modal.id = "reserve-modal"
  modal.innerHTML = `
        <div class="modal modal-success">
            <div class="modal-body">
                <div class="success-animation">
                    <svg class="checkmark" width="80" height="80" viewBox="0 0 80 80">
                        <circle class="checkmark-circle" cx="40" cy="40" r="36" fill="none" stroke="#10b981" stroke-width="4"/>
                        <path class="checkmark-check" fill="none" stroke="#10b981" stroke-width="4" d="M24 42l10 10 22-22"/>
                    </svg>
                </div>
                <div class="success-text">
                    <h3>¡Pago Exitoso!</h3>
                    <p>Tu cita ha sido reservada y pagada correctamente</p>
                </div>
                
                <div class="email-notification">
                    <div class="email-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                            <polyline points="22,6 12,13 2,6"/>
                        </svg>
                    </div>
                    <div class="email-info">
                        <p>Hemos enviado la confirmación a:</p>
                        <strong>${user.email}</strong>
                    </div>
                </div>
                
                <div class="reservation-summary">
                    <h4>Detalles de tu cita</h4>
                    <div class="summary-item">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
                            <circle cx="12" cy="10" r="3"/>
                        </svg>
                        <span>${apt.clinic}</span>
                    </div>
                    <div class="summary-item">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
                            <circle cx="12" cy="7" r="4"/>
                        </svg>
                        <span>${apt.doctorName}</span>
                    </div>
                    <div class="summary-item">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"/>
                            <polyline points="12,6 12,12 16,14"/>
                        </svg>
                        <span>Hoy a las ${apt.time}</span>
                    </div>
                    <div class="summary-item">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M12 2C8 2 6 5 6 8c0 2 1 4 2 5l-1 7c0 1 1 2 2 2h6c1 0 2-1 2-2l-1-7c1-1 2-3 2-5 0-3-2-6-6-6z"/>
                        </svg>
                        <span>${apt.service}</span>
                    </div>
                    <div class="summary-total">
                        <span>Total pagado:</span>
                        <strong>S/ ${apt.price}</strong>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn-primary btn-full" onclick="closeSuccessAndRefresh()">Entendido</button>
            </div>
        </div>
    `

  document.body.appendChild(modal)
}

function closeSuccessAndRefresh() {
  const modal = document.getElementById("reserve-modal")
  if (modal) modal.remove()
  showPatientDashboard()
}

// Show screen
function showScreen(screenId) {
  document.querySelectorAll(".screen").forEach((screen) => screen.classList.remove("active"))
  document.getElementById(screenId).classList.add("active")
}

// Logout
function logout() {
  localStorage.removeItem("docspot_session")
  AppState.currentUser = null
  AppState.selectedRole = null

  // Reset forms
  document.getElementById("login-form-element")?.reset()
  document.getElementById("register-form-element")?.reset()

  showScreen("auth-screen")
  showRoleSelection()

  showToast("success", "Sesión cerrada", "Has cerrado sesión correctamente")
}

// Toast notification
function showToast(type, title, message) {
  const container = document.getElementById("toast-container")
  const toast = document.createElement("div")
  toast.className = `toast ${type}`

  const icons = {
    success:
      '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22,4 12,14.01 9,11.01"/></svg>',
    error:
      '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
    warning:
      '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
  }

  toast.innerHTML = `
        <span class="toast-icon">${icons[type]}</span>
        <div class="toast-content">
            <div class="toast-title">${title}</div>
            <div class="toast-message">${message}</div>
        </div>
        <button class="toast-close" onclick="this.parentElement.remove()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
        </button>
    `

  container.appendChild(toast)

  setTimeout(() => toast.remove(), 5000)
}
