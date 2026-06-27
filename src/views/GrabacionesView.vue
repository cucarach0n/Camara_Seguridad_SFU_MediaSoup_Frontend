<template>
  <div class="w-full max-w-7xl animate-[fade-in_0.5s_ease-out]">
    <div class="flex items-center gap-3 mb-8">
      <div class="p-2 bg-gradient-to-br from-rose-500 to-orange-500 rounded-lg shadow-lg shadow-rose-500/20">
        <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
      </div>
      <h2 class="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-400">Archivo de Grabaciones (DVR)</h2>
    </div>

    <div v-if="loading" class="flex justify-center items-center py-20">
      <svg class="animate-spin h-8 w-8 text-rose-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
    </div>
    <div v-else-if="error" class="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl flex items-center gap-3 font-medium">
      <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
      {{ error }}
    </div>
    <div v-else-if="grabaciones.length === 0" class="flex flex-col items-center justify-center py-20 bg-zinc-900/40 backdrop-blur-md border border-white/5 rounded-3xl">
      <svg class="w-16 h-16 text-zinc-700 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
      <p class="text-zinc-500 font-medium text-lg">No hay grabaciones disponibles en el archivo.</p>
    </div>
    
    <div v-else class="bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-3xl shadow-2xl overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm whitespace-nowrap">
          <thead class="bg-zinc-950/80 text-zinc-400 border-b border-white/5">
            <tr>
              <th class="p-5 font-bold tracking-wider uppercase text-xs">Archivo & Control</th>
              <th class="p-5 font-bold tracking-wider uppercase text-xs">Cámara Origen</th>
              <th class="p-5 font-bold tracking-wider uppercase text-xs">Propietario</th>
              <th class="p-5 font-bold tracking-wider uppercase text-xs">Fecha / Hora</th>
              <th class="p-5 font-bold tracking-wider uppercase text-xs">Tamaño</th>
              <th class="p-5 font-bold tracking-wider uppercase text-xs text-right">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-white/5">
            <tr v-for="g in grabaciones" :key="g.id" class="hover:bg-zinc-800/50 transition-colors group">
              <td class="p-5">
                <div v-if="g.nombre_archivo" class="flex items-center gap-3">
                  <button @click="playVideo(g)" class="flex items-center justify-center w-8 h-8 bg-rose-500/10 text-rose-400 rounded-full hover:bg-rose-500 hover:text-white hover:shadow-lg hover:shadow-rose-500/30 transition-all transform hover:scale-110 active:scale-95" title="Reproducir video">
                    <svg class="w-4 h-4 ml-0.5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd"></path></svg>
                  </button>
                  <a :href="getVideoUrl(g)" :download="g.nombre_archivo" class="flex items-center justify-center w-8 h-8 bg-zinc-800 text-zinc-400 rounded-full hover:bg-zinc-700 hover:text-white transition-all transform hover:scale-110 active:scale-95" title="Descargar original">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                  </a>
                  <span class="font-mono text-xs text-rose-200/70 group-hover:text-rose-200 transition-colors">{{ g.nombre_archivo }}</span>
                </div>
                <div v-else class="flex items-center gap-2">
                  <span class="relative flex h-2.5 w-2.5">
                    <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                    <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
                  </span>
                  <span class="text-xs font-bold text-rose-400 tracking-wider">PROCESANDO...</span>
                </div>
              </td>
              <td class="p-5 font-semibold text-zinc-200">
                <div class="flex items-center gap-2">
                  <svg class="w-4 h-4 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                  {{ g.transmision?.nombre || 'Webcam N/A' }}
                </div>
              </td>
              <td class="p-5 text-zinc-400">{{ g.usuario?.username }}</td>
              <td class="p-5 text-zinc-300 font-medium">
                {{ new Date(g.creado_en).toLocaleDateString() }} 
                <span class="text-zinc-500 text-xs ml-1">{{ new Date(g.creado_en).toLocaleTimeString() }}</span>
              </td>
              <td class="p-5 text-zinc-400 font-mono text-xs">{{ formatBytes(g.tamanio_bytes) }}</td>
              <td class="p-5 text-right">
                <div class="flex items-center justify-end gap-3 opacity-70 group-hover:opacity-100 transition-opacity">
                  <a v-if="g.subido_drive" :href="g.url_drive" target="_blank" class="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white rounded-lg text-xs font-bold transition-all border border-blue-500/20 hover:border-transparent shadow-sm">
                    <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M22.016 16.518L15.342 5.011H8.694l6.674 11.507h6.648zm-16.143-6.52L2.52 16.516a2.002 2.002 0 00.17 2.016A2.004 2.004 0 004.385 19.5h13.31l-3.352-5.787H5.873zm3.795-1.272L13.018 3.53a2.008 2.008 0 00-1.742-1.03H4.632a2.004 2.004 0 00-1.745 1.026L10.51 16.52l-.842-7.794z"/></svg>
                    Google Drive
                  </a>
                  <span v-else class="px-3 py-1.5 bg-zinc-800 text-zinc-500 rounded-lg text-xs font-bold border border-zinc-700">Solo Local</span>
                  <button @click="deleteGrabacion(g.id)" class="px-3 py-1.5 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-lg text-xs font-bold transition-all border border-red-500/20 hover:border-transparent shadow-sm flex items-center gap-1.5">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    Eliminar
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal de Reproductor de Video -->
    <transition name="fade">
      <div v-if="selectedVideoUrl" class="fixed inset-0 bg-zinc-950/90 backdrop-blur-xl flex items-center justify-center z-[100] p-4 sm:p-8">
        <div class="bg-zinc-900/80 border border-white/10 rounded-2xl overflow-hidden w-full max-w-5xl shadow-[0_0_50px_rgba(0,0,0,0.5)] relative flex flex-col max-h-full transform transition-all duration-300">
          <div class="p-4 bg-zinc-950/80 backdrop-blur-md flex justify-between items-center border-b border-white/5">
            <h3 class="font-bold text-zinc-200 flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
              Reproduciendo Archivo de Respaldo
            </h3>
            <button @click="selectedVideoUrl = null" class="text-zinc-400 hover:text-white bg-zinc-800 hover:bg-zinc-700 rounded-full w-8 h-8 flex items-center justify-center transition-all">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>
          <div class="relative bg-black flex-grow flex items-center justify-center">
            <video :src="selectedVideoUrl" controls autoplay class="w-full h-auto max-h-[80vh] shadow-inner"></video>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { http } from '../api/http'

const grabaciones = ref([])
const loading = ref(true)
const error = ref('')
const selectedVideoUrl = ref(null)

const getVideoUrl = (g) => {
  if (!g.nombre_archivo) return ''
  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000'
  return `${backendUrl}/recordings/${g.ruta_archivo}/${g.nombre_archivo}`
}

const playVideo = (g) => {
  if (!g.nombre_archivo) return
  selectedVideoUrl.value = getVideoUrl(g)
}

onMounted(async () => {
  try {
    const res = await http.get('/grabaciones')
    grabaciones.value = res.data
  } catch (err) {
    error.value = 'No se pudieron cargar las grabaciones'
  } finally {
    loading.value = false
  }
})

const deleteGrabacion = async (id) => {
  if (!confirm('¿Estás seguro de que deseas eliminar esta grabación de forma permanente? Esto también la borrará de Google Drive.')) return
  
  try {
    await http.delete(`/grabaciones/${id}`)
    grabaciones.value = grabaciones.value.filter(g => g.id !== id)
  } catch (err) {
    console.error('Error eliminando grabación:', err)
    alert('Hubo un error al eliminar la grabación')
  }
}

const formatBytes = (bytes) => {
  if (!bytes) return 'N/A'
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}
</script>
