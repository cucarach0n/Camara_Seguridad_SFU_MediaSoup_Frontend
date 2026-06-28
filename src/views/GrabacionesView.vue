<template>
  <div class="w-full max-w-[1400px] mx-auto animate-[fade-in_0.5s_ease-out] flex flex-col h-[85vh]">
    <!-- Cabecera -->
    <div class="flex items-center gap-3 mb-6 shrink-0">
      <div class="p-2 bg-gradient-to-br from-rose-500 to-orange-500 rounded-lg shadow-lg shadow-rose-500/20">
        <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
      </div>
      <div>
        <h2 class="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-400">Archivo DVR Multipista</h2>
        <p class="text-zinc-500 text-sm font-medium">Línea de tiempo sincronizada para todas las cámaras</p>
      </div>
    </div>

    <!-- Estados de Carga / Vacío -->
    <div v-if="loading" class="flex-1 flex justify-center items-center">
      <svg class="animate-spin h-10 w-10 text-rose-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
    </div>
    
    <div v-else-if="error" class="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl flex items-center gap-3 font-medium shrink-0">
      <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
      {{ error }}
    </div>
    
    <div v-else-if="Object.keys(groupedRecordings).length === 0" class="flex-1 flex flex-col items-center justify-center bg-zinc-900/40 backdrop-blur-md border border-white/5 rounded-3xl">
      <svg class="w-16 h-16 text-zinc-700 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
      <p class="text-zinc-500 font-medium text-lg">No hay grabaciones disponibles en el archivo.</p>
    </div>

    <!-- Interfaz Principal DVR Multipista -->
    <div v-else class="flex-1 flex flex-col lg:flex-row gap-6 min-h-0">
      
      <!-- Panel Izquierdo: Selección de Fecha -->
      <div class="lg:w-64 flex flex-col gap-4 shrink-0 h-full">
        <div class="bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-3xl p-5 flex flex-col h-full shadow-2xl overflow-hidden">
          <h3 class="text-white font-bold mb-4 flex items-center gap-2">
            <svg class="w-4 h-4 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
            Días con Actividad
          </h3>
          
          <div class="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-2">
            <button 
              v-for="(cams, dateStr) in groupedRecordings" 
              :key="dateStr"
              @click="selectDate(dateStr)"
              class="w-full text-left px-4 py-3 rounded-xl transition-all duration-300 border flex flex-col"
              :class="selectedDate === dateStr ? 'bg-teal-500/10 border-teal-500/30 text-teal-400' : 'bg-zinc-950/50 border-white/5 text-zinc-300 hover:bg-zinc-800/80'"
            >
              <span class="font-bold">{{ formatDate(dateStr) }}</span>
              <span class="text-[10px] uppercase font-bold tracking-wider opacity-70 mt-1 flex items-center gap-1">
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                {{ Object.keys(cams).length }} Fuentes
              </span>
            </button>
          </div>
        </div>
      </div>

      <!-- Panel Central: Reproductor y Multipista -->
      <div class="flex-1 flex flex-col min-w-0 bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-3xl p-1 sm:p-5 shadow-2xl relative h-full">
        
        <!-- Reproductor Superior -->
        <div class="flex-1 bg-black rounded-2xl overflow-hidden relative shadow-inner group flex items-center justify-center min-h-[250px]">
          <video 
            v-if="currentRecording && currentRecording.nombre_archivo" 
            ref="videoPlayer"
            :src="getVideoUrl(currentRecording)" 
            controls 
            autoplay 
            class="w-full h-full object-contain"
          ></video>
          <div v-else class="text-zinc-600 flex flex-col items-center gap-3 p-4 text-center">
            <svg class="w-16 h-16 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            <p class="font-medium text-sm">Selecciona un fragmento en cualquiera de las pistas de la línea de tiempo</p>
          </div>

          <!-- Metadatos Flotantes (Hover) -->
          <div v-if="currentRecording" class="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex justify-between items-start pointer-events-none">
            <div>
              <h4 class="text-white font-bold drop-shadow-md flex items-center gap-2">
                <span class="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                {{ currentRecording.transmision?.nombre || 'Transmisión Web' }}
              </h4>
              <p class="text-teal-400 text-xs font-mono drop-shadow-md">{{ new Date(currentRecording.creado_en).toLocaleString() }}</p>
            </div>
            <div class="flex gap-2 pointer-events-auto">
              <a v-if="currentRecording.subido_drive" :href="currentRecording.url_drive" target="_blank" class="w-8 h-8 flex items-center justify-center bg-blue-500/80 hover:bg-blue-500 text-white rounded-lg backdrop-blur-sm transition-colors shadow-lg" title="Ver en Google Drive">
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M22.016 16.518L15.342 5.011H8.694l6.674 11.507h6.648zm-16.143-6.52L2.52 16.516a2.002 2.002 0 00.17 2.016A2.004 2.004 0 004.385 19.5h13.31l-3.352-5.787H5.873zm3.795-1.272L13.018 3.53a2.008 2.008 0 00-1.742-1.03H4.632a2.004 2.004 0 00-1.745 1.026L10.51 16.52l-.842-7.794z"/></svg>
              </a>
              <a :href="getVideoUrl(currentRecording)" :download="currentRecording.nombre_archivo" class="w-8 h-8 flex items-center justify-center bg-zinc-800/80 hover:bg-zinc-700 text-white rounded-lg backdrop-blur-sm transition-colors shadow-lg" title="Descargar">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
              </a>
              <button @click="deleteGrabacion(currentRecording)" class="w-8 h-8 flex items-center justify-center bg-rose-500/80 hover:bg-rose-500 text-white rounded-lg backdrop-blur-sm transition-colors shadow-lg" title="Eliminar fragmento">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
              </button>
            </div>
          </div>
        </div>

        <!-- Información Inferior del video -->
        <div class="mt-4 mb-2 shrink-0 flex flex-col sm:flex-row sm:items-center justify-between px-2 gap-4">
          <div class="flex items-center gap-4">
            <span v-if="currentRecording" class="text-sm font-medium text-zinc-300">
              Tamaño: <span class="text-white font-mono">{{ formatBytes(currentRecording.tamanio_bytes) }}</span>
            </span>
            <span v-if="currentRecording && currentRecording.duracion_segundos" class="text-sm font-medium text-zinc-300">
              Duración: <span class="text-white font-mono">{{ formatTime(currentRecording.duracion_segundos) }}</span>
            </span>
            <span v-if="!currentRecording && selectedDate" class="text-sm text-zinc-500">
              Se seleccionó el día {{ formatDate(selectedDate) }}
            </span>
          </div>
          
          <div class="flex items-center gap-3">
            <svg class="w-4 h-4 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"></path></svg>
            <input 
              type="range" 
              min="1" 
              max="24" 
              step="1" 
              v-model="zoomLevel"
              class="w-24 sm:w-32 accent-teal-500 cursor-pointer"
              title="Ajustar zoom de la línea de tiempo"
            >
            <span class="text-xs text-zinc-500 font-mono font-bold w-8 text-right">{{ zoomLevel }}x</span>
          </div>
        </div>

        <!-- Timeline Multipista -->
        <div ref="timelineContainer" class="relative shrink-0 border border-white/5 bg-zinc-950 rounded-xl overflow-x-auto custom-scrollbar">
          <div class="flex flex-col relative pb-6 pt-2" :style="{ minWidth: `max(600px, ${zoomLevel * 100}%)` }">
            
            <!-- Marcas de Horas Globales (Background Grid) -->
            <div class="absolute inset-y-0 left-[120px] right-2 pointer-events-none z-0 flex justify-between">
              <div v-for="h in 25" :key="'grid-'+h" class="h-full w-[1px] relative" :class="h%4===1 ? 'bg-zinc-700/50' : 'bg-zinc-800/30'">
                <span v-if="h%4===1" class="absolute bottom-1 -translate-x-1/2 text-[10px] font-mono text-zinc-500">{{ (h-1).toString().padStart(2, '0') }}:00</span>
              </div>
            </div>

            <!-- Pistas (Tracks) por Cámara -->
            <div v-if="selectedDate && groupedRecordings[selectedDate]" class="relative z-10 flex flex-col gap-1 px-2">
              <div 
                v-for="(recordings, camName) in groupedRecordings[selectedDate]" 
                :key="'track-'+camName"
                class="flex h-12 items-center w-full"
              >
                <!-- Etiqueta de la Cámara -->
                <div class="w-[110px] shrink-0 truncate text-xs font-bold text-zinc-400 pr-2 border-r border-white/10" :title="camName">
                  {{ camName }}
                </div>
                
                <!-- Pista de 24 horas real -->
                <div class="flex-1 relative h-full mx-2 group">
                  <!-- Fondo de la pista -->
                  <div class="absolute inset-y-2 inset-x-0 bg-white/[0.02] rounded border border-white/5 transition-colors group-hover:bg-white/[0.04]"></div>
                  
                  <!-- Bloques de Grabación -->
                  <div 
                    v-for="g in recordings" 
                    :key="g.id"
                    @click="currentRecording = g"
                    class="absolute inset-y-3 rounded-sm cursor-pointer transition-all duration-200 border shadow-sm"
                    :class="currentRecording?.id === g.id ? 'bg-teal-500 border-teal-300 z-20 shadow-[0_0_12px_rgba(20,184,166,0.8)] scale-y-125' : 'bg-rose-500/80 border-rose-400/50 hover:bg-rose-400 z-10 hover:z-20 hover:scale-y-110'"
                    :style="{ left: getLeftPercent(g) + '%', width: getWidthPercent(g) + '%' }"
                    :title="`${new Date(g.creado_en).toLocaleTimeString()} (${formatTime(g.duracion_segundos || 900)})`"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  height: 8px;
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.2);
}
</style>

