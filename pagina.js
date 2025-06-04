document.addEventListener('DOMContentLoaded', function() {
    // Variables globales
    let currentUser = null;
    let patients = JSON.parse(localStorage.getItem('patients')) || [];
    const itemsPerPage = 10;
    let currentPage = 1;
    
    // Elementos del DOM
    const loginSystem = document.getElementById('loginSystem');
    const mainSystem = document.getElementById('mainSystem');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const showRegister = document.getElementById('showRegister');
    const showLogin = document.getElementById('showLogin');
    const togglePassword = document.getElementById('togglePassword');
    const toggleRegisterPassword = document.getElementById('toggleRegisterPassword');
    const logoutBtn = document.getElementById('logoutBtn');
    const patientForm = document.getElementById('patientForm');
    const patientsTable = document.getElementById('patientsTable').getElementsByTagName('tbody')[0];
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    const pagination = document.getElementById('pagination');
    const patientModal = new bootstrap.Modal(document.getElementById('patientModal'));
    const criticalAlertModal = new bootstrap.Modal(document.getElementById('criticalAlertModal'));
    
    // Inicializar el sistema
    initSystem();
    
    // Función para inicializar el sistema
    function initSystem() {
        // Verificar si hay un usuario logueado
        const loggedInUser = localStorage.getItem('currentUser');
        if (loggedInUser) {
            currentUser = JSON.parse(loggedInUser);
            showMainSystem();
        } else {
            showLoginSystem();
        }
        
        // Configurar eventos
        setupEventListeners();
    }
    
    // Configurar event listeners
    function setupEventListeners() {
        // Login/Register
        loginForm.addEventListener('submit', handleLogin);
        registerForm.addEventListener('submit', handleRegister);
        showRegister.addEventListener('click', toggleLoginRegister);
        showLogin.addEventListener('click', toggleLoginRegister);
        togglePassword.addEventListener('click', togglePasswordVisibility);
        toggleRegisterPassword.addEventListener('click', toggleRegisterPasswordVisibility);
        logoutBtn.addEventListener('click', handleLogout);
        
        // Patient Form
        patientForm.addEventListener('submit', handlePatientSubmit);
        document.getElementById('documento').addEventListener('input', validateDocument);
        
        // Search
        searchInput.addEventListener('keyup', handleSearch);
        searchBtn.addEventListener('click', handleSearch);
        
        // Modals
        document.getElementById('printPatientBtn').addEventListener('click', printPatientDetails);
    }
    
    // Mostrar sistema de login
    function showLoginSystem() {
        loginSystem.style.display = 'flex';
        mainSystem.style.display = 'none';
    }
    
    // Mostrar sistema principal
    function showMainSystem() {
        loginSystem.style.display = 'none';
        mainSystem.style.display = 'block';
        document.getElementById('currentUser').textContent = currentUser.username;
        
        // Actualizar la interfaz
        updatePatientsTable();
        updateStats();
    }
    
    // Alternar entre login y registro
    function toggleLoginRegister() {
        const loginBox = document.querySelector('.login-box');
        const registerBox = document.querySelector('.register-box');
        
        if (loginBox.style.display === 'none') {
            loginBox.style.display = 'block';
            registerBox.style.display = 'none';
        } else {
            loginBox.style.display = 'none';
            registerBox.style.display = 'block';
        }
    }
    
    // Alternar visibilidad de contraseña
    function togglePasswordVisibility() {
        const passwordInput = document.getElementById('loginPassword');
        const icon = this.querySelector('i');
        
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            icon.classList.remove('fa-eye');
            icon.classList.add('fa-eye-slash');
        } else {
            passwordInput.type = 'password';
            icon.classList.remove('fa-eye-slash');
            icon.classList.add('fa-eye');
        }
    }
    
    // Alternar visibilidad de contraseña en registro
    function toggleRegisterPasswordVisibility() {
        const passwordInput = document.getElementById('registerPassword');
        const icon = this.querySelector('i');
        
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            icon.classList.remove('fa-eye');
            icon.classList.add('fa-eye-slash');
        } else {
            passwordInput.type = 'password';
            icon.classList.remove('fa-eye-slash');
            icon.classList.add('fa-eye');
        }
    }
    
    // Manejar login
    function handleLogin(e) {
        e.preventDefault();
        
        const username = document.getElementById('loginUser').value;
        const password = document.getElementById('loginPassword').value;
        
        // Validación simple
        if (!username || !password) {
            alert('Por favor ingrese usuario y contraseña');
            return;
        }
        
        // Verificar credenciales (en un sistema real esto sería con backend)
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const user = users.find(u => u.username === username && u.password === password);
        
        if (user) {
            currentUser = user;
            localStorage.setItem('currentUser', JSON.stringify(user));
            showMainSystem();
        } else {
            alert('Usuario o contraseña incorrectos');
        }
    }
    
    // Manejar registro
    function handleRegister(e) {
        e.preventDefault();
        
        const username = document.getElementById('registerUser').value;
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('registerConfirm').value;
        const email = document.getElementById('registerEmail').value;
        
        // Validaciones
        if (!username || !password || !confirmPassword || !email) {
            alert('Por favor complete todos los campos');
            return;
        }
        
        if (password.length < 8) {
            alert('La contraseña debe tener al menos 8 caracteres');
            return;
        }
        
        if (password !== confirmPassword) {
            alert('Las contraseñas no coinciden');
            return;
        }
        
        if (!validateEmail(email)) {
            alert('Por favor ingrese un email válido');
            return;
        }
        
        // Registrar usuario (en un sistema real esto sería con backend)
        const users = JSON.parse(localStorage.getItem('users')) || [];
        
        // Verificar si el usuario ya existe
        if (users.some(u => u.username === username)) {
            alert('El nombre de usuario ya está en uso');
            return;
        }
        
        const newUser = {
            username,
            password, // En un sistema real, nunca almacenar contraseñas en texto plano
            email,
            createdAt: new Date().toISOString()
        };
        
        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));
        
        alert('Registro exitoso. Por favor inicie sesión.');
        toggleLoginRegister();
        registerForm.reset();
    }
    
    // Validar email
    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }
    
    // Manejar logout
    function handleLogout() {
        localStorage.removeItem('currentUser');
        currentUser = null;
        showLoginSystem();
    }
    
    // Validar documento según tipo seleccionado
    function validateDocument() {
        const docInput = this;
        const docValue = docInput.value;
        const docType = document.querySelector('input[name="tipoDocumento"]:checked').value;
        let isValid = true;
        let message = '';
        
        if (docType === 'CI') {
            // Validar CI (ejemplo: 1.234.567-8)
            const ciRegex = /^[1-9]\.\d{3}\.\d{3}-[0-9kK]$/;
            isValid = ciRegex.test(docValue);
            message = 'Formato requerido: X.XXX.XXX-X';
        } else if (docType === 'Pasaporte') {
            // Validar pasaporte (ejemplo: AB123456)
            const passportRegex = /^[A-Za-z]{2}\d{6}$/;
            isValid = passportRegex.test(docValue);
            message = 'Formato requerido: 2 letras seguidas de 6 números';
        } else {
            // Documento extranjero (mínimo 5 caracteres)
            isValid = docValue.length >= 5;
            message = 'Mínimo 5 caracteres';
        }
        
        const helpText = document.getElementById('documentoHelp');
        helpText.textContent = message;
        
        if (docValue.length > 0) {
            if (isValid) {
                docInput.classList.remove('is-invalid');
                docInput.classList.add('is-valid');
                helpText.classList.remove('text-danger');
                helpText.classList.add('text-success');
            } else {
                docInput.classList.remove('is-valid');
                docInput.classList.add('is-invalid');
                helpText.classList.remove('text-success');
                helpText.classList.add('text-danger');
            }
        } else {
            docInput.classList.remove('is-valid', 'is-invalid');
            helpText.classList.remove('text-success', 'text-danger');
        }
    }
    
    // Manejar envío de formulario de paciente
    function handlePatientSubmit(e) {
        e.preventDefault();
        
        if (!validatePatientForm()) {
            return;
        }
        
        // Obtener valores del formulario
        const tipoDocumento = document.querySelector('input[name="tipoDocumento"]:checked').value;
        const examenes = Array.from(document.querySelectorAll('.examenes-container input[type="checkbox"]:checked'))
                            .map(el => el.value)
                            .join(', ');
        
        const newPatient = {
            id: Date.now().toString(),
            nombre: document.getElementById('nombre').value.trim(),
            edad: parseInt(document.getElementById('edad').value),
            genero: document.getElementById('genero').value,
            tipoDocumento,
            documento: document.getElementById('documento').value.trim(),
            sintomas: document.getElementById('sintomas').value.trim(),
            gravedad: document.getElementById('gravedad').value.replace(/\(.*\)/, '').trim(),
            tratamiento: document.getElementById('tratamiento').value.trim(),
            medicamentos: Array.from(document.getElementById('medicamentos').selectedOptions)
                              .map(opt => opt.value)
                              .join(', '),
            examenes,
            observaciones: document.getElementById('observaciones').value.trim(),
            fechaRegistro: new Date().toISOString(),
            registradoPor: currentUser.username
        };
        
        // Agregar paciente y actualizar
        patients.push(newPatient);
        localStorage.setItem('patients', JSON.stringify(patients));
        
        // Ordenar por gravedad
        sortPatientsBySeverity();
        
        // Actualizar UI
        updatePatientsTable();
        updateStats();
        
        // Mostrar alerta si es crítico
        if (newPatient.gravedad === 'Crítico') {
            showCriticalAlert(newPatient);
        }
        
        // Resetear formulario
        patientForm.reset();
        document.getElementById('documentoHelp').classList.remove('text-success', 'text-danger');
        
        // Mostrar mensaje de éxito
        showAlert('Paciente registrado exitosamente', 'success');
    }
    
    // Validar formulario de paciente
    function validatePatientForm() {
        let isValid = true;
        const requiredFields = patientForm.querySelectorAll('[required]');
        
        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                field.classList.add('is-invalid');
                isValid = false;
            } else {
                field.classList.remove('is-invalid');
            }
        });
        
        // Validar documento
        const docInput = document.getElementById('documento');
        if (!docInput.value.trim() || docInput.classList.contains('is-invalid')) {
            docInput.classList.add('is-invalid');
            isValid = false;
        }
        
        return isValid;
    }
})