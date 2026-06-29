<template>
  <div class="bg-zinc-900/40 backdrop-blur-xl border border-white/5 p-2 sm:p-6 rounded-3xl shadow-2xl animate-[fade-in_0.5s_ease-out]">
    <div class="flex items-center justify-between mb-6 px-2">
      <div class="flex items-center gap-3">
        <div class="w-3 h-3 rounded-full bg-teal-500 shadow-[0_0_10px_rgba(20,184,166,0.8)] animate-pulse"></div>
        <h2 class="text-2xl font-black text-white">Transmisión Local</h2>
      </div>
      <button @click="$emit('remove')" class="text-zinc-500 hover:text-rose-500 transition-colors" title="Cerrar Panel">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
      </button>
    </div>

    <div class="mb-5 px-2">
      <label class="block text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2 mb-2">
        <svg class="w-4 h-4 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        Nombre en la Línea de Tiempo
      </label>
      <input 
        type="text" 
        v-model="streamName" 
        :disabled="isStreaming"
        placeholder="Ej. Cámara Recepción" 
        class="w-full bg-zinc-950/50 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-200 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 disabled:opacity-50 transition-all duration-300"
      >
    </div>
    
    <div class="aspect-video bg-black rounded-2xl overflow-hidden mb-6 relative shadow-inner border border-white/10 group">
      <video ref="videoEl" autoplay muted playsinline class="w-full h-full object-cover"></video>
      <div v-if="recordingMode" class="absolute top-4 right-4 px-3 py-1 bg-rose-500/80 backdrop-blur-md rounded-full text-xs font-bold shadow-lg shadow-rose-500/20 text-white flex items-center gap-2">
        <span class="w-2 h-2 rounded-full bg-white animate-pulse"></span>
        REC ({{ recordingMode }})
      </div>
      <div class="absolute inset-0 ring-inset ring-1 ring-white/10 pointer-events-none rounded-2xl group-hover:ring-teal-500/30 transition-colors duration-500"></div>
    </div>

    <!-- Controles de Selección de Dispositivos (Estilo Moderno/Glassmorphism) -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6 px-2">
      <div class="flex flex-col gap-2 relative">
        <label for="videoSource" class="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
          <svg class="w-4 h-4 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
          Cámara Origen
        </label>
        <div class="relative">
          <select 
            id="videoSource" 
            v-model="selectedVideoId" 
            @change="updateStream" 
            :disabled="isStreaming"
            class="w-full appearance-none bg-zinc-950/50 border border-zinc-800 rounded-xl pl-4 pr-10 py-3 text-sm text-zinc-200 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 disabled:opacity-50 transition-all duration-300"
          >
            <option v-for="device in videoDevices" :key="device.deviceId" :value="device.deviceId">
              {{ device.label || `Cámara ${device.deviceId.slice(0, 5)}` }}
            </option>
            <option v-if="videoDevices.length === 0" value="">No se encontraron cámaras</option>
          </select>
          <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-zinc-500">
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
          </div>
        </div>
      </div>

      <div class="flex flex-col gap-2 relative">
        <label for="audioSource" class="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
          <svg class="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path></svg>
          Micrófono
        </label>
        <div class="relative">
          <select 
            id="audioSource" 
            v-model="selectedAudioId" 
            @change="updateStream" 
            :disabled="isStreaming"
            class="w-full appearance-none bg-zinc-950/50 border border-zinc-800 rounded-xl pl-4 pr-10 py-3 text-sm text-zinc-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:opacity-50 transition-all duration-300"
          >
            <option v-for="device in audioDevices" :key="device.deviceId" :value="device.deviceId">
              {{ device.label || `Micrófono ${device.deviceId.slice(0, 5)}` }}
            </option>
            <option v-if="audioDevices.length === 0" value="">No se encontraron micrófonos</option>
          </select>
          <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-zinc-500">
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
          </div>
        </div>
      </div>
    </div>

    <!-- Control de Linterna (Solo visible si es soportada) -->
    <div v-if="isTorchSupported" class="mb-6 px-2">
      <button 
        @click="toggleTorch"
        :class="isTorchOn ? 'bg-yellow-500 text-zinc-900 shadow-lg shadow-yellow-500/20' : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'"
        class="w-full py-3 font-bold rounded-xl transition-all duration-300 flex justify-center items-center gap-2 border border-white/5 active:scale-95"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" :opacity="isTorchOn ? '1' : '0.5'"></path>
        </svg>
        {{ isTorchOn ? 'Apagar Linterna' : 'Encender Linterna' }}
      </button>
    </div>
    
    <div class="mb-8 px-3 flex items-center gap-3">
      <div class="relative flex items-center">
        <input type="checkbox" id="recordServer" v-model="recordOnServer" class="peer sr-only">
        <div class="w-11 h-6 bg-zinc-700 rounded-full peer peer-focus:ring-2 peer-focus:ring-teal-500 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-500 cursor-pointer" @click="recordOnServer = !recordOnServer"></div>
      </div>
      <label for="recordServer" class="text-sm font-semibold text-zinc-300 cursor-pointer select-none">Grabar evento en el servidor (DVR)</label>
    </div>

    <!-- Botón Principal -->
    <div class="px-2">
      <button 
        v-if="!isStreaming && !isReconnecting"
        @click="startStreaming" 
        class="w-full relative group overflow-hidden bg-teal-500 text-zinc-950 font-black tracking-wider py-4 rounded-xl shadow-[0_0_20px_rgba(20,184,166,0.3)] hover:shadow-[0_0_30px_rgba(20,184,166,0.5)] transition-all duration-300 transform active:scale-95 flex justify-center items-center gap-2"
      >
        <div class="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
        <span class="relative flex items-center gap-2">
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd"></path></svg>
          INICIAR TRANSMISIÓN
        </span>
      </button>
      <button 
        v-else-if="isReconnecting"
        disabled
        class="w-full py-4 bg-yellow-500/20 text-yellow-500 border border-yellow-500/30 font-bold rounded-xl transition-all duration-300 cursor-not-allowed flex justify-center items-center gap-2"
      >
        <svg class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Reconectando...
      </button>
      <button 
        v-else
        @click="stopStreaming" 
        class="w-full py-4 bg-rose-500 hover:bg-rose-600 text-white font-black tracking-wider rounded-xl transition-all duration-300 transform active:scale-95 shadow-[0_0_20px_rgba(244,63,94,0.3)] hover:shadow-[0_0_30px_rgba(244,63,94,0.5)] flex justify-center items-center gap-2"
      >
        <svg class="w-5 h-5 animate-pulse" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clip-rule="evenodd"></path></svg>
        DETENER TRANSMISIÓN
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { io } from 'socket.io-client'
import * as mediasoupClient from 'mediasoup-client'
import { useAuthStore } from '../stores/auth.store'
import { http } from '../api/http'

