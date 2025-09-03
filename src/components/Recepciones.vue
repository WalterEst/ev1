<script setup>
import { ref, computed } from 'vue'
import { useRecepcionStore } from '../stores/useRecepcionStore.js'
import ItemsRecepcion from './ItemsRecepcion.vue'

const { state } = useRecepcionStore()

// Formularios
const form = ref({ fecha: '', nro_guia: '', id_proveedor: '' })
const filtro = ref({ proveedor: '', desde: '', hasta: '' })
const seleccion = ref(null)
const error = ref('')

function guardar(){
  error.value = ''
  const hoy = new Date().toISOString().slice(0,10)
  if(!form.value.fecha || form.value.fecha > hoy){
    error.value = 'Fecha inválida'
    return
  }
  if(!form.value.id_proveedor){
    error.value = 'Seleccione proveedor'
    return
  }
  state.recepciones.push({ id: state._seq.recepciones++, fecha: form.value.fecha, nro_guia: form.value.nro_guia, id_proveedor: Number(form.value.id_proveedor) })
  seleccion.value = state.recepciones[state.recepciones.length-1].id
  form.value = { fecha: '', nro_guia: '', id_proveedor: '' }
}

// Lista filtrada de recepciones
const lista = computed(() => state.recepciones.filter(r => {
  if(filtro.value.proveedor && r.id_proveedor !== Number(filtro.value.proveedor)) return false
  if(filtro.value.desde && r.fecha < filtro.value.desde) return false
  if(filtro.value.hasta && r.fecha > filtro.value.hasta) return false
  return true
}))

// Total de ejemplares por recepción
function total(id){
  return state.items.filter(it => it.id_recepcion === id).reduce((s,it)=>s+it.cantidad,0)
}

// Porcentaje de defectuosos
function pctDef(id){
  const t = total(id)
  if(t === 0) return 0
  const d = state.items.filter(it => it.id_recepcion === id && it.estado !== 'correcto').reduce((s,it)=>s+it.cantidad,0)
  return ((d*100)/t).toFixed(1)
}
</script>

<template>
  <div>
    <h2>Recepciones</h2>
    <form @submit.prevent="guardar" class="hstack">
      <input type="date" v-model="form.fecha" />
      <input v-model="form.nro_guia" placeholder="N° Guía/Factura" />
      <select v-model="form.id_proveedor">
        <option value="">-- Proveedor --</option>
        <option v-for="p in state.proveedores" :key="p.id" :value="p.id">{{ p.nombre }}</option>
      </select>
      <button type="submit">Agregar</button>
    </form>
    <p class="error" v-if="error">{{ error }}</p>

    <!-- Filtros -->
    <div class="hstack">
      <select v-model="filtro.proveedor">
        <option value="">Todos</option>
        <option v-for="p in state.proveedores" :key="p.id" :value="p.id">{{ p.nombre }}</option>
      </select>
      <input type="date" v-model="filtro.desde" />
      <input type="date" v-model="filtro.hasta" />
    </div>

    <table class="table">
      <thead>
        <tr>
          <th>#</th><th>Fecha</th><th>Proveedor</th><th>N° Guía</th><th>Total</th><th>% Def.</th><th>Detalle</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="r in lista" :key="r.id">
          <td>{{ r.id }}</td>
          <td>{{ r.fecha }}</td>
          <td>{{ state.proveedores.find(p => p.id === r.id_proveedor)?.nombre || '—' }}</td>
          <td>{{ r.nro_guia }}</td>
          <td>{{ total(r.id) }}</td>
          <td>{{ pctDef(r.id) }}%</td>
          <td><button @click="seleccion = r.id">Ver</button></td>
        </tr>
      </tbody>
    </table>

    <ItemsRecepcion :id-recepcion="seleccion" />
  </div>
</template>
