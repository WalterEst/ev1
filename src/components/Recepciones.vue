<script setup>
import { ref, computed, watch } from 'vue'
import { useRecepcionStore } from '../stores/useRecepcionStore.js'
import ItemsRecepcion from './ItemsRecepcion.vue'

const { state } = useRecepcionStore()

// ====== Formularios
const form = ref({ fecha: '', nro_guia: '', id_proveedor: '' })
const filtro = ref({ proveedor: '', desde: '', hasta: '' })
const seleccion = ref(null)
const error = ref('')
const touched = ref({ fecha: false, id_proveedor: false })

const hoy = new Date().toISOString().slice(0,10)

// Validaciones
const formErrors = computed(() => {
  const errs = {}
  if (!form.value.fecha) errs.fecha = 'La fecha es requerida'
  else if (form.value.fecha > hoy) errs.fecha = 'No puede ser futura'
  if (!form.value.id_proveedor) errs.id_proveedor = 'Seleccione un proveedor'
  return errs
})
const isFormValid = computed(() => Object.keys(formErrors.value).length === 0)

function guardar(){
  error.value = ''
  if(!isFormValid.value){
    error.value = 'Revisa los campos marcados'
    return
  }
  state.recepciones.push({
    id: state._seq.recepciones++,
    fecha: form.value.fecha,
    nro_guia: form.value.nro_guia?.trim() || '',
    id_proveedor: Number(form.value.id_proveedor)
  })
  seleccion.value = state.recepciones[state.recepciones.length-1].id
  form.value = { fecha: '', nro_guia: '', id_proveedor: '' }
  touched.value = { fecha: false, id_proveedor: false }
}

// ====== Filtros y lista
const proveedoresOrdenados = computed(() =>
  [...state.proveedores].sort((a,b)=>a.nombre.localeCompare(b.nombre))
)

const lista = computed(() => state.recepciones.filter(r => {
  if(filtro.value.proveedor && r.id_proveedor !== Number(filtro.value.proveedor)) return false
  if(filtro.value.desde && r.fecha < filtro.value.desde) return false
  if(filtro.value.hasta && r.fecha > filtro.value.hasta) return false
  return true
}).sort((a,b)=> b.fecha.localeCompare(a.fecha) || b.id - a.id))

function limpiarFiltros(){
  filtro.value = { proveedor: '', desde: '', hasta: '' }
}

// Coherencia de rango fechas filtro
watch([() => filtro.value.desde, () => filtro.value.hasta], ([d,h]) => {
  if (d && h && d > h) filtro.value.hasta = d
})

// ====== Utilidades
function nombreProveedor(id){
  return state.proveedores.find(p => p.id === id)?.nombre || '—'
}

function total(id){
  return state.items.filter(it => it.id_recepcion === id)
    .reduce((s,it)=>s+Number(it.cantidad||0),0)
}

function pctDef(id){
  const t = total(id)
  if(t === 0) return 0
  const d = state.items.filter(it => it.id_recepcion === id && it.estado !== 'correcto')
    .reduce((s,it)=>s+Number(it.cantidad||0),0)
  return Number(((d*100)/t).toFixed(1))
}

function claseBadge(pct){
  if (pct >= 15) return 'badge danger'
  if (pct >= 5) return 'badge warn'
  return 'badge ok'
}

function seleccionar(id){
  seleccion.value = id
  // Scroll suave al panel de detalle en móviles
  requestAnimationFrame(() => {
    const el = document.getElementById('detalle-recepcion')
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  })
}
</script>