<script setup>
import { ref, onMounted, watch, nextTick } from 'vue'
import { http } from '../api/http'
import { useAuthStore } from '../stores/auth.store'

const authStore = useAuthStore()
const grabaciones = ref([])
const loading = ref(true)
const error = ref('')

const groupedRecordings = ref({}) // { 'YYYY-MM-DD': { 'CameraName': [Recordings] } }
const selectedDate = ref(null)
const currentRecording = ref(null)
const videoPlayer = ref(null)
const zoomLevel = ref(1)
const timelineContainer = ref(null)

watch(zoomLevel, (newZoom, oldZoom) => {
  if (!timelineContainer.value) return
  
  const el = timelineContainer.value
  let centerPercent;

  if (currentRecording.value) {
    // Si hay un video seleccionado, forzamos el centro en ese video
    const leftP = getLeftPercent(currentRecording.value)
    const widthP = getWidthPercent(currentRecording.value)
    centerPercent = (leftP + widthP / 2) / 100
  } else {
    // Si no, mantenemos el centro de lo que el usuario estaba mirando
    const scrollCenterPx = el.scrollLeft + el.clientWidth / 2
    centerPercent = scrollCenterPx / el.scrollWidth
  }
  
  // Al quitar la transición CSS, el ancho cambia inmediatamente en el siguiente tick del DOM
  nextTick(() => {
    el.scrollLeft = (centerPercent * el.scrollWidth) - (el.clientWidth / 2)
  })
})

