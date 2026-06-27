<template>
  <div class="bg-zinc-800 p-6 rounded-2xl shadow-xl ring-1 ring-white/10">
    <h2 class="text-2xl font-bold mb-4">Streamer (Cámara en Vivo)</h2>
    
    <div class="aspect-video bg-black rounded-lg overflow-hidden mb-4 relative shadow-inner">
      <video ref="videoEl" autoplay muted playsinline class="w-full h-full object-cover"></video>
      <div v-if="recordingMode" class="absolute top-4 right-4 px-3 py-1 bg-red-500/80 backdrop-blur rounded-full text-xs font-bold animate-pulse">
        MODO: {{ recordingMode }}
      </div>
    </div>

    <!-- Controles de Selección de Dispositivos (Estilo Moderno/Glassmorphism) -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
      <div class="flex flex-col">
        <label for="videoSource" class="text-xs font-semibold text-zinc-400 mb-1.5 flex items-center gap-1">
          <span class="inline-block w-2 h-2 rounded-full bg-teal-400"></span>
          Cámara / Video
        </label>
        <select 
          id="videoSource" 
          v-model="selectedVideoId" 
          @change="updateStream" 
          :disabled="isStreaming"
          class="w-full bg-zinc-900/60 border border-zinc-700/80 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:ring-2 focus:ring-teal-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition duration-150"
        >
          <option v-for="device in videoDevices" :key="device.deviceId" :value="device.deviceId">
            {{ device.label || `Cámara ${device.deviceId.slice(0, 5)}` }}
          </option>
          <option v-if="videoDevices.length === 0" value="">No se encontraron cámaras</option>
        </select>
      </div>

      <div class="flex flex-col">
        <label for="audioSource" class="text-xs font-semibold text-zinc-400 mb-1.5 flex items-center gap-1">
          <span class="inline-block w-2 h-2 rounded-full bg-blue-400"></span>
          Micrófono / Audio
        </label>
        <select 
          id="audioSource" 
          v-model="selectedAudioId" 
          @change="updateStream" 
          :disabled="isStreaming"
          class="w-full bg-zinc-900/60 border border-zinc-700/80 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:ring-2 focus:ring-teal-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition duration-150"
        >
          <option v-for="device in audioDevices" :key="device.deviceId" :value="device.deviceId">
            {{ device.label || `Micrófono ${device.deviceId.slice(0, 5)}` }}
          </option>
          <option v-if="audioDevices.length === 0" value="">No se encontraron micrófonos</option>
        </select>
      </div>
    </div>

    <!-- Control de Linterna (Solo visible si es soportada) -->
    <div v-if="isTorchSupported" class="mb-4">
      <button 
        @click="toggleTorch"
        :class="isTorchOn ? 'bg-yellow-500 hover:bg-yellow-400 text-zinc-900' : 'bg-zinc-700 hover:bg-zinc-600 text-white'"
        class="w-full py-2 font-bold rounded-lg transition duration-200 flex justify-center items-center gap-2 shadow-md"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" :opacity="isTorchOn ? '1' : '0.5'"></path>
        </svg>
        {{ isTorchOn ? 'Apagar Linterna' : 'Encender Linterna' }}
      </button>
    </div>
    
    <div class="mb-4 flex items-center gap-2">
      <input type="checkbox" id="recordServer" v-model="recordOnServer" class="w-4 h-4 text-teal-500 bg-zinc-900 border-zinc-700 rounded focus:ring-teal-500">
      <label for="recordServer" class="text-sm font-semibold text-zinc-300">Grabar en el servidor (DVR)</label>
    </div>

    <!-- Botón Principal -->
    <button 
      v-if="!isStreaming && !isReconnecting"
      @click="startStreaming" 
      class="w-full py-3 bg-teal-500 hover:bg-teal-400 text-zinc-900 font-bold rounded-lg transition duration-200 transform hover:scale-[1.01] active:scale-[0.99] shadow-lg shadow-teal-500/10"
    >
      Iniciar Transmisión
    </button>
    <button 
      v-else-if="isReconnecting"
      disabled
      class="w-full py-3 bg-yellow-500/50 text-zinc-200 font-bold rounded-lg transition duration-200 cursor-not-allowed flex justify-center items-center gap-2"
    >
      <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      Reconectando...
    </button>
    <button 
      v-else
      @click="stopStreaming" 
      class="w-full py-3 bg-red-500 hover:bg-red-400 text-white font-bold rounded-lg transition duration-200 transform hover:scale-[1.01] active:scale-[0.99] shadow-lg shadow-red-500/10"
    >
      Detener Transmisión
    </button>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { io } from 'socket.io-client'
import * as mediasoupClient from 'mediasoup-client'
import { useAuthStore } from '../stores/auth.store'

const videoEl = ref(null)
const isStreaming = ref(false)
const isReconnecting = ref(false)
let wasStreaming = false

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

  // Asegurar que tengamos un stream local antes de transmitir
  if (!localStream.value) {
    await updateStream()
  }

  if (!localStream.value) {
    console.error('No hay stream de video/audio configurado para transmitir')
    return
  }

  isStreaming.value = true
  const stream = localStream.value

  try {
    // MODO A: Client-side recording chunks
    if (recordingMode.value === 'A') {
      mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm' })
      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          socket.emit('video-chunk', e.data)
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
        const { id } = await new Promise(resolve => socket.emit('produce', { transportId: sendTransport.id, kind, rtpParameters }, resolve))
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
      socket.emit('start-recording')
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
  // Notificamos al servidor que detenemos todo
  socket.disconnect();
  setTimeout(() => {
    socket.connect();
    // Al destruir el transporte de MediaSoup, la pista de video se apaga.
    // Volvemos a encender la cámara web localmente para no dejar la pantalla en negro.
    updateStream();
  }, 500);
}
</script>

