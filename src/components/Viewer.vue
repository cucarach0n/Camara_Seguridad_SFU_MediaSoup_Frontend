<template>
  <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
    <!-- Panel Izquierdo: Lista de Cámaras IP de Vigilancia -->
    <div class="lg:col-span-1 bg-zinc-800 p-5 rounded-2xl shadow-xl ring-1 ring-white/10 flex flex-col">
      <h3 class="text-lg font-bold mb-4 flex items-center gap-2">
        <span class="inline-block w-2.5 h-2.5 rounded-full bg-teal-500 animate-pulse"></span>
        Cámaras RTSP (LAN)
      </h3>
      
      <div class="space-y-3 flex-1 overflow-y-auto max-h-[300px] lg:max-h-none">
        <div 
          v-for="cam in rtspCameras" 
          :key="cam.id" 
          class="bg-zinc-900/60 border border-zinc-700/50 p-3.5 rounded-xl flex flex-col gap-2 hover:border-zinc-600 transition"
        >
          <div class="flex items-start justify-between gap-2">
            <div>
              <p class="text-sm font-semibold text-zinc-200">{{ cam.name }}</p>
              <p class="text-[10px] text-zinc-500 font-mono">{{ cam.id }}</p>
            </div>
            <span 
              class="px-2 py-0.5 text-[9px] font-bold rounded-full uppercase tracking-wider"
              :class="cam.isLive ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30' : 'bg-zinc-700/40 text-zinc-400 border border-zinc-700/50'"
            >
              {{ cam.isLive ? 'En vivo' : 'Inactivo' }}
            </span>
          </div>

          <div class="flex gap-2 mt-1">
            <button 
              @click="toggleCamera(cam)" 
              class="flex-1 py-1.5 px-3 text-xs font-bold rounded-lg transition"
              :class="cam.isLive 
                ? 'bg-teal-500 hover:bg-teal-400 text-zinc-900 shadow-md shadow-teal-500/10' 
                : 'bg-zinc-700 hover:bg-zinc-600 text-zinc-200'"
            >
              {{ cam.isLive ? 'Ver / Conectar' : 'Activar Stream' }}
            </button>
            <button 
              v-if="cam.isLive" 
              @click="disconnectCamera(cam.id)" 
              class="py-1.5 px-2.5 text-xs font-bold bg-red-500/20 hover:bg-red-500 text-red-400 hover:text-white rounded-lg border border-red-500/30 transition"
              title="Apagar stream"
            >
              Apagar
            </button>
          </div>
          <div class="mt-2 flex items-center justify-between text-xs">
            <span class="text-zinc-400">Grabación Automática (DVR):</span>
            <button 
              @click="toggleGrabacion(cam)" 
              :disabled="cam.isToggling"
              class="w-10 h-5 rounded-full relative transition-colors duration-200"
              :class="[cam.grabacion_activa ? 'bg-teal-500' : 'bg-zinc-600', cam.isToggling ? 'opacity-50 cursor-not-allowed' : '']"
            >
              <span 
                class="absolute top-0.5 left-0.5 w-4 h-4 rounded-full transition-transform duration-200 flex items-center justify-center"
                :class="[cam.grabacion_activa ? 'translate-x-5 bg-white' : 'translate-x-0 bg-white', cam.isToggling ? 'bg-transparent' : '']"
              >
                <!-- Spinner SVG when loading -->
                <svg v-if="cam.isToggling" class="animate-spin w-4 h-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </span>
            </button>
          </div>
        </div>

        <div v-if="rtspCameras.length === 0" class="text-center py-6 text-zinc-500 text-xs border border-dashed border-zinc-700 rounded-xl">
          Buscando local gateways...
        </div>
      </div>
    </div>

    <!-- Panel Derecho: Grid de Transmisiones en Vivo -->
    <div class="lg:col-span-3 bg-zinc-800 p-6 rounded-2xl shadow-xl ring-1 ring-white/10">
      <h2 class="text-2xl font-bold mb-4 flex items-center justify-between">
        <span>Espectador (Monitoreo)</span>
        <span class="text-xs text-zinc-400 font-normal">Active Streams: {{ cameras.length }}</span>
      </h2>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div v-for="cam in cameras" :key="cam.id" class="aspect-video bg-black rounded-lg overflow-hidden relative shadow-lg group">
          <video :id="'video-' + cam.id" autoplay controls playsinline class="w-full h-full object-cover"></video>
          <div class="absolute bottom-3 left-3 px-2 py-1 bg-black/70 backdrop-blur rounded text-xs font-medium border border-white/5">
            {{ cam.name }}
          </div>
        </div>
        
        <div v-if="cameras.length === 0" class="col-span-full py-16 text-center text-zinc-500 border-2 border-dashed border-zinc-700 rounded-lg flex flex-col items-center justify-center gap-2">
          <span class="text-3xl">📹</span>
          <span>No hay transmisiones en directo en este momento.</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { io } from 'socket.io-client'
import * as mediasoupClient from 'mediasoup-client'
import { useAuthStore } from '../stores/auth.store'
import { http } from '../api/http'

const cameras = ref([])
const rtspCameras = ref([])
const auth = useAuthStore()
let socket = null
let device = null
let recvTransport = null

