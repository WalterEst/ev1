<script setup>
import { ref, computed, watch } from 'vue'
import { useRecepcionStore } from '../stores/useRecepcionStore.js'

const { state } = useRecepcionStore()

// ====== Formulario
const currentYear = new Date().getFullYear()
const form = ref({ isbn: '', titulo: '', editorial: '', nivel: 'Básica', anio: currentYear })
const touched = ref({ isbn:false, titulo:false, anio:false, nivel:false })

// Validación ISBN 10/13 (sin guiones/espacios)
function esISBN(val){
  if(!val) return false
  const limpio = String(val).replace(/[-\s]/g, '')
  return /^\d{10}$/.test(limpio) || /^\d{13}$/.test(limpio)
}

// Helpers de validación
const formErrors = computed(() => {
  const e = {}
  if(!form.value.titulo?.trim()) e.titulo = 'El título es requerido'
  if(!form.value.isbn?.trim()) e.isbn = 'El ISBN es requerido'
  else if(!esISBN(form.value.isbn)) e.isbn = 'Debe tener 10 o 13 dígitos (sin guiones)'
  if(!form.value.nivel) e.nivel = 'Seleccione nivel'
  const y = Number(form.value.anio)
  const minY = 1970, maxY = currentYear + 1
  if(!y) e.anio = 'El año es requerido'
  else if(y < minY || y > maxY) e.anio = `Año entre ${minY} y ${maxY}`
  return e
})
const isFormValid = computed(() => Object.keys(formErrors.value).length === 0)

function guardar(){
  if(!isFormValid.value) return
  state.libros.push({ id: state._seq.libros++, ...{
    isbn: form.value.isbn.trim(),
    titulo: form.value.titulo.trim(),
    editorial: form.value.editorial?.trim() || '',
    nivel: form.value.nivel,
    anio: Number(form.value.anio)
  }})
  form.value = { isbn: '', titulo: '', editorial: '', nivel: 'Básica', anio: currentYear }
  touched.value = { isbn:false, titulo:false, anio:false, nivel:false }
}

// ====== Filtros / Lista
const filtro = ref({ q:'', nivel:'', desde:'', hasta:'' }) // desde/hasta = año
const lista = computed(() => {
  const q = filtro.value.q.trim().toLowerCase()
  return (state?.libros || []).filter(l => {
    if(filtro.value.nivel && l.nivel !== filtro.value.nivel) return false
    if(filtro.value.desde && Number(l.anio) < Number(filtro.value.desde)) return false
    if(filtro.value.hasta && Number(l.anio) > Number(filtro.value.hasta)) return false
    if(q && ![l.titulo, l.editorial, l.isbn].some(v => String(v).toLowerCase().includes(q))) return false
    return true
  }).sort((a,b)=> b.anio - a.anio || a.titulo.localeCompare(b.titulo))
})

function limpiarFiltros(){ filtro.value = { q:'', nivel:'', desde:'', hasta:'' } }
watch([() => filtro.value.desde, () => filtro.value.hasta], ([d,h]) => {
  if(d && h && Number(d) > Number(h)) filtro.value.hasta = d
})

// Etiqueta nivel
function claseNivel(n){
  return n === 'Básica' ? 'badge info' : 'badge ok'
}
</script>