const emit = defineEmits(['remove'])

const streamName = ref('Cámara Web Local')
const transmisionId = ref(null)

const videoEl = ref(null)
const isStreaming = ref(false)
const isReconnecting = ref(false)
let wasStreaming = false
let reconnectTransmisionId = null;

const recordingMode = ref('')
const recordOnServer = ref(false)
let socket = null
let device = null
let sendTransport = null
let mediaRecorder = null

// Variables reactivas para el manejo de dispositivos y el stream
const devices = ref([])
const selectedVideoId = ref('')
const selectedAudioId = ref('')
const localStream = ref(null)

const videoDevices = computed(() => devices.value.filter(d => d.kind === 'videoinput'))
const audioDevices = computed(() => devices.value.filter(d => d.kind === 'audioinput'))

const isTorchSupported = ref(false)
const isTorchOn = ref(false)

async function checkTorchSupport(stream) {
  const track = stream.getVideoTracks()[0];
  if (track) {
    try {
      const capabilities = track.getCapabilities ? track.getCapabilities() : {};
      isTorchSupported.value = !!capabilities.torch;
      isTorchOn.value = false;
    } catch (e) {
      isTorchSupported.value = false;
    }
  } else {
    isTorchSupported.value = false;
  }
}

async function toggleTorch() {
  if (!localStream.value) return;
  const track = localStream.value.getVideoTracks()[0];
  if (track && isTorchSupported.value) {
    try {
      const newState = !isTorchOn.value;
      await track.applyConstraints({
        advanced: [{ torch: newState }]
      });
      isTorchOn.value = newState;
    } catch (e) {
      console.error('Error al encender/apagar la linterna:', e);
    }
  }
}