onMounted(async () => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000'
  socket = io(backendUrl, {
    auth: { token: auth.token }
  })

  socket.on('connect', async () => {
    console.log('Conectado al servidor de Mediasoup')
    await initDevice()
    // Solicitar IDs de productores existentes al conectar
    const producerIds = await new Promise(resolve => socket.emit('getStreamerId', resolve))
    for (const pid of producerIds) {
      await consumeTrack(pid)
    }

    // Solicitar lista de cámaras RTSP
    const list = await new Promise(resolve => socket.emit('get-rtsp-cameras', resolve))
    rtspCameras.value = list
  })

  socket.on('new-producer', async (producerId) => {
    await consumeTrack(producerId)
  })

  socket.on('rtsp-cameras-updated', (list) => {
    rtspCameras.value = list
  })
})

onUnmounted(() => {
  if (socket) socket.disconnect()
})

async function initDevice() {
  const rtpCapabilities = await new Promise(resolve => socket.emit('getRouterRtpCapabilities', resolve))
  device = new mediasoupClient.Device()
  await device.load({ routerRtpCapabilities: rtpCapabilities })

  const transportInfo = await new Promise(resolve => socket.emit('createWebRtcTransport', resolve))
  
  const iceServers = import.meta.env.VITE_TURN_URL ? [{
    urls: import.meta.env.VITE_TURN_URL,
    username: import.meta.env.VITE_TURN_USERNAME,
    credential: import.meta.env.VITE_TURN_CREDENTIAL
  }] : undefined

  recvTransport = device.createRecvTransport({
    ...transportInfo,
    iceServers
  })

  recvTransport.on('connect', async ({ dtlsParameters }, callback, errback) => {
    try {
      await new Promise(resolve => socket.emit('connectTransport', { transportId: recvTransport.id, dtlsParameters }, resolve))
      callback()
    } catch (err) {
      errback(err)
    }
  })
}

async function consumeTrack(producerId) {
  try {
    const { id, kind, rtpParameters, appData } = await new Promise(resolve => 
      socket.emit('consume', { producerId, rtpCapabilities: device.rtpCapabilities }, resolve)
    )

    const consumer = await recvTransport.consume({
      id,
      producerId,
      kind,
      rtpParameters,
    })

    const streamId = appData?.cameraId || appData?.socketId || producerId;
    const isRtsp = !!appData?.cameraId;

    let streamObj = cameras.value.find(c => c.id === streamId);
    if (!streamObj) {
      streamObj = {
        id: streamId,
        name: isRtsp 
          ? (rtspCameras.value.find(c => c.id === streamId)?.name || `Cámara ${streamId}`)
          : `Streamer ${streamId.slice(0, 5)}`,
        type: isRtsp ? 'rtsp' : 'webcam',
        mediaStream: new MediaStream(),
        producerIds: []
      };
      cameras.value.push(streamObj);
    }

    // Agregar track al MediaStream existente del grupo
    streamObj.mediaStream.addTrack(consumer.track);
    streamObj.producerIds.push(producerId);

    // Detectar cierre del productor desde el lado de MediaSoup
    consumer.on('producerclose', () => {
      console.log(`Productor cerrado para el consumer: ${consumer.id}. Removiendo track.`);
      consumer.close();
      
      streamObj.mediaStream.removeTrack(consumer.track);
      streamObj.producerIds = streamObj.producerIds.filter(pid => pid !== producerId);
      
      if (streamObj.producerIds.length === 0) {
        cameras.value = cameras.value.filter(c => c.id !== streamId);
      }
    });

    await new Promise(resolve => socket.emit('resume', { consumerId: id }, resolve))

    // Vue necesita un tick para renderizar la etiqueta video
    setTimeout(() => {
      const videoEl = document.getElementById('video-' + streamId)
      if (videoEl) {
        videoEl.srcObject = streamObj.mediaStream;
      }
    }, 100)

  } catch (err) {
    console.error('Error consuming track:', err)
  }
}

async function toggleCamera(camera) {
  try {
    await new Promise((resolve, reject) => {
      socket.emit('request-camera-stream', { cameraId: camera.id }, (res) => {
        if (res && res.error) reject(new Error(res.error));
        else resolve(res);
      });
    });
  } catch (err) {
    console.error('Error al activar stream de la cámara:', err);
    alert('No se pudo activar: ' + (err.message || 'Sin permisos'));
  }
}

function disconnectCamera(cameraId) {
  socket.emit('leave-camera-stream', { cameraId });
}

async function toggleGrabacion(camera) {
  if (camera.isToggling) return;
  
  camera.isToggling = true;
  const newState = !camera.grabacion_activa;
  
  try {
    const res = await new Promise((resolve) => {
      socket.emit('toggle-dvr', { cameraId: camera.id, state: newState }, resolve);
    });

    if (res && res.success) {
      camera.grabacion_activa = res.grabacion_activa;
    } else {
      console.error('Error del servidor al cambiar grabación:', res?.error);
      alert('Error: ' + (res?.error || 'Desconocido'));
    }
  } catch (err) {
    console.error('Error al cambiar grabación:', err)
    alert('No se pudo cambiar el estado de grabación')
  } finally {
    camera.isToggling = false;
  }
}
</script>