<template>
  <div class="wrapper">
    <header class="header">
      <h2>Libros</h2>
      <p class="sub">Gestiona el catálogo: agrega, filtra y encuentra rápido.</p>
    </header>

    <!-- Card: Nuevo libro -->
    <section class="card">
      <h3 class="card-title">Nuevo libro</h3>
      <form class="grid-form" @submit.prevent="guardar" novalidate>
        <div class="field">
          <label for="f-titulo">Título <span class="req">*</span></label>
          <input id="f-titulo" v-model="form.titulo"
                 @blur="touched.titulo = true"
                 :aria-invalid="!!(touched.titulo && formErrors.titulo)"
                 :aria-errormessage="touched.titulo && formErrors.titulo ? 'err-titulo' : undefined"
                 placeholder="Ej: Programación en JS" />
          <small v-if="touched.titulo && formErrors.titulo" id="err-titulo" class="err">{{ formErrors.titulo }}</small>
        </div>

        <div class="field">
          <label for="f-isbn">ISBN <span class="req">*</span></label>
          <input id="f-isbn" v-model="form.isbn"
                 @blur="touched.isbn = true"
                 :aria-invalid="!!(touched.isbn && formErrors.isbn)"
                 :aria-errormessage="touched.isbn && formErrors.isbn ? 'err-isbn' : undefined"
                 placeholder="10 o 13 dígitos, sin guiones" />
          <small v-if="touched.isbn && formErrors.isbn" id="err-isbn" class="err">{{ formErrors.isbn }}</small>
        </div>

        <div class="field">
          <label for="f-editorial">Editorial</label>
          <input id="f-editorial" v-model="form.editorial" placeholder="Ej: Alfaomega" />
          <small class="hint">Opcional</small>
        </div>

        <div class="field">
          <label for="f-nivel">Nivel <span class="req">*</span></label>
          <select id="f-nivel" v-model="form.nivel"
                  @blur="touched.nivel = true"
                  :aria-invalid="!!(touched.nivel && formErrors.nivel)"
                  :aria-errormessage="touched.nivel && formErrors.nivel ? 'err-nivel' : undefined">
            <option value="Básica">Básica</option>
            <option value="Media">Media</option>
          </select>
          <small v-if="touched.nivel && formErrors.nivel" id="err-nivel" class="err">{{ formErrors.nivel }}</small>
        </div>

        <div class="field">
          <label for="f-anio">Año <span class="req">*</span></label>
          <input id="f-anio" type="number" v-model.number="form.anio" :min="1970" :max="currentYear + 1"
                 @blur="touched.anio = true"
                 :aria-invalid="!!(touched.anio && formErrors.anio)"
                 :aria-errormessage="touched.anio && formErrors.anio ? 'err-anio' : undefined"
                 placeholder="Ej: 2025" />
          <small v-if="touched.anio && formErrors.anio" id="err-anio" class="err">{{ formErrors.anio }}</small>
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
          <input id="flt-q" v-model="filtro.q" placeholder="Título, editorial o ISBN" />
        </div>
        <div class="field">
          <label for="flt-nivel">Nivel</label>
          <select id="flt-nivel" v-model="filtro.nivel">
            <option value="">Todos</option>
            <option value="Básica">Básica</option>
            <option value="Media">Media</option>
          </select>
        </div>
        <div class="field">
          <label for="flt-desde">Desde (Año)</label>
          <input id="flt-desde" type="number" v-model.number="filtro.desde" min="1970" :max="filtro.hasta || currentYear + 1" placeholder="1970" />
        </div>
        <div class="field">
          <label for="flt-hasta">Hasta (Año)</label>
          <input id="flt-hasta" type="number" v-model.number="filtro.hasta" :min="filtro.desde || 1970" :max="currentYear + 1" placeholder="2025" />
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
              <th>Título</th>
              <th>ISBN</th>
              <th>Editorial</th>
              <th>Nivel</th>
              <th class="num">Año</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="l in lista" :key="l.id">
              <td data-label="#"> {{ l.id }} </td>
              <td data-label="Título"> {{ l.titulo }} </td>
              <td data-label="ISBN"> {{ l.isbn }} </td>
              <td data-label="Editorial"> {{ l.editorial || '—' }} </td>
              <td data-label="Nivel">
                <span :class="claseNivel(l.nivel)">{{ l.nivel }}</span>
              </td>
              <td data-label="Año" class="num"> {{ l.anio }} </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-else class="empty">
        <p>📚 No hay libros que coincidan con los filtros.</p>
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
  grid-template-columns: repeat(5, minmax(0,1fr));
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
.num{ text-align:right; }

/* Badges */
.badge{
  display:inline-block;
  padding:.15rem .45rem;
  border-radius: 999px;
  font-size:.8rem;
}
.badge.ok{ background:#ecfdf5; color:#065f46; }   /* Media */
.badge.info{ background:#eef2ff; color:#3730a3; } /* Básica */

/* Empty */
.empty{ display:flex; flex-direction: column; align-items: flex-start; gap:.5rem; color:#6b7280; }

/* Responsivo */
@media (max-width: 900px){
  .grid-form{ grid-template-columns: 1fr 1fr; }
  .filters{ grid-template-columns: 1fr 1fr; }
}
@media (max-width: 700px){
  .grid-form{ grid-template-columns: 1fr; }
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
