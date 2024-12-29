// Función para mostrar mensajes de error en un área del DOM
function showError(message) {
  const errorContainer = document.getElementById('error-container');
  if (errorContainer) {
      errorContainer.textContent = message;
  }
}

// Crear el formulario de contacto
const formularioDiv = document.getElementById('formularioContacto');
if (!formularioDiv) {
  showError('No se encontró el elemento con id "formularioContacto".');
} else {
  formularioDiv.classList.add('visible');
  crearFormulario();
}

function crearFormulario() {
  const formularioContainer = document.getElementById('formulario');
  if (!formularioContainer) {
      showError('No se encontró el contenedor del formulario con id "formulario".');
      return; // No continuar si el contenedor no existe
  }

  const formulario = document.createElement('form');
  formulario.setAttribute('id', 'contactoForm');
  formulario.setAttribute('novalidate', ''); // Deshabilita la validación nativa del navegador

  const campoConfiguraciones = [
      { label: 'Nombre y Apellido', id: 'nombre', name: 'nombre', type: 'text' },
      { label: 'Correo Electrónico', id: 'correo', name: 'correo', type: 'email' },
      { label: 'Empresa', id: 'empresa', name: 'empresa', type: 'text' },
      { label: 'Rubro', id: 'rubro', name: 'rubro', type: 'text' },
      { label: 'Mensaje', id: 'mensaje', name: 'mensaje', type: 'textarea' }
  ];

  // Crear campos del formulario usando desestructuración
  campoConfiguraciones.forEach(({ label, id, name, type }) => {
      if (!label || !id || !name || !type) {
          showError('Configuración del campo incompleta: ' + JSON.stringify({ label, id, name, type }));
          return; // Si falta alguna propiedad crítica, no crear el campo
      }
      crearCampoFormulario(formulario, { label, id, name, type });
  });

  // Agregar el botón de enviar
  agregarBotonEnviar(formulario);

  // Agregar el formulario al contenedor
  formularioContainer.appendChild(formulario);

  // Manejar el evento de submit
  formulario.addEventListener('submit', manejarSubmitFormulario);
}

// Crear un campo del formulario basado en la configuración
function crearCampoFormulario(formulario, { label, id, name, type }) {
  const div = document.createElement('div');
  div.classList.add('form-group');
  
  const labelElement = document.createElement('label');
  labelElement.setAttribute('for', id);
  labelElement.textContent = label;
  
  const input = document.createElement(type === 'textarea' ? 'textarea' : 'input');
  input.setAttribute('id', id);
  input.setAttribute('name', name);

  // Si es un textarea, establecemos las filas
  if (type === 'textarea') {
      input.setAttribute('rows', '4');
  }

  div.appendChild(labelElement);
  div.appendChild(input);
  formulario.appendChild(div);
}

// Agregar el botón de enviar al formulario
function agregarBotonEnviar(formulario) {
  const submitDiv = document.createElement('div');
  const submitButton = document.createElement('button');
  submitButton.textContent = 'Enviar';
  submitButton.setAttribute('type', 'submit');
  submitDiv.appendChild(submitButton);
  formulario.appendChild(submitDiv);
}

// Manejar el evento de submit del formulario
function manejarSubmitFormulario(event) {
  event.preventDefault();

  // Limpiar los estilos de error previos
  const inputs = event.target.querySelectorAll('input, textarea');
  inputs.forEach(input => input.classList.remove('error'));

  let hayErrores = false;
  const formData = {};

  inputs.forEach(input => {
      const { id, value } = input;  // Desestructuración para obtener id y value
      if (!value) {
          input.classList.add('error');
          hayErrores = true;
      } else {
          formData[id] = value;
      }
  });

  if (hayErrores) {
      showError('Por favor, completa todos los campos del formulario.');
      return;
  }

  // Guardar los datos en sessionStorage antes de enviar
  const storage = new Storage();
  storage.save(formData);

  // Mostrar el mensaje de éxito
  const formularioContainer = document.getElementById('formulario');
  if (!formularioContainer) {
      showError('No se encontró el contenedor del formulario para mostrar el mensaje de éxito.');
      return;
  }

  formularioContainer.innerHTML = `
      <div class="mensaje-exito">
          <h2>¡Gracias por ponerte en contacto con nosotros</h2>
          <p>En breve, responderemos con toda la info necesaria. Revisá tu correo!!</p>
      </div>
  `;
}

// Abstracción para manejar el almacenamiento en sessionStorage
class Storage {
  save(data) {
      if (data && typeof data === 'object') {
          sessionStorage.setItem('contactFormData', JSON.stringify(data));
      } else {
          showError('Datos inválidos para guardar en sessionStorage: ' + JSON.stringify(data));
      }
  }

  load() {
      const data = sessionStorage.getItem('contactFormData');
      return data ? JSON.parse(data) : null;
  }

  clear() {
      sessionStorage.removeItem('contactFormData');
  }
}

// Recuperar los datos almacenados en sessionStorage y completar el formulario
const storage = new Storage();
const savedData = storage.load();

if (savedData) {
  // Completar los campos del formulario con los datos guardados usando desestructuración
  Object.keys(savedData).forEach(key => {
      const input = document.getElementById(key);
      if (input) {
          input.value = savedData[key];
      } else {
          showError(`No se encontró el input con id "${key}".`);
      }
  });
}

// Guardar los datos del formulario en sessionStorage cuando el usuario escribe
document.querySelectorAll('input, textarea').forEach(input => {
  input.addEventListener('input', () => saveFormData());
});

// Función para guardar los datos en sessionStorage
function saveFormData() {
  const formData = {};
  document.querySelectorAll('input, textarea').forEach(input => {
      const { id, value } = input;  // Desestructuración para obtener id y value
      if (id) { // Asegurarse de que el id no sea null o undefined
          formData[id] = value;
      }
  });

  const storage = new Storage();
  storage.save(formData);
}