<template>
  <div class="wrapper">
    <header class="header">
      <h2>Recepciones</h2>
      <p class="sub">Registra y revisa las recepciones del día a día.</p>
    </header>

    <!-- Card: Nueva recepción -->
    <section class="card">
      <h3 class="card-title">Nueva recepción</h3>
      <form @submit.prevent="guardar" class="grid-form" novalidate>
        <div class="field">
          <label for="f-fecha">Fecha <span class="req">*</span></label>
          <input id="f-fecha" type="date"
                 v-model="form.fecha"
                 :max="hoy"
                 @blur="touched.fecha = true"
                 :aria-invalid="!!(touched.fecha && formErrors.fecha)"
                 :aria-errormessage="touched.fecha && formErrors.fecha ? 'err-fecha' : undefined" />
          <small v-if="touched.fecha && formErrors.fecha" :id="'err-fecha'" class="err">{{ formErrors.fecha }}</small>
        </div>

        <div class="field">
          <label for="f-guia">N° Guía/Factura</label>
          <input id="f-guia" v-model="form.nro_guia" placeholder="Ej: 123456 / F-45" />
          <small class="hint">Opcional</small>
        </div>

        <div class="field">
          <label for="f-prov">Proveedor <span class="req">*</span></label>
          <select id="f-prov" v-model="form.id_proveedor"
                  @blur="touched.id_proveedor = true"
                  :aria-invalid="!!(touched.id_proveedor && formErrors.id_proveedor)"
                  :aria-errormessage="touched.id_proveedor && formErrors.id_proveedor ? 'err-prov' : undefined">
            <option value="">— Seleccione proveedor —</option>
            <option v-for="p in proveedoresOrdenados" :key="p.id" :value="p.id">{{ p.nombre }}</option>
          </select>
          <small v-if="touched.id_proveedor && formErrors.id_proveedor" :id="'err-prov'" class="err">
            {{ formErrors.id_proveedor }}
          </small>
        </div>

        <div class="actions">
          <button type="submit" class="btn primary" :disabled="!isFormValid">Agregar</button>
          <p class="form-error" v-if="error">{{ error }}</p>
        </div>
      </form>
    </section>

    <!-- Card: Filtros -->
    <section class="card">
      <h3 class="card-title">Filtros</h3>
      <div class="filters">
        <div class="field">
          <label for="flt-prov">Proveedor</label>
          <select id="flt-prov" v-model="filtro.proveedor">
            <option value="">Todos</option>
            <option v-for="p in proveedoresOrdenados" :key="p.id" :value="p.id">{{ p.nombre }}</option>
          </select>
        </div>
        <div class="field">
          <label for="flt-desde">Desde</label>
          <input id="flt-desde" type="date" v-model="filtro.desde" :max="filtro.hasta || hoy" />
        </div>
        <div class="field">
          <label for="flt-hasta">Hasta</label>
          <input id="flt-hasta" type="date" v-model="filtro.hasta" :min="filtro.desde || ''" :max="hoy" />
        </div>
        <div class="actions">
          <button class="btn" @click="limpiarFiltros" type="button">Limpiar</button>
        </div>
      </div>
    </section>

    <!-- Tabla / lista -->
    <section class="card">
      <div class="table-wrap" v-if="lista.length">
        <table class="table">
          <thead>
            <tr>
              <th>#</th>
              <th>Fecha</th>
              <th>Proveedor</th>
              <th>N° Guía</th>
              <th class="num">Total</th>
              <th class="num">% Def.</th>
              <th>Detalle</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in lista" :key="r.id" :class="{ selected: r.id === seleccion }">
              <td data-label="#"> {{ r.id }} </td>
              <td data-label="Fecha"> {{ r.fecha }} </td>
              <td data-label="Proveedor"> {{ nombreProveedor(r.id_proveedor) }} </td>
              <td data-label="N° Guía"> {{ r.nro_guia || '—' }} </td>
              <td data-label="Total" class="num"> {{ total(r.id) }} </td>
              <td data-label="% Def." class="num">
                <span :class="claseBadge(pctDef(r.id))">{{ pctDef(r.id) }}%</span>
              </td>
              <td data-label="Detalle">
                <button class="btn link" @click="seleccionar(r.id)">Ver</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-else class="empty">
        <p>😌 No hay recepciones que coincidan con los filtros.</p>
        <button class="btn" @click="limpiarFiltros">Mostrar todo</button>
      </div>
    </section>

    <!-- Panel de detalle -->
    <section class="card slide" id="detalle-recepcion" v-if="seleccion">
      <div class="slide-header">
        <h3 class="card-title">Detalle de recepción #{{ seleccion }}</h3>
        <button class="btn ghost" @click="seleccion = null" aria-label="Cerrar detalle">Cerrar</button>
      </div>
      <ItemsRecepcion :id-recepcion="seleccion" />
    </section>
  </div>
