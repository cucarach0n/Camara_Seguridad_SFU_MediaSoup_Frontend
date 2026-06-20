<template>
  <div class="bg-zinc-800 p-6 rounded-2xl shadow-xl w-full">
    <h2 class="text-2xl font-bold mb-6 text-purple-400">Galería de Grabaciones</h2>

    <div v-if="loading" class="text-zinc-400 animate-pulse">Cargando grabaciones...</div>
    <div v-else-if="error" class="text-red-400 bg-red-900/30 p-4 rounded-lg border border-red-500/50">{{ error }}</div>
    <div v-else-if="dates.length === 0" class="text-zinc-400 italic">No hay grabaciones disponibles todavía.</div>
    
    <div v-else>
      <div v-for="dateGroup in dates" :key="dateGroup.date" class="mb-10">
        <h3 class="text-xl font-bold mb-4 text-zinc-300 border-b border-zinc-700 pb-2 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-teal-400" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd" />
          </svg>
          {{ dateGroup.date }}
        </h3>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div 
            v-for="file in dateGroup.files" 
            :key="file.name"
            class="bg-zinc-900 rounded-xl overflow-hidden shadow-md hover:shadow-purple-500/20 transition-all border border-zinc-700 hover:border-purple-500/50 group"
          >
            <div class="p-4">
              <div class="flex justify-between items-start mb-3">
                <p class="text-sm font-mono text-zinc-400 truncate pr-2" :title="file.name">{{ file.name }}</p>
                <span class="text-[10px] uppercase font-bold px-2 py-1 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                  {{ file.name.endsWith('.webm') ? 'WebM (Modo A)' : 'MP4 (Modo B)' }}
                </span>
              </div>
              
              <video 
                controls 
                class="w-full rounded-lg bg-black aspect-video object-contain"
                preload="none"
              >
                <source :src="backendUrl + file.url" :type="file.name.endsWith('.webm') ? 'video/webm' : 'video/mp4'">
                Tu navegador no soporta el formato de video.
              </video>
              
              <div class="mt-4 flex justify-end opacity-50 group-hover:opacity-100 transition-opacity">
                <a 
                  :href="backendUrl + file.url" 
                  download
                  target="_blank"
                  class="text-xs bg-zinc-800 hover:bg-teal-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Descargar
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const dates = ref([])
const loading = ref(true)
const error = ref(null)
const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000'

onMounted(async () => {
  try {
    const response = await fetch(`${backendUrl}/api/videos`)
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
    dates.value = await response.json()
  } catch (err) {
    console.error(err)
    error.value = 'No se pudieron cargar las grabaciones. Asegúrate de que el backend esté encendido.'
  } finally {
    loading.value = false
  }
})
</script>
