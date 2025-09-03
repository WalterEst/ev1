<script setup>
import { ref } from 'vue'
import { useRecepcionStore } from '../stores/useRecepcionStore.js'

// Acceso al estado global
const { state } = useRecepcionStore()

// Modelo del formulario
const form = ref({ rut: '', nombre: '', contacto: '' })

// Valida RUT chileno con dígito verificador
function validarRut(rut){
  const limpio = rut.replace(/[^0-9kK]/g, '').toUpperCase()
  if(limpio.length < 2) return false
  const cuerpo = limpio.slice(0, -1)
  const dv = limpio.slice(-1)
  let suma = 0, multiplo = 2
  for(let i=cuerpo.length-1;i>=0;i--){
    suma += parseInt(cuerpo[i]) * multiplo
    multiplo = multiplo === 7 ? 2 : multiplo + 1
  }
  const res = 11 - (suma % 11)
  const digito = res === 11 ? '0' : res === 10 ? 'K' : String(res)
  return digito === dv
}

function guardar(){
  if(!validarRut(form.value.rut)){
    alert('RUT inválido')
    return
  }
  if(!form.value.nombre){
    alert('Nombre obligatorio')
    return
  }
  // Se agrega el proveedor y se actualiza el correlativo
  state.proveedores.push({ id: state._seq.proveedores++, ...form.value })
  form.value = { rut: '', nombre: '', contacto: '' }
}
</script>

<template>
  <div>
    <h2>Proveedores</h2>
    <form @submit.prevent="guardar" class="hstack">
      <input v-model="form.rut" placeholder="RUT" />
      <input v-model="form.nombre" placeholder="Nombre" />
      <input v-model="form.contacto" placeholder="Contacto" />
      <button type="submit">Agregar</button>
    </form>
    <ul>
      <li v-for="p in state.proveedores" :key="p.id">{{ p.nombre }} - {{ p.rut }}</li>
    </ul>
  </div>
</template>
