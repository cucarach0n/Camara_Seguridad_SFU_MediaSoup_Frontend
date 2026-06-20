<template>
  <div class="bg-zinc-800 p-6 rounded-2xl shadow-xl ring-1 ring-white/10">
    <h2 class="text-2xl font-bold mb-4">Viewer (Espectador)</h2>
    
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div v-for="cam in cameras" :key="cam.id" class="aspect-video bg-black rounded-lg overflow-hidden relative shadow-lg">
        <video :id="'video-' + cam.id" autoplay controls class="w-full h-full object-cover"></video>
        <div class="absolute bottom-2 left-2 px-2 py-1 bg-black/60 rounded text-xs">Cámara {{ cam.id }}</div>
      </div>
      
      <div v-if="cameras.length === 0" class="col-span-full py-12 text-center text-zinc-500 border-2 border-dashed border-zinc-700 rounded-lg">
        Esperando transmisión...
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { io } from 'socket.io-client'
import * as mediasoupClient from 'mediasoup-client'

const cameras = ref([])
let socket = null
let device = null
let recvTransport = null

onMounted(async () => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000'
  socket = io(backendUrl)

  socket.on('connect', async () => {
    console.log('Conectado al servidor de Mediasoup')
    await initDevice()
    // Solicitar IDs de productores existentes al conectar
    const producerIds = await new Promise(resolve => socket.emit('getStreamerId', resolve))
    for (const pid of producerIds) {
      await consumeTrack(pid)
    }
  })

  socket.on('new-producer', async (producerId) => {
    await consumeTrack(producerId)
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
    const { id, kind, rtpParameters } = await new Promise(resolve => 
      socket.emit('consume', { producerId, rtpCapabilities: device.rtpCapabilities }, resolve)
    )

    const consumer = await recvTransport.consume({
      id,
      producerId,
      kind,
      rtpParameters,
    })

    await new Promise(resolve => socket.emit('resume', { consumerId: id }, resolve))

    const stream = new MediaStream()
    stream.addTrack(consumer.track)

    // Agregamos a la UI
    if (!cameras.value.find(c => c.id === producerId)) {
      cameras.value.push({ id: producerId })
    }

    // Vue necesita un tick para renderizar la etiqueta video
    setTimeout(() => {
      const videoEl = document.getElementById('video-' + producerId)
      if (videoEl) videoEl.srcObject = stream
    }, 100)

  } catch (err) {
    console.error('Error consuming track:', err)
  }
}
</script>