</template>

<style scoped>
:root { --bg:#0b0c10; } /* no usado, pero puedes mapear a tu paleta */
.wrapper{ display:grid; gap:1rem; }
.header h2{ margin:0; }
.sub{ color:#6b7280; margin:.25rem 0 0; }

/* Cards */
.card{
  background:#fff;
  border:1px solid #e5e7eb;
  border-radius:14px;
  padding:1rem;
  box-shadow: 0 1px 2px rgba(0,0,0,.04);
}
.card-title{ margin:0 0 .75rem; font-size:1.05rem; }

/* Formulario */
.grid-form{
  display:grid;
  grid-template-columns: repeat(3, minmax(0,1fr));
  gap: .85rem;
  align-items: start;
}
.field{ display:flex; flex-direction:column; gap:.35rem; }
label{ font-weight:600; font-size:.9rem; }
.req{ color:#ef4444; }
input, select{
  border:1px solid #d1d5db;
  border-radius:10px;
  padding:.55rem .7rem;
  font: inherit;
  outline: none;
  background:#fff;
}
input:focus, select:focus{
  border-color:#3b82f6;
  box-shadow: 0 0 0 3px rgba(59,130,246,.15);
}
.hint{ color:#6b7280; font-size:.8rem; }
.err{ color:#b91c1c; font-size:.82rem; }
.form-error{ margin: .25rem 0 0; color:#b91c1c; }
.actions{ display:flex; align-items:center; gap:.75rem; }

.btn{
  border:1px solid #d1d5db;
  background:#f9fafb;
  border-radius:10px;
  padding:.55rem .9rem;
  cursor:pointer;
}
.btn:hover{ background:#f3f4f6; }
.btn.primary{
  background:#2563eb; border-color:#2563eb; color:#fff;
}
.btn.primary:disabled{ opacity:.6; cursor:not-allowed; }
.btn.link{
  background:transparent; border:none; color:#2563eb; padding:0;
}
.btn.ghost{
  background:transparent; border:none; color:#6b7280;
}
.filters{
  display:grid;
  grid-template-columns: repeat(4, minmax(0,1fr));
  gap:.85rem;
  align-items:end;
}

/* Tabla */
.table-wrap{ overflow:auto; }
.table{
  width:100%;
  border-collapse: collapse;
}
thead th{
  position: sticky; top:0;
  background:#f9fafb;
  text-align:left;
  padding:.65rem .6rem;
  font-size:.85rem;
  border-bottom:1px solid #e5e7eb;
}
tbody td{
  padding:.65rem .6rem;
  border-bottom:1px solid #f3f4f6;
  vertical-align: middle;
}
.num{ text-align:right; }
.selected{ background:#f0f9ff; }
.badge{
  display:inline-block;
  padding:.15rem .45rem;
  border-radius: 999px;
  font-size:.8rem;
}
.badge.ok{ background:#ecfdf5; color:#065f46; }
.badge.warn{ background:#fffbeb; color:#92400e; }
.badge.danger{ background:#fef2f2; color:#991b1b; }

/* Empty */
.empty{
  display:flex; flex-direction: column; align-items: flex-start; gap:.5rem;
  color:#6b7280;
}

/* Slide panel */
.slide .slide-header{
  display:flex; justify-content:space-between; align-items:center; margin-bottom:.5rem;
}

/* Responsivo */
@media (max-width: 900px){
  .grid-form{ grid-template-columns: 1fr; }
  .filters{ grid-template-columns: 1fr 1fr; }
}
@media (max-width: 700px){
  thead{ display:none; }
  .table, tbody, tr, td{ display:block; width:100%; }
  tr{ border:1px solid #e5e7eb; border-radius:12px; margin-bottom:.6rem; padding:.25rem .4rem; }
  td{ border:none; display:flex; justify-content:space-between; gap:1rem; }
  td::before{
    content: attr(data-label);
    font-weight:600; color:#6b7280;
  }
  .num{ text-align:left; }
}
</style>
