// Store central con persistencia en localStorage
import { reactive, watch } from 'vue'

// Clave única para aislar los datos del resto de la plataforma
const KEY = 'recepcion-store'

// Estructura inicial de datos
// Definir valores de ejemplo facilita las pruebas y sirve como documentación viva
const defaults = {
  proveedores: [
    { id: 1, nombre: 'Editorial Santillana', rut: '76.123.456-7', contacto: 'soporte@santillana.cl' }
  ],
  libros: [
    { id: 1, isbn: '9789561234560', titulo: 'Matemática 5° Básico', editorial: 'Santillana', nivel: 'Básica', anio: 2024 }
  ],
  recepciones: [
    { id: 1, fecha: '2024-09-01', nro_guia: 'G-55421', id_proveedor: 1 }
  ],
  items: [
    { id: 1, id_recepcion: 1, id_libro: 1, cantidad: 450, estado: 'mixto', observacion: '5 libros arrugados' }
  ],
  _seq: { proveedores: 2, libros: 2, recepciones: 2, items: 2 }
}

// Cargamos desde localStorage o usamos los valores por defecto
// `reactive` se usa para evitar dependencias adicionales como Pinia manteniendo reactividad
const state = reactive(JSON.parse(localStorage.getItem(KEY) || 'null') || defaults)

// Guarda el estado ante cualquier cambio profundo
// `deep: true` garantiza que incluso cambios anidados se sincronicen
watch(state, val => {
  localStorage.setItem(KEY, JSON.stringify(val))
}, { deep: true })

// Hook de acceso al estado
// Exponerlo como función permite reusar la misma instancia en toda la app
export function useRecepcionStore(){
  return { state }
}
