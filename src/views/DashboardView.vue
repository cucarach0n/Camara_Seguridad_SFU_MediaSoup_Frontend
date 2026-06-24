<template>
  <div class="w-full max-w-6xl flex flex-col gap-8">
    <div class="flex justify-between items-center">
      <h2 class="text-2xl font-bold">Panel de Control ({{ auth.user?.rol }})</h2>
      <button @click="showModal = true" class="px-4 py-2 bg-blue-500 hover:bg-blue-400 text-white rounded-lg shadow-md transition font-medium">
        + Registrar Cámara
      </button>
    </div>

    <!-- Pestañas de modo -->
    <div class="flex gap-4 border-b border-zinc-700 pb-2">
      <button 
        @click="activeTab = 'viewer'" 
        :class="activeTab === 'viewer' ? 'text-teal-400 border-b-2 border-teal-400' : 'text-zinc-400 hover:text-white'"
        class="pb-2 px-2 transition font-medium"
      >
        Ver Cámaras
      </button>
      <button 
        @click="activeTab = 'streamer'" 
        :class="activeTab === 'streamer' ? 'text-teal-400 border-b-2 border-teal-400' : 'text-zinc-400 hover:text-white'"
        class="pb-2 px-2 transition font-medium"
      >
        Transmitir Webcam
      </button>
    </div>

    <!-- Contenido -->
    <div class="bg-zinc-800/30 border border-zinc-700 rounded-2xl p-6 min-h-[500px]">
      <Viewer v-if="activeTab === 'viewer'" />
      <Streamer v-if="activeTab === 'streamer'" />
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
</script>
