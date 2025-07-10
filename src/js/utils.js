//Este archivo maneja la loguica de las validaciones, almacenamiento local y formateo de datos.
// utils.js - Funciones reutilizables de validación

/**
 * Valida que el nombre de usuario sea válido
 * - No vacío
 * - Solo letras, números, guiones y guiones bajos
 * - Entre 3 y 20 caracteres
 * @param {string} username
 * @returns {boolean}
 */
function validarUsername(username) {
  const regex = /^[a-zA-Z0-9_-]{3,20}$/;
  return regex.test(username);
}

/**
 * Valida que el email tenga formato correcto
 * @param {string} email
 * @returns {boolean}
 */
function validarEmail(email) {
  // Regex simple para email
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

/**
 * Valida que la contraseña cumpla con requisitos mínimos
 * - Al menos 8 caracteres
 * - Al menos una letra mayúscula
 * - Al menos una letra minúscula
 * - Al menos un número
 * @param {string} password
 * @returns {boolean}
 */
function validarPassword(password) {
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  return regex.test(password);
}

/**
 * Compara si dos contraseñas son iguales
 * @param {string} pass1
 * @param {string} pass2
 * @returns {boolean}
 */
function compararPasswords(pass1, pass2) {
  return pass1 === pass2;
}

function guardarPaginaAnterior() {
  // Guardamos el path relativo, como 'guitar.html' o 'keyboard.html'
  const actual = window.location.pathname.split('/').pop();
  sessionStorage.setItem('paginaAnteriorCookies', actual);
}