onMounted(async () => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000'
  const auth = useAuthStore()
  socket = io(backendUrl, {
    auth: { token: auth.token }
  })

  socket.on('connect', async () => {
    console.log('Conectado al servidor de Mediasoup')
    if (wasStreaming) {
      console.warn('Recuperando conexión de transmisión de forma automática...');
      isReconnecting.value = true;
      wasStreaming = false;
      setTimeout(async () => {
        await startStreaming();
        isReconnecting.value = false;
      }, 1000);
    }
  })

  socket.on('disconnect', () => {
    console.warn('Conexión perdida. Esperando reconexión...')
    if (isStreaming.value) {
      wasStreaming = true;
      reconnectTransmisionId = transmisionId.value; // Guardar ID para resumir
      isStreaming.value = false;
      isReconnecting.value = true;
      
      // Limpiar transporte actual
      if (sendTransport) {
        sendTransport.close();
        sendTransport = null;
      }
      if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
      }
    }
  })

  socket.on('config-mode', (mode) => {
    recordingMode.value = mode
  })

  // Solicitar permisos y configurar vista previa al cargar el componente
  await initPreview()
})

onUnmounted(() => {
  if (socket) socket.disconnect()
  if (mediaRecorder && mediaRecorder.state !== 'inactive') mediaRecorder.stop()
  if (localStream.value) {
    localStream.value.getTracks().forEach(track => track.stop())
  }
  navigator.mediaDevices.ondevicechange = null
})

async function initPreview() {
  try {
    // Pedir permisos inicialmente para poder listar los dispositivos con sus nombres/etiquetas
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
    localStream.value = stream
    if (videoEl.value) {
      videoEl.value.srcObject = stream
    }

    // Listar todos los dispositivos de audio y video
    await loadDevices()
    
    await checkTorchSupport(stream)

    // Auto-seleccionar los ID de dispositivo de los tracks activos iniciales
    const videoTrack = stream.getVideoTracks()[0]
    const audioTrack = stream.getAudioTracks()[0]

    if (videoTrack) {
      selectedVideoId.value = videoTrack.getSettings().deviceId || ''
    }
    if (audioTrack) {
      selectedAudioId.value = audioTrack.getSettings().deviceId || ''
    }

    // Escuchar si se conectan/desconectan cámaras o micrófonos físicos
    navigator.mediaDevices.ondevicechange = loadDevices
  } catch (err) {
    console.error('Error al inicializar la vista previa y permisos:', err)
  }
}

async function loadDevices() {
  try {
    const allDevices = await navigator.mediaDevices.enumerateDevices()
    devices.value = allDevices
  } catch (err) {
    console.error('Error al enumerar dispositivos:', err)
  }
}

async function updateStream() {
  if (isStreaming.value) return // Bloqueado durante la transmisión por estabilidad

  try {
    // Detener tracks anteriores para liberar la cámara/micrófono
    if (localStream.value) {
      localStream.value.getTracks().forEach(track => track.stop())
    }

    // Configurar restricciones según la selección actual
    const constraints = {
      video: selectedVideoId.value ? { deviceId: { exact: selectedVideoId.value } } : true,
      audio: selectedAudioId.value ? { deviceId: { exact: selectedAudioId.value } } : true
    }

    const stream = await navigator.mediaDevices.getUserMedia(constraints)
    localStream.value = stream
    if (videoEl.value) {
      videoEl.value.srcObject = stream
    }

    await checkTorchSupport(stream)

    // Asegurar que el id seleccionado corresponda al track actual
    const videoTrack = stream.getVideoTracks()[0]
    const audioTrack = stream.getAudioTracks()[0]
    if (videoTrack) selectedVideoId.value = videoTrack.getSettings().deviceId || ''
    if (audioTrack) selectedAudioId.value = audioTrack.getSettings().deviceId || ''

  } catch (err) {
    console.error('Error al actualizar la fuente de video/audio:', err)
  }
}

