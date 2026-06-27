<template>
  <div class="w-full max-w-[1600px] flex flex-col gap-6 animate-[fade-in_0.5s_ease-out]">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-zinc-900/50 backdrop-blur-xl border border-white/5 p-6 rounded-2xl shadow-lg">
      <div>
        <h2 class="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-400">
          Centro de Operaciones
        </h2>
        <p class="text-sm text-teal-400 font-bold mt-1 tracking-wider uppercase">MODO: {{ auth.user?.rol }}</p>
      </div>
      <button 
        @click="showModal = true" 
        class="group relative overflow-hidden px-6 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl shadow-lg border border-zinc-600 hover:border-teal-400 transition-all duration-300 font-semibold flex items-center gap-2 transform active:scale-95"
      >
        <div class="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-teal-500/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
        <svg class="w-5 h-5 text-teal-400 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
        Registrar Cámara IP
      </button>
    </div>

    <!-- Pestañas de modo -->
    <div class="flex gap-2 p-1.5 bg-zinc-900/50 backdrop-blur-lg border border-white/5 rounded-xl w-fit">
      <button 
        @click="activeTab = 'viewer'" 
        class="relative px-6 py-2 rounded-lg text-sm font-bold transition-all duration-300 flex items-center gap-2"
        :class="activeTab === 'viewer' ? 'text-zinc-950 bg-teal-400 shadow-md shadow-teal-400/20' : 'text-zinc-400 hover:text-white hover:bg-white/5'"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
        Monitoreo (NVR)
      </button>
      <button 
        @click="activeTab = 'streamer'" 
        class="relative px-6 py-2 rounded-lg text-sm font-bold transition-all duration-300 flex items-center gap-2"
        :class="activeTab === 'streamer' ? 'text-zinc-950 bg-teal-400 shadow-md shadow-teal-400/20' : 'text-zinc-400 hover:text-white hover:bg-white/5'"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 14v6m-3-3h6M6 10h2a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v2a2 2 0 002 2zm10 0h2a2 2 0 002-2V6a2 2 0 00-2-2h-2a2 2 0 00-2 2v2a2 2 0 002 2zM6 20h2a2 2 0 002-2v-2a2 2 0 00-2-2H6a2 2 0 00-2 2v2a2 2 0 002 2z"></path></svg>
        Transmitir Webcam
      </button>
    </div>

    <!-- Contenido dinámico -->
    <div class="relative bg-zinc-900/40 backdrop-blur-md border border-white/5 rounded-3xl p-1 sm:p-6 min-h-[600px] shadow-2xl">
      <transition name="fade" mode="out-in">
        <Viewer v-if="activeTab === 'viewer'" />
        
        <div v-else-if="activeTab === 'streamer'" class="flex flex-col gap-6">
          <div class="flex justify-between items-center bg-zinc-900/50 p-4 rounded-2xl border border-white/5 shadow-inner">
            <div>
              <h3 class="text-white font-bold text-lg">Mis Transmisiones Locales</h3>
              <p class="text-zinc-400 text-xs mt-1">Transmite múltiples cámaras web simultáneamente</p>
            </div>
            <button @click="addStreamer" class="px-4 py-2 bg-teal-500 text-zinc-950 font-bold rounded-xl hover:bg-teal-400 transition-colors shadow-lg shadow-teal-500/20 active:scale-95 flex items-center gap-2 text-sm">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
              Añadir Cámara
            </button>
          </div>
          
          <div v-if="activeStreamers.length === 0" class="flex flex-col items-center justify-center py-20 text-zinc-500 text-sm border-2 border-dashed border-white/10 rounded-2xl bg-zinc-950/30">
            <svg class="w-12 h-12 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
            No hay cámaras web configuradas. Haz clic en "Añadir Cámara".
          </div>
          
          <div v-else class="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <Streamer v-for="id in activeStreamers" :key="id" @remove="removeStreamer(id)" />
          </div>
        </div>
      </transition>
    </div>

    <RegistrarCamaraModal v-if="showModal" @close="showModal = false" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '../stores/auth.store'
import Viewer from '../components/Viewer.vue'
import Streamer from '../components/Streamer.vue'
import RegistrarCamaraModal from '../components/RegistrarCamaraModal.vue'

const auth = useAuthStore()
const activeTab = ref('viewer')
const showModal = ref(false)

const activeStreamers = ref([Date.now()])

const addStreamer = () => {
  activeStreamers.value.push(Date.now())
}

const removeStreamer = (id) => {
  activeStreamers.value = activeStreamers.value.filter(sId => sId !== id)
}
</script>
