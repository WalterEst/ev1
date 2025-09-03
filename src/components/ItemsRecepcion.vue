<script setup>
import { ref, computed } from 'vue'
import { useRecepcionStore } from '../stores/useRecepcionStore.js'

// Props con el identificador de la recepción seleccionada
const props = defineProps({
  idRecepcion: { type: Number, required: false }
})

// Acceso al estado global
const { state } = useRecepcionStore()

// Formulario de ítems
const form = ref({ id_libro: '', cantidad: 1, estado: 'correcto', observacion: '' })
const editId = ref(null)

// Ítems asociados a la recepción actual
const items = computed(() => state.items.filter(it => it.id_recepcion === props.idRecepcion))

function agregar(){
  if(!form.value.id_libro || form.value.cantidad <= 0 || !['correcto','dañado','mixto'].includes(form.value.estado)){
    alert('Complete los datos del ítem')
    return
  }
  if(editId.value){
    // Modificación de un ítem existente
    const idx = state.items.findIndex(it => it.id === editId.value)
    if(idx > -1){
      state.items[idx] = { ...state.items[idx], ...form.value, id_libro: Number(form.value.id_libro), cantidad: Number(form.value.cantidad) }
    }
  }else{
    // Nuevo ítem
    state.items.push({
      id: state._seq.items++,
      id_recepcion: props.idRecepcion,
      id_libro: Number(form.value.id_libro),
      cantidad: Number(form.value.cantidad),
      estado: form.value.estado,
      observacion: form.value.observacion
    })
  }
  form.value = { id_libro: '', cantidad: 1, estado: 'correcto', observacion: '' }
  editId.value = null
}

function editar(it){
  form.value = { id_libro: String(it.id_libro), cantidad: it.cantidad, estado: it.estado, observacion: it.observacion }
  editId.value = it.id
}

function eliminar(id){
  const idx = state.items.findIndex(it => it.id === id)
  if(idx > -1) state.items.splice(idx,1)
}
</script>

<template>
  <div class="card" v-if="idRecepcion">
    <h3>Detalle recepción #{{ idRecepcion }}</h3>

    <form @submit.prevent="agregar" class="hstack">
      <select v-model="form.id_libro">
        <option value="">— Libro —</option>
        <option v-for="l in state?.libros || []" :key="l.id" :value="l.id">{{ l.titulo }}</option>
      </select>
      <input type="number" v-model.number="form.cantidad" min="1" placeholder="Cantidad" />
      <select v-model="form.estado">
        <option value="correcto">Correcto</option>
        <option value="dañado">Dañado</option>
        <option value="mixto">Mixto</option>
      </select>
      <input v-model="form.observacion" placeholder="Observación" />
      <button type="submit">{{ editId ? 'Actualizar' : 'Agregar' }}</button>
    </form>

    <ul>
      <li v-for="it in items" :key="it.id">
        Libro #{{ it.id_libro }} — Cant: {{ it.cantidad }} — {{ it.estado }} — {{ it.observacion }}
        <button @click="editar(it)">Editar</button>
        <button @click="eliminar(it.id)">Eliminar</button>
      </li>
    </ul>
  </div>
</template>
