<template>
  <div class="bg-zinc-800 p-6 rounded-2xl shadow-xl ring-1 ring-white/10">
    <h2 class="text-2xl font-bold mb-4">Streamer (Cámara en Vivo)</h2>
    
    <div class="aspect-video bg-black rounded-lg overflow-hidden mb-4 relative">
      <video ref="videoEl" autoplay muted class="w-full h-full object-cover"></video>
      <div v-if="recordingMode" class="absolute top-4 right-4 px-3 py-1 bg-red-500/80 backdrop-blur rounded-full text-xs font-bold animate-pulse">
        MODO: {{ recordingMode }}
      </div>
    </div>
    
    <button @click="startStreaming" :disabled="isStreaming" class="w-full py-3 bg-teal-500 hover:bg-teal-400 disabled:opacity-50 text-zinc-900 font-bold rounded-lg transition">
      {{ isStreaming ? 'Transmitiendo...' : 'Iniciar Transmisión' }}
    </button>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { io } from 'socket.io-client'
import * as mediasoupClient from 'mediasoup-client'

const videoEl = ref(null)
const isStreaming = ref(false)
const recordingMode = ref('')
let socket = null
let device = null
let sendTransport = null
let mediaRecorder = null

onMounted(() => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000'
  socket = io(backendUrl)

  socket.on('connect', () => {
    console.log('Conectado al servidor de Mediasoup')
  })

  socket.on('config-mode', (mode) => {
    recordingMode.value = mode
  })
})

onUnmounted(() => {
  if (socket) socket.disconnect()
  if (mediaRecorder && mediaRecorder.state !== 'inactive') mediaRecorder.stop()
})

async function startStreaming() {
  if (isStreaming.value) return
  isStreaming.value = true

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
    videoEl.value.srcObject = stream

    // MODO A: Client-side recording chunks
    if (recordingMode.value === 'A') {
      mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm' })
      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          socket.emit('video-chunk', e.data)
        }
      }
      mediaRecorder.start(5000) // chunk every 5 seconds
    }

    // Mediasoup SFU setup
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

    socket.emit('start-recording')

  } catch (err) {
    console.error('Error starting stream:', err)
    isStreaming.value = false
  }
}
</script>
