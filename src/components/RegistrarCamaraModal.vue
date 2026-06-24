<template>
  <div class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
    <div class="bg-zinc-800 border border-zinc-700 p-6 rounded-2xl shadow-2xl w-full max-w-md">
      <div class="flex justify-between items-center mb-6">
        <h3 class="text-xl font-bold">Registrar Cámara RTSP</h3>
        <button @click="$emit('close')" class="text-zinc-400 hover:text-white">&times;</button>
      </div>

      <form @submit.prevent="handleSubmit" class="flex flex-col gap-4">
        <div>
          <label class="block text-sm text-zinc-400 mb-1">Nombre Descriptivo</label>
          <input v-model="form.nombre" required type="text" class="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 focus:border-teal-500 outline-none" placeholder="Cámara Pasillo">
        </div>

        <div>
          <label class="block text-sm text-zinc-400 mb-1">URL RTSP</label>
          <input v-model="form.url_rtsp" required type="text" class="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 focus:border-teal-500 outline-none" placeholder="rtsp://admin:123@10.0.0.5/live">
        </div>

        <div>
          <label class="block text-sm text-zinc-400 mb-1">Gateway Local (ID DB)</label>
          <select v-model="form.gateway_id" required class="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 focus:border-teal-500 outline-none">
            <option value="" disabled>Seleccione un gateway</option>
            <option v-for="gw in gateways" :key="gw.id" :value="gw.id">
              {{ gw.nombre }} ({{ gw.conectado ? 'Online' : 'Offline' }})
            </option>
          </select>
        </div>

        <div v-if="error" class="text-red-400 text-sm bg-red-900/20 p-2 rounded">{{ error }}</div>

        <div class="flex justify-end gap-3 mt-4">
          <button type="button" @click="$emit('close')" class="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 rounded-lg transition">Cancelar</button>
          <button type="submit" :disabled="loading" class="px-4 py-2 bg-teal-500 hover:bg-teal-400 text-zinc-900 font-bold rounded-lg transition disabled:opacity-50">
            {{ loading ? 'Guardando...' : 'Registrar' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { http } from '../api/http'

const emit = defineEmits(['close'])

const form = ref({
  tipo_origen: 'RTSP',
  nombre: '',
  url_rtsp: '',
  gateway_id: ''
})
const gateways = ref([])
const loading = ref(false)
const error = ref('')

onMounted(async () => {
  try {
    const res = await http.get('/gateways')
    gateways.value = res.data
  } catch (err) {
    error.value = 'Error al cargar gateways'
  }
})

const handleSubmit = async () => {
  loading.value = true
  error.value = ''
  try {
    await http.post('/transmisiones', {
      ...form.value,
      gateway_id: Number(form.value.gateway_id)
    })
    emit('close')
    // Idealmente recargar la lista de cámaras en el Viewer (mediante Pinia o event bus)
    window.location.reload()
  } catch (err) {
    error.value = err.response?.data?.message || 'Error al guardar'
  } finally {
    loading.value = false
  }
}
</script>
