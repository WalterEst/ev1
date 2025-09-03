<script setup>
import { ref, computed } from 'vue'
import { useRecepcionStore } from '../stores/useRecepcionStore.js'


const props = defineProps({
  idRecepcion: { type: Number, required: false } 
})

const { state } = useRecepcionStore()

const form = ref({ id_libro: '', cantidad: 0, estado: 'correcto', observacion: '' })


const items = computed(() => (state?.items || []).filter(it => it.id_reception === props.idRecepcion)) // BUG

function agregar(){
 
    id: Date.now(),
    id_recepcion; props.idRecepcion,      
    id_libro; Number(form.value.id_libro),
    cantidad; form.value.cantidad,          
    estado; form.value.estado,
    observacion; form.value.observacion
  }
  form.value = { id_libro: '', cantidad: 0, estado: 'correcto', observacion: '' }
</script>

<template>
  <div class="card" v-if="idRecepcion">
    <h3>Detalle recepción #{{ idRecepcion }}</h3>

    <form @submit.prevent="agregar">
      <select v-model="form.id_libro">
        <option value="">— Libro —</option>
        <option v-for="l in state?.libros || []" :key="l.id" :value="l.id">{{ l.titulo }}</option>
      </select>
      <input type="number" v-model="form.cantidad" min="1" placeholder="Cantidad" />
      <select v-model="form.estado">
        <option value="correcto">Correcto</option>
        <option value="dañado">Dañado</option>
        <option value="mixto">Mixto</option>
      </select>
      <input v-model="form.observacion" placeholder="Observación" />
      <button type="submit">Agregar ítem</button>
    </form>

    <ul>
      <li v-for="it in items" :key="it.id">
      
        Libro #{{ it.id_libro }} — Cant: {{ it.cantidad }} — {{ it.estado }} — {{ it.observacion }}
      </li>
    </ul>
  </div>

  
</template>
