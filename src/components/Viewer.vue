<template>
  <div class="grid grid-cols-1 lg:grid-cols-4 gap-6 animate-[fade-in_0.5s_ease-out]">
    <!-- Panel Izquierdo: Lista de Cámaras IP de Vigilancia -->
    <div class="lg:col-span-1 bg-zinc-900/40 backdrop-blur-xl p-5 rounded-3xl shadow-2xl border border-white/5 flex flex-col h-full max-h-[85vh]">
      <h3 class="text-lg font-black mb-5 flex items-center gap-2 text-white">
        <span class="inline-block w-2.5 h-2.5 rounded-full bg-teal-500 shadow-[0_0_8px_rgba(20,184,166,0.8)] animate-pulse"></span>
        Nodos RTSP (LAN)
      </h3>
      
      <div class="space-y-3 flex-1 overflow-y-auto pr-2 custom-scrollbar">
        <div 
          v-for="cam in rtspCameras" 
          :key="cam.id" 
          class="bg-zinc-950/50 border border-white/5 p-4 rounded-2xl flex flex-col gap-3 transition-all duration-300 hover:border-teal-500/30 hover:bg-zinc-900/60 group"
        >
          <div class="flex items-start justify-between gap-2">
            <div>
              <p class="text-sm font-bold text-zinc-200 group-hover:text-white transition-colors">{{ cam.name }}</p>
              <p class="text-[10px] text-zinc-500 font-mono mt-0.5">{{ cam.id }}</p>
            </div>
            <div class="flex flex-col items-end gap-1.5">
              <span 
                class="px-2.5 py-1 text-[9px] font-black rounded-lg tracking-widest flex items-center gap-1.5 shadow-sm"
                :class="cam.isLive ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30 shadow-teal-500/10' : 'bg-zinc-800 text-zinc-500 border border-zinc-700'"
              >
                <span v-if="cam.isLive" class="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse"></span>
                {{ cam.isLive ? 'EN VIVO' : 'OFFLINE' }}
              </span>
              <button 
                @click="deleteRtspCamera(cam.id)" 
                class="w-6 h-6 flex items-center justify-center bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded transition-colors border border-red-500/20" 
                title="Eliminar Cámara RTSP"
              >
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
              </button>
            </div>
          </div>

          <div class="flex gap-2 mt-1">
            <button 
              @click="toggleCamera(cam)" 
              class="flex-1 py-2 px-3 text-xs font-bold rounded-xl transition-all duration-300 active:scale-95 flex items-center justify-center gap-1.5"
              :class="cam.isLive 
                ? 'bg-teal-500 hover:bg-teal-400 text-zinc-950 shadow-lg shadow-teal-500/20' 
                : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-white/5'"
            >
              <svg v-if="cam.isLive" class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd"></path></svg>
              <svg v-else class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
              {{ cam.isLive ? 'Visualizar' : 'Conectar' }}
            </button>
            <button 
              v-if="cam.isLive" 
              @click="disconnectCamera(cam.id)" 
              class="py-2 px-3 text-xs font-bold bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white rounded-xl border border-rose-500/20 transition-all duration-300 active:scale-95 shadow-sm hover:shadow-rose-500/20"
              title="Apagar stream"
            >
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </button>
          </div>
          
          <div class="mt-2 pt-3 border-t border-white/5 flex items-center justify-between text-xs">
            <span class="text-zinc-400 font-semibold flex items-center gap-1.5">
              <svg class="w-3.5 h-3.5 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path></svg>
              Auto-Grabación (DVR)
            </span>
            <button 
              @click="toggleGrabacion(cam)" 
              :disabled="cam.isToggling"
              class="w-10 h-5 rounded-full relative transition-all duration-300 border border-white/10"
              :class="[cam.grabacion_activa ? 'bg-teal-500 border-teal-500' : 'bg-zinc-700/50', cam.isToggling ? 'opacity-50 cursor-not-allowed' : 'hover:ring-2 ring-white/10']"
            >
              <span 
                class="absolute top-0.5 left-0.5 w-3.5 h-3.5 rounded-full shadow-sm transition-transform duration-300 flex items-center justify-center"
                :class="[cam.grabacion_activa ? 'translate-x-5 bg-zinc-950' : 'translate-x-0 bg-zinc-400', cam.isToggling ? 'bg-transparent' : '']"
              >
                <!-- Spinner SVG when loading -->
                <svg v-if="cam.isToggling" class="animate-spin w-3 h-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </span>
            </button>
          </div>
        </div>

        <div v-if="rtspCameras.length === 0" class="flex flex-col items-center justify-center py-10 text-zinc-500 text-xs border border-dashed border-white/10 rounded-2xl bg-zinc-950/30">
          <svg class="w-8 h-8 mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          Buscando local gateways...
        </div>
      </div>
    </div>

    <!-- Panel Derecho: Grid de Transmisiones en Vivo -->
    <div class="lg:col-span-3 bg-zinc-900/40 backdrop-blur-xl p-6 rounded-3xl shadow-2xl border border-white/5 flex flex-col h-full max-h-[85vh]">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-2xl font-black text-white flex items-center gap-3">
          <svg class="w-6 h-6 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>
          Muro de Monitoreo
        </h2>
        <div class="px-3 py-1.5 bg-zinc-950/80 rounded-lg text-xs font-bold text-zinc-400 border border-white/5 shadow-inner">
          <span class="text-teal-400">{{ cameras.length }}</span> ACTIVAS
        </div>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 overflow-y-auto custom-scrollbar pr-2 content-start">
        <div v-for="cam in cameras" :key="cam.id" class="aspect-video bg-black rounded-2xl overflow-hidden relative shadow-[0_0_15px_rgba(0,0,0,0.5)] group ring-1 ring-white/10 hover:ring-teal-500/50 transition-all duration-300">
          <video :id="'video-' + cam.id" autoplay playsinline class="w-full h-full object-cover"></video>
          
          <!-- Controles en Hover (para no ensuciar la vista) -->
          <div class="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex justify-between items-end">
            <div class="flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)] animate-pulse"></span>
              <span class="text-white font-bold text-sm tracking-wide shadow-black drop-shadow-md">{{ cam.name }}</span>
            </div>
            
            <div class="flex gap-2">
              <button @click="toggleFullscreen('video-' + cam.id)" class="p-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg backdrop-blur-sm transition-colors border border-white/10">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"></path></svg>
              </button>
            </div>
          </div>
        </div>
        
        <div v-if="cameras.length === 0" class="col-span-full h-64 border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center gap-4 bg-zinc-950/30">
          <div class="w-16 h-16 rounded-full bg-zinc-900 flex items-center justify-center shadow-inner">
            <svg class="w-8 h-8 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
          </div>
          <p class="text-zinc-500 font-medium">No hay transmisiones seleccionadas para monitoreo.</p>
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
const activeCameraIds = new Set()

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

    // Auto-reconectar cámaras RTSP que estaban activas antes de la desconexión
    for (const camId of activeCameraIds) {
      try {
        console.log(`Auto-reconectando cámara RTSP: ${camId}`);
        await new Promise((resolve, reject) => {
          socket.emit('request-camera-stream', { cameraId: camId }, (res) => {
            if (res && res.error) reject(new Error(res.error));
            else resolve(res);
          });
        });
      } catch (err) {
        console.error(`Fallo auto-reconexión de cámara ${camId}:`, err);
        activeCameraIds.delete(camId);
      }
    }
  })

  socket.on('disconnect', () => {
    console.warn('Conexión perdida con el servidor. Limpiando reproductores...');
    // Al perder conexión, limpiar el grid visual y el transporte local
    cameras.value = [];
    if (recvTransport) {
      recvTransport.close();
      recvTransport = null;
    }
    if (device) {
      device = null;
    }
  })

  socket.on('new-producer', async (producerId) => {
    await consumeTrack(producerId)
  })

  socket.on('streamer-disconnected', (streamerId) => {
    console.log(`Streamer desconectado: ${streamerId}. Removiendo de la vista.`);
    cameras.value = cameras.value.filter(c => c.id !== streamerId);
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
        else {
          activeCameraIds.add(camera.id);
          resolve(res);
        }
      });
    });
  } catch (err) {
    console.error('Error al activar stream de la cámara:', err);
    alert('No se pudo activar: ' + (err.message || 'Sin permisos'));
  }
}

function disconnectCamera(cameraId) {
  activeCameraIds.delete(cameraId);
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

function toggleFullscreen(elementId) {
  const el = document.getElementById(elementId);
  if (!el) return;
  if (!document.fullscreenElement) {
    if (el.requestFullscreen) {
      el.requestFullscreen();
    } else if (el.webkitRequestFullscreen) { /* Safari */
      el.webkitRequestFullscreen();
    } else if (el.msRequestFullscreen) { /* IE11 */
      el.msRequestFullscreen();
    }
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  }
}

async function deleteRtspCamera(id) {
  if (!confirm('¿Estás seguro de que deseas eliminar permanentemente este Nodo RTSP?')) return
  
  try {
    await http.delete(`/transmisiones/${id}`)
    rtspCameras.value = rtspCameras.value.filter(c => c.id !== id)
    console.log(`Cámara ${id} eliminada exitosamente.`)
  } catch (err) {
    console.error('Error eliminando cámara RTSP:', err)
    alert(err.response?.data?.message || 'Error al eliminar la cámara')
  }
}
</script>

