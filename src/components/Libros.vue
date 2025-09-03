<script setup>
import { ref } from 'vue'
import { useRecepcionStore } from '../stores/useRecepcionStore.js'

const { state } = useRecepcionStore()

// Datos del formulario
const form = ref({ isbn: '', titulo: '', editorial: '', nivel: 'Básica', anio: new Date().getFullYear() })

// Valida que el ISBN tenga 10 o 13 dígitos (sin guiones)
function esISBN(val){
  const limpio = val.replace(/[-\s]/g, '')
  return /^\d{10}$/.test(limpio) || /^\d{13}$/.test(limpio)
}

function guardar(){
  if(!esISBN(form.value.isbn)){
    alert('ISBN debe tener 10 o 13 dígitos')
    return
  }
  // Se guarda con el correlativo correcto
  state.libros.push({ id: state._seq.libros++, ...form.value })
  form.value = { isbn: '', titulo: '', editorial: '', nivel: 'Básica', anio: new Date().getFullYear() }
}
</script>

<template>
  <div>
    <h2>Libros</h2>
    <form @submit.prevent="guardar">
      <input v-model="form.isbn" placeholder="ISBN" />
      <input v-model="form.titulo" placeholder="Título" />
      <input v-model="form.editorial" placeholder="Editorial" />
      <select v-model="form.nivel">
        <option>Básica</option>
        <option>Media</option>
      </select>
      <input v-model.number="form.anio" type="number" placeholder="Año" />
      <button type="submit">Agregar</button>
    </form>

    <ul>
      <li v-for="l in state?.libros || []" :key="l.id">{{ l.titulo }} - {{ l.isbn }} - {{ l.anio }}</li>
    </ul>
  </div>
</template>
