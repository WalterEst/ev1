<script setup>
import { ref, computed } from 'vue'
import { useRecepcionStore } from '../stores/useRecepcionStore.js'

const { state } = useRecepcionStore()

// ====== Formulario
const form = ref({ rut: '', nombre: '', contacto: '' })
const touched = ref({ rut:false, nombre:false })

// ----- Utilidades RUT (Chile)
function normalizarRut(val = ''){
  return String(val).replace(/[^0-9kK]/g, '').toUpperCase()
}
function formatearRut(val = ''){
  const limpio = normalizarRut(val)
  if(!limpio) return ''
  const cuerpo = limpio.slice(0, -1)
  const dv = limpio.slice(-1)
  // Separador de miles con puntos
  const cuerpoFmt = cuerpo.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  return `${cuerpoFmt}-${dv}`
}
function validarRut(rut){
  const limpio = normalizarRut(rut)
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
function onRutInput(e){
  // No formateamos en tiempo real para no mover el cursor; solo limpiamos caracteres
  const caret = e.target.selectionStart
  const antes = e.target.value
  const limpio = antes.replace(/[^0-9kK\.-]/g,'')
  if(antes !== limpio){
    e.target.value = limpio
    form.value.rut = limpio
    e.target.setSelectionRange(caret-1, caret-1)
  }
}
function onRutBlur(){
  if(form.value.rut){
    form.value.rut = formatearRut(form.value.rut)
  }
  touched.value.rut = true
}

// Validaciones y errores
const formErrors = computed(() => {
  const e = {}
  if(!form.value.rut?.trim()) e.rut = 'El RUT es requerido'
  else if(!validarRut(form.value.rut)) e.rut = 'RUT inválido'
  else if(duplicadoRut.value) e.rut = 'Este RUT ya existe'
  if(!form.value.nombre?.trim()) e.nombre = 'El nombre es requerido'
  return e
})
const isFormValid = computed(() => Object.keys(formErrors.value).length === 0)

// Duplicados por RUT (normalizado)
const duplicadoRut = computed(() => {
  const n = normalizarRut(form.value.rut)
  if(!n) return false
  return (state?.proveedores || []).some(p => normalizarRut(p.rut) === n)
})

function guardar(){
  if(!isFormValid.value) return
  state.proveedores.push({
    id: state._seq.proveedores++,
    rut: formatearRut(form.value.rut),
    nombre: form.value.nombre.trim(),
    contacto: form.value.contacto?.trim() || ''
  })
  form.value = { rut: '', nombre: '', contacto: '' }
  touched.value = { rut:false, nombre:false }
}

// ====== Filtros / Lista
const filtro = ref({ q:'' })
const lista = computed(() => {
  const q = filtro.value.q.trim().toLowerCase()
  return (state?.proveedores || [])
    .filter(p => {
      if(!q) return true
      return [p.nombre, p.rut, p.contacto].some(v => String(v||'').toLowerCase().includes(q))
    })
    .sort((a,b)=> a.nombre.localeCompare(b.nombre))
})
function limpiarFiltros(){ filtro.value.q = '' }
</script>

<template>
  <div class="wrapper">
    <header class="header">
      <h2>Proveedores</h2>
      <p class="sub">Registra y busca proveedores rápidamente.</p>
    </header>

    <!-- Card: Nuevo proveedor -->
    <section class="card">
      <h3 class="card-title">Nuevo proveedor</h3>
      <form class="grid-form" @submit.prevent="guardar" novalidate>
        <div class="field">
          <label for="f-rut">RUT <span class="req">*</span></label>
          <input id="f-rut"
                 v-model="form.rut"
                 @input="onRutInput"
                 @blur="onRutBlur"
                 :aria-invalid="!!(touched.rut && formErrors.rut)"
                 :aria-errormessage="touched.rut && formErrors.rut ? 'err-rut' : undefined"
                 placeholder="12.345.678-5" />
          <small v-if="touched.rut && formErrors.rut" id="err-rut" class="err">{{ formErrors.rut }}</small>
        </div>

        <div class="field">
          <label for="f-nombre">Nombre <span class="req">*</span></label>
          <input id="f-nombre"
                 v-model="form.nombre"
                 @blur="touched.nombre = true"
                 :aria-invalid="!!(touched.nombre && formErrors.nombre)"
                 :aria-errormessage="touched.nombre && formErrors.nombre ? 'err-nombre' : undefined"
                 placeholder="Ej: Editorial Andes" />
          <small v-if="touched.nombre && formErrors.nombre" id="err-nombre" class="err">{{ formErrors.nombre }}</small>
        </div>

        <div class="field">
          <label for="f-contacto">Contacto</label>
          <input id="f-contacto" v-model="form.contacto" placeholder="Correo o teléfono" />
          <small class="hint">Opcional</small>
        </div>

        <div class="actions">
          <button class="btn primary" type="submit" :disabled="!isFormValid">Agregar</button>
        </div>
      </form>
    </section>

    <!-- Card: Filtros -->
    <section class="card">
      <h3 class="card-title">Filtros</h3>
      <div class="filters">
        <div class="field">
          <label for="flt-q">Buscar</label>
          <input id="flt-q" v-model="filtro.q" placeholder="Nombre, RUT o contacto" />
        </div>
        <div class="actions">
          <button class="btn" type="button" @click="limpiarFiltros">Limpiar</button>
        </div>
      </div>
    </section>

    <!-- Card: Lista -->
    <section class="card">
      <div class="table-wrap" v-if="lista.length">
        <table class="table">
          <thead>
            <tr>
              <th>#</th>
              <th>Nombre</th>
              <th>RUT</th>
              <th>Contacto</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="p in lista" :key="p.id">
              <td data-label="#"> {{ p.id }} </td>
              <td data-label="Nombre"> {{ p.nombre }} </td>
              <td data-label="RUT"> {{ p.rut }} </td>
              <td data-label="Contacto"> {{ p.contacto || '—' }} </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-else class="empty">
        <p>🤝 No hay proveedores que coincidan con la búsqueda.</p>
        <button class="btn" @click="limpiarFiltros">Mostrar todo</button>
      </div>
    </section>
  </div>
</template>

<style scoped>
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

/* Filtros */
.filters{
  display:grid;
  grid-template-columns: 2fr 1fr;
  gap:.85rem;
  align-items:end;
}

/* Tabla */
.table-wrap{ overflow:auto; }
.table{ width:100%; border-collapse: collapse; }
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

/* Empty */
.empty{ display:flex; flex-direction: column; align-items: flex-start; gap:.5rem; color:#6b7280; }

/* Responsivo */
@media (max-width: 900px){
  .grid-form{ grid-template-columns: 1fr; }
  .filters{ grid-template-columns: 1fr; }
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
}
</style>