watch(currentRecording, (newRec) => {
  if (!newRec || !timelineContainer.value) return
  
  const el = timelineContainer.value
  const leftP = getLeftPercent(newRec)
  const widthP = getWidthPercent(newRec)
  const centerPercent = (leftP + widthP / 2) / 100
  
  // Auto-scroll suave para centrar el video cuando se selecciona
  el.scrollTo({
    left: (centerPercent * el.scrollWidth) - (el.clientWidth / 2),
    behavior: 'smooth'
  })
})

onMounted(async () => {
  try {
    const res = await http.get('/grabaciones')
    grabaciones.value = res.data
    processRecordings()
  } catch (err) {
    error.value = 'No se pudieron cargar las grabaciones'
  } finally {
    loading.value = false
  }
})

// Agrupar por Fecha y luego por Cámara
const processRecordings = () => {
  const groups = {}
  
  // Ordenar primero todas las grabaciones descendentemente para que estén en orden por defecto
  const sortedGrabs = [...grabaciones.value].sort((a, b) => new Date(b.creado_en) - new Date(a.creado_en))
  
  sortedGrabs.forEach(g => {
    const dateStr = new Date(g.creado_en).toISOString().split('T')[0]
    const camName = g.transmision?.nombre || 'Transmisión Web'
    
    if (!groups[dateStr]) groups[dateStr] = {}
    if (!groups[dateStr][camName]) groups[dateStr][camName] = []
    
    groups[dateStr][camName].push(g)
  })
  
  groupedRecordings.value = groups

  // Auto-seleccionar la fecha más reciente
  const dates = Object.keys(groups).sort((a, b) => new Date(b) - new Date(a))
  if (dates.length > 0) {
    selectDate(dates[0])
  }
}

const selectDate = (dateStr) => {
  selectedDate.value = dateStr
  currentRecording.value = null
  
  // Auto-seleccionar el primer video de la primera cámara en ese día
  const cams = groupedRecordings.value[dateStr]
  if (cams) {
    const firstCam = Object.keys(cams)[0]
    if (firstCam && cams[firstCam].length > 0) {
      currentRecording.value = cams[firstCam][0]
    }
  }
}

// Timeline calculations (0% to 100% for a 24h day)
const getLeftPercent = (g) => {
  const date = new Date(g.creado_en)
  const totalSecondsInDay = 24 * 60 * 60
  const secondsFromMidnight = date.getHours() * 3600 + date.getMinutes() * 60 + date.getSeconds()
  return (secondsFromMidnight / totalSecondsInDay) * 100
}

const getWidthPercent = (g) => {
  // Si no tiene duración, asumimos 15 min (900 seg)
  const dur = g.duracion_segundos || 900 
  const totalSecondsInDay = 24 * 60 * 60
  // Mínimo 0.5% para que sea clickeable
  let percent = (dur / totalSecondsInDay) * 100
  return Math.max(percent, 0.5) 
}

const getVideoUrl = (g) => {
  if (!g || !g.id) return ''
  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000'
  return `${backendUrl}/api/grabaciones/stream/${g.id}?token=${authStore.token}`
}

const deleteGrabacion = async (g) => {
  if (!confirm('¿Estás seguro de que deseas eliminar esta grabación de forma permanente? Esto también la borrará de Google Drive.')) return
  
  try {
    await http.delete(`/grabaciones/${g.id}`)
    grabaciones.value = grabaciones.value.filter(rec => rec.id !== g.id)
    if (currentRecording.value?.id === g.id) currentRecording.value = null
    processRecordings() 
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

const formatTime = (seconds) => {
  if (seconds === null || seconds === undefined) return 'N/A'
  if (seconds === 0) return 'Desconocida'
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0) return `${h}h ${m}m ${s}s`
  if (m > 0) return `${m}m ${s}s`
  return `${s}s`
}

const formatDate = (dateStr) => {
  const [year, month, day] = dateStr.split('-')
  return `${day}/${month}/${year}`
}
</script>
