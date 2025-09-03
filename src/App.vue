<script setup>
import { ref } from 'vue'
// Componentes principales
import Proveedores from './components/Proveedores.vue'
import Libros from './components/Libros.vue'
import Recepciones from './components/Recepciones.vue'

// Se usa un ref para recordar la pestaña activa sin recurrir a un sistema de ruteo completo
const tab = ref('recepciones')
</script>

<template>
  <div class="container">
    <h1>Recepción de Textos Escolares</h1>

    <div class="hstack">
      <!-- Botones que actúan como pestañas, simplificando la navegación -->
      <button :class="{active:tab==='recepciones'}" @click="tab='recepciones'">Recepciones</button>
      <button :class="{active:tab==='libros'}" @click="tab='libros'">Libros</button>
      <button :class="{active:tab==='proveedores'}" @click="tab='proveedores'">Proveedores</button>
    </div>

    <!-- Renderizado condicional para evitar cargar componentes innecesarios -->
    <Recepciones v-if="tab==='recepciones'" />
    <Libros v-if="tab==='libros'" />
    <Proveedores v-if="tab==='proveedores'" />
  </div>
</template>

<style scoped>
/* Estilos locales para evitar efectos en otros componentes */
.container{max-width:1024px;margin:24px auto;padding:16px;font-family:system-ui}
.hstack{display:flex;gap:8px;margin:12px 0}
button.active{outline:2px solid #2563eb}
</style>
