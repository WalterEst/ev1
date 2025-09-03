<script setup>
import { ref } from 'vue'
// Componentes principales
import Proveedores from './components/Proveedores.vue'
import Libros from './components/Libros.vue'
import Recepciones from './components/Recepciones.vue'

const tab = ref('recepciones')
</script>

<template>
  <div class="container">
    <h1>Recepción de Textos Escolares</h1>

    <div class="hstack">
      <!-- Se marca la pestaña activa correctamente -->
      <button :class="{active:tab==='recepciones'}" @click="tab='recepciones'">Recepciones</button>
      <button :class="{active:tab==='libros'}" @click="tab='libros'">Libros</button>
      <button :class="{active:tab==='proveedores'}" @click="tab='proveedores'">Proveedores</button>
    </div>

    <!-- Renderizado condicional de cada sección -->
    <Recepciones v-if="tab==='recepciones'" />
    <Libros v-if="tab==='libros'" />
    <Proveedores v-if="tab==='proveedores'" />
  </div>
</template>

<style scoped>
.container{max-width:1024px;margin:24px auto;padding:16px;font-family:system-ui}
.hstack{display:flex;gap:8px;margin:12px 0}
button.active{outline:2px solid #2563eb}
</style>
