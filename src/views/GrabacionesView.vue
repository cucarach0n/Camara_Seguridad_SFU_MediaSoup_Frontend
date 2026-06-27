<template>
  <div class="w-full max-w-6xl">
    <h2 class="text-2xl font-bold mb-6">Panel de Grabaciones</h2>

    <div v-if="loading" class="text-zinc-400">Cargando grabaciones...</div>
    <div v-else-if="error" class="text-red-400">{{ error }}</div>
    <div v-else-if="grabaciones.length === 0" class="text-zinc-400">No hay grabaciones disponibles.</div>
    
    <div v-else class="overflow-x-auto bg-zinc-800/30 border border-zinc-700 rounded-xl">
      <table class="w-full text-left text-sm">
        <thead class="bg-zinc-800/80 text-zinc-300">
          <tr>
            <th class="p-4 rounded-tl-xl">Archivo</th>
            <th class="p-4">Cámara</th>
            <th class="p-4">Usuario</th>
            <th class="p-4">Fecha</th>
            <th class="p-4">Tamaño</th>
            <th class="p-4 rounded-tr-xl">Acciones</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-zinc-700/50">
          <tr v-for="g in grabaciones" :key="g.id" class="hover:bg-zinc-700/20 transition">
            <td class="p-4 font-mono text-xs text-teal-300">
              <div v-if="g.nombre_archivo" class="flex flex-wrap items-center gap-2">
                <button @click="playVideo(g)" class="flex items-center gap-1 hover:text-white transition">
                  <span class="bg-teal-500/20 px-2 py-1 rounded text-teal-400 font-bold border border-teal-500/30">▶ Play</span>
                </button>
                <a :href="getVideoUrl(g)" :download="g.nombre_archivo" class="flex items-center gap-1 hover:text-white transition">
                  <span class="bg-indigo-500/20 px-2 py-1 rounded text-indigo-400 font-bold border border-indigo-500/30">⬇️ Descargar</span>
                </a>
                <span>{{ g.nombre_archivo }}</span>
              </div>
              <span v-else>{{ g.nombre_archivo || 'Grabando...' }}</span>
            </td>
            <td class="p-4">{{ g.transmision?.nombre || 'Webcam N/A' }}</td>
            <td class="p-4">{{ g.usuario?.username }}</td>
            <td class="p-4">{{ new Date(g.creado_en).toLocaleString() }}</td>
            <td class="p-4">{{ formatBytes(g.tamanio_bytes) }}</td>
            <td class="p-4">
              <div class="flex items-center gap-3">
                <a v-if="g.subido_drive" :href="g.url_drive" target="_blank" class="text-blue-400 hover:underline text-xs">Drive</a>
                <span v-else class="text-zinc-500 text-xs">Local</span>
                <button @click="deleteGrabacion(g.id)" class="text-red-400 hover:text-red-300 font-bold text-xs bg-red-500/10 hover:bg-red-500/20 px-2 py-1 rounded border border-red-500/20 transition">
                  🗑️ Eliminar
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal de Reproductor de Video -->
    <div v-if="selectedVideoUrl" class="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div class="bg-zinc-900 border border-zinc-700 rounded-xl overflow-hidden w-full max-w-4xl shadow-2xl relative">
        <div class="p-4 bg-zinc-800 flex justify-between items-center">
          <h3 class="font-bold text-zinc-200">Reproduciendo Grabación</h3>
          <button @click="selectedVideoUrl = null" class="text-zinc-400 hover:text-white font-bold px-2 py-1 bg-zinc-700 rounded">Cerrar</button>
        </div>
        <div class="aspect-video bg-black relative">
          <video :src="selectedVideoUrl" controls autoplay class="w-full h-full"></video>
        </div>
      </div>
    </div>
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
