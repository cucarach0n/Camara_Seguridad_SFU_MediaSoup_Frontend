<template>
  <div class="w-full max-w-6xl">
    <h2 class="text-2xl font-bold mb-6">Administración Global</h2>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
      <!-- PANEL DE USUARIOS -->
      <div class="bg-zinc-800/30 border border-zinc-700 rounded-2xl p-6">
        <h3 class="text-xl font-bold mb-4 text-teal-400">Usuarios</h3>
        
        <form @submit.prevent="crearUsuario" class="mb-6 flex flex-col gap-3">
          <input v-model="formUser.username" placeholder="Username" required class="w-full bg-zinc-900 border border-zinc-700 rounded p-2 outline-none focus:border-teal-500">
          <input v-model="formUser.password" type="password" placeholder="Contraseña (mín 6)" required class="w-full bg-zinc-900 border border-zinc-700 rounded p-2 outline-none focus:border-teal-500">
          <select v-model="formUser.rol" class="w-full bg-zinc-900 border border-zinc-700 rounded p-2 outline-none focus:border-teal-500">
            <option value="USER">USER</option>
            <option value="ADMIN">ADMIN</option>
          </select>
          <button type="submit" :disabled="loadingUser" class="bg-teal-600 hover:bg-teal-500 rounded p-2 font-bold transition">Crear Usuario</button>
        </form>

        <ul class="space-y-2">
          <li v-for="u in usuarios" :key="u.id" class="flex justify-between items-center p-3 bg-zinc-900 rounded border border-zinc-800">
            <span>{{ u.username }}</span>
            <span class="text-xs px-2 py-1 rounded bg-zinc-700">{{ u.rol }}</span>
          </li>
        </ul>
      </div>

      <!-- PANEL DE GATEWAYS -->
      <div class="bg-zinc-800/30 border border-zinc-700 rounded-2xl p-6">
        <h3 class="text-xl font-bold mb-4 text-blue-400">Gateways RTSP</h3>
        
        <form @submit.prevent="registrarGateway" class="mb-6 flex flex-col gap-3">
          <input v-model="formGw.identificador" placeholder="ID del Gateway (ej. gateway-001)" required class="w-full bg-zinc-900 border border-zinc-700 rounded p-2 outline-none focus:border-blue-500">
          <input v-model="formGw.nombre" placeholder="Nombre (ej. Nodo Oficina)" required class="w-full bg-zinc-900 border border-zinc-700 rounded p-2 outline-none focus:border-blue-500">
          <select v-model="formGw.user_id" required class="w-full bg-zinc-900 border border-zinc-700 rounded p-2 outline-none focus:border-blue-500">
            <option value="" disabled>Dueño del Gateway...</option>
            <option v-for="u in usuarios" :key="u.id" :value="u.id">{{ u.username }}</option>
          </select>
          <button type="submit" :disabled="loadingGw" class="bg-blue-600 hover:bg-blue-500 rounded p-2 font-bold transition">Registrar Gateway</button>
        </form>

        <ul class="space-y-2">
          <li v-for="gw in gateways" :key="gw.id" class="flex justify-between items-center p-3 bg-zinc-900 rounded border border-zinc-800">
            <div>
              <span class="block font-medium">{{ gw.nombre }}</span>
              <span class="text-xs text-zinc-500">{{ gw.identificador }} (Dueño: {{ gw.usuario?.username }})</span>
            </div>
            <span :class="gw.conectado ? 'text-green-400' : 'text-red-400'" class="text-xs font-bold px-2 py-1 rounded bg-zinc-800">
              {{ gw.conectado ? 'Online' : 'Offline' }}
            </span>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { http } from '../api/http'

const usuarios = ref([])
const gateways = ref([])

const formUser = ref({ username: '', password: '', rol: 'USER' })
const formGw = ref({ identificador: '', nombre: '', user_id: '' })

const loadingUser = ref(false)
const loadingGw = ref(false)

const fetchData = async () => {
  try {
    const [uRes, gRes] = await Promise.all([
      http.get('/usuarios'),
      http.get('/gateways')
    ])
    usuarios.value = uRes.data
    gateways.value = gRes.data
  } catch (e) {
    console.error(e)
  }
}

onMounted(fetchData)

const crearUsuario = async () => {
  loadingUser.value = true
  try {
    await http.post('/usuarios', formUser.value)
    formUser.value = { username: '', password: '', rol: 'USER' }
    await fetchData()
  } catch (e) {
    alert(e.response?.data?.message || 'Error al crear usuario')
  } finally {
    loadingUser.value = false
  }
}

const registrarGateway = async () => {
  loadingGw.value = true
  try {
    await http.post('/gateways', formGw.value)
    formGw.value = { identificador: '', nombre: '', user_id: '' }
    await fetchData()
  } catch (e) {
    alert(e.response?.data?.message || 'Error al registrar gateway')
  } finally {
    loadingGw.value = false
  }
}
</script>