async function startStreaming() {
  if (isStreaming.value) return

  if (!streamName.value.trim()) {
    alert('Debes asignarle un nombre a la cámara para identificarla en las grabaciones.')
    return
  }

  // Asegurar que tengamos un stream local activo antes de transmitir
  const needsNewStream = !localStream.value || !localStream.value.active || localStream.value.getTracks().some(t => t.readyState === 'ended');
  if (needsNewStream) {
    console.log('Stream local inactivo o sin tracks, solicitando uno nuevo...');
    await updateStream()
  }

  if (!localStream.value) {
    console.error('No hay stream de video/audio configurado para transmitir')
    return
  }

  isStreaming.value = true
  const stream = localStream.value

  try {
    // Si estamos reconectando, reutilizar el ID de transmisión
    if (isReconnecting.value && reconnectTransmisionId) {
      transmisionId.value = reconnectTransmisionId;
    } else {
      // Registrar nueva transmision en BD para obtener ID único
      const res = await http.post('/transmisiones', {
        tipo_origen: 'NAVEGADOR',
        nombre: streamName.value,
        gateway_id: null
      })
      transmisionId.value = res.data.id
    }

    // MODO A: Client-side recording chunks
    if (recordingMode.value === 'A') {
      mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm' })
      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          socket.emit('video-chunk', { chunk: e.data, transmisionId: transmisionId.value })
        }
      }
      mediaRecorder.start(5000) // chunk cada 5 segundos
    }

    // Configuración de Mediasoup SFU
    const rtpCapabilities = await new Promise(resolve => socket.emit('getRouterRtpCapabilities', resolve))
    device = new mediasoupClient.Device()
    await device.load({ routerRtpCapabilities: rtpCapabilities })

    const transportInfo = await new Promise(resolve => socket.emit('createWebRtcTransport', resolve))
    
    const iceServers = import.meta.env.VITE_TURN_URL ? [{
      urls: import.meta.env.VITE_TURN_URL,
      username: import.meta.env.VITE_TURN_USERNAME,
      credential: import.meta.env.VITE_TURN_CREDENTIAL
    }] : undefined

    sendTransport = device.createSendTransport({
      ...transportInfo,
      iceServers
    })

    sendTransport.on('connect', async ({ dtlsParameters }, callback, errback) => {
      try {
        await new Promise(resolve => socket.emit('connectTransport', { transportId: sendTransport.id, dtlsParameters }, resolve))
        callback()
      } catch (err) {
        errback(err)
      }
    })

    sendTransport.on('produce', async ({ kind, rtpParameters }, callback, errback) => {
      try {
        const { id } = await new Promise(resolve => socket.emit('produce', { 
          transportId: sendTransport.id, 
          kind, 
          rtpParameters,
          streamName: streamName.value
        }, resolve))
        callback({ id })
      } catch (err) {
        errback(err)
      }
    })

    const videoTrack = stream.getVideoTracks()[0]
    await sendTransport.produce({ track: videoTrack })
    
    const audioTrack = stream.getAudioTracks()[0]
    if (audioTrack) await sendTransport.produce({ track: audioTrack })

    if (recordOnServer.value) {
      socket.emit('start-recording', { transmisionId: transmisionId.value })
    }

  } catch (err) {
    console.error('Error al iniciar la transmisión:', err)
    isStreaming.value = false
  }
}

function stopStreaming() {
  isStreaming.value = false;
  wasStreaming = false;
  isReconnecting.value = false;

  if (sendTransport) {
    sendTransport.close();
    sendTransport = null;
  }
  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    mediaRecorder.stop();
  }
  // Notificamos al servidor explícitamente que detenemos la transmisión
  socket.emit('stop-streaming');
  
  socket.disconnect();
  setTimeout(() => {
    socket.connect();
    // Al destruir el transporte de MediaSoup, la pista de video se apaga.
    // Volvemos a encender la cámara web localmente para no dejar la pantalla en negro.
    updateStream();
  }, 500);
}
</script>

