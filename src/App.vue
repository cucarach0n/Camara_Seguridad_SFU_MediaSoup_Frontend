<template>
  <div class="min-h-screen bg-zinc-900 text-white flex flex-col items-center p-8 font-sans">
    <h1 class="text-4xl font-extrabold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-500">
      Camara MCU - Mediasoup
    </h1>

    <div v-if="!role" class="flex gap-6 mt-10">
      <button 
        @click="role = 'streamer'" 
        class="px-8 py-4 bg-teal-500 hover:bg-teal-400 text-zinc-900 font-bold rounded-xl shadow-lg shadow-teal-500/30 transition-all transform hover:scale-105"
      >
        Entrar como Streamer (Cámara)
      </button>
      <button 
        @click="role = 'viewer'" 
        class="px-8 py-4 bg-blue-500 hover:bg-blue-400 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 transition-all transform hover:scale-105"
      >
        Entrar como Viewer (Espectador)
      </button>
    </div>

    <div v-else class="w-full max-w-4xl">
      <button @click="role = null" class="mb-4 text-sm text-zinc-400 hover:text-white transition">&larr; Volver</button>
      
      <Streamer v-if="role === 'streamer'" />
      <Viewer v-if="role === 'viewer'" />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import Streamer from './components/Streamer.vue'
import Viewer from './components/Viewer.vue'

const role = ref(null)
</script>

<style>
@import 'tailwindcss';
</style>
