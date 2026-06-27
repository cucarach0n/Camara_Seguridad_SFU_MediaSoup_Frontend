<template>
  <div class="w-full max-w-7xl animate-[fade-in_0.5s_ease-out]">
    <div class="flex items-center gap-3 mb-8">
      <div class="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg shadow-lg shadow-indigo-500/20">
        <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
      </div>
      <h2 class="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-400">Administración Global</h2>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <!-- PANEL DE USUARIOS -->
      <div class="bg-zinc-900/40 backdrop-blur-md border border-white/5 rounded-3xl p-6 xl:p-8 shadow-2xl flex flex-col transition-all duration-300 hover:border-white/10 hover:shadow-indigo-500/10">
        <h3 class="text-xl font-bold mb-6 text-indigo-400 flex items-center gap-2">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
          Gestión de Usuarios
        </h3>
        
        <form @submit.prevent="crearUsuario" class="mb-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="sm:col-span-2">
            <input v-model="formUser.username" placeholder="Username" required class="w-full bg-zinc-950/50 border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder-zinc-600 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all">
          </div>
          <input v-model="formUser.password" type="password" placeholder="Contraseña (mín 6)" required class="w-full bg-zinc-950/50 border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder-zinc-600 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all">
          <div class="relative">
            <select v-model="formUser.rol" class="w-full appearance-none bg-zinc-950/50 border border-zinc-800 rounded-xl px-4 py-3 text-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all">
              <option value="USER">Rol: USER</option>
              <option value="ADMIN">Rol: ADMIN</option>
            </select>
            <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-zinc-500">
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
          </div>
          <button type="submit" :disabled="loadingUser" class="sm:col-span-2 relative group overflow-hidden bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3.5 rounded-xl shadow-[0_0_15px_rgba(79,70,229,0.2)] hover:shadow-[0_0_25px_rgba(79,70,229,0.4)] transition-all duration-300 transform active:scale-95 disabled:opacity-50">
            <div class="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
            <span class="relative">{{ loadingUser ? 'Creando...' : 'Crear Usuario' }}</span>
          </button>
        </form>

        <div class="flex-grow overflow-y-auto pr-2 custom-scrollbar">
          <ul class="space-y-3">
            <li v-for="u in usuarios" :key="u.id" class="flex justify-between items-center p-4 bg-zinc-950/50 rounded-xl border border-white/5 hover:border-indigo-500/30 transition-colors group">
              <span class="font-medium text-zinc-200 group-hover:text-white transition-colors">{{ u.username }}</span>
              <span class="text-xs font-bold px-3 py-1 rounded-full tracking-wider" :class="u.rol === 'ADMIN' ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' : 'bg-zinc-800 text-zinc-400 border border-zinc-700'">{{ u.rol }}</span>
            </li>
          </ul>
        </div>
      </div>

      <!-- PANEL DE GATEWAYS -->
      <div class="bg-zinc-900/40 backdrop-blur-md border border-white/5 rounded-3xl p-6 xl:p-8 shadow-2xl flex flex-col transition-all duration-300 hover:border-white/10 hover:shadow-cyan-500/10">
        <h3 class="text-xl font-bold mb-6 text-cyan-400 flex items-center gap-2">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
          Gateways RTSP Locales
        </h3>
        
        <form @submit.prevent="registrarGateway" class="mb-8 flex flex-col gap-4">
          <div class="flex flex-col gap-4">
            <input v-model="formGw.identificador" placeholder="ID del Gateway (ej. gateway-001)" required class="w-full bg-zinc-950/50 border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder-zinc-600 outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all">
            <input v-model="formGw.nombre" placeholder="Nombre (ej. Nodo Oficina Principal)" required class="w-full bg-zinc-950/50 border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder-zinc-600 outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all">
          </div>
          <div class="relative">
            <select v-model="formGw.user_id" required class="w-full appearance-none bg-zinc-950/50 border border-zinc-800 rounded-xl px-4 py-3 text-white outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all" :class="{'text-zinc-500': formGw.user_id === ''}">
              <option value="" disabled>Seleccionar Dueño del Gateway...</option>
              <option v-for="u in usuarios" :key="u.id" :value="u.id">{{ u.username }}</option>
            </select>
            <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-zinc-500">
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
          </div>
          <button type="submit" :disabled="loadingGw" class="relative group overflow-hidden bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3.5 rounded-xl shadow-[0_0_15px_rgba(8,145,178,0.2)] hover:shadow-[0_0_25px_rgba(8,145,178,0.4)] transition-all duration-300 transform active:scale-95 disabled:opacity-50">
            <div class="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
            <span class="relative">{{ loadingGw ? 'Registrando...' : 'Registrar Gateway' }}</span>
          </button>
        </form>

        <div class="flex-grow overflow-y-auto pr-2 custom-scrollbar">
          <ul class="space-y-3">
            <li v-for="gw in gateways" :key="gw.id" class="flex justify-between items-center p-4 bg-zinc-950/50 rounded-xl border border-white/5 hover:border-cyan-500/30 transition-colors group">
              <div>
                <span class="block font-bold text-zinc-200 group-hover:text-white transition-colors">{{ gw.nombre }}</span>
                <span class="text-[11px] text-zinc-500 font-mono mt-0.5 block">{{ gw.identificador }} • Dueño: {{ gw.usuario?.username }}</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="relative flex h-3 w-3">
                  <span v-if="gw.conectado" class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span class="relative inline-flex rounded-full h-3 w-3" :class="gw.conectado ? 'bg-green-500' : 'bg-zinc-600'"></span>
                </span>
                <span :class="gw.conectado ? 'text-green-400' : 'text-zinc-500'" class="text-xs font-bold uppercase tracking-wider">
                  {{ gw.conectado ? 'Online' : 'Offline' }}
                </span>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
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
