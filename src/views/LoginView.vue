<template>
  <div class="flex flex-col items-center justify-center min-h-[85vh] w-full px-4">
    <div class="relative w-full max-w-sm">
      <!-- Glow effect behind the card -->
      <div class="absolute -inset-1 bg-gradient-to-r from-teal-500 to-blue-500 rounded-3xl blur opacity-20 animate-pulse"></div>
      
      <div class="relative bg-zinc-900/80 backdrop-blur-xl p-8 rounded-2xl shadow-2xl border border-white/10 w-full transform transition-all duration-300 hover:shadow-teal-500/10 hover:border-white/20">
        <div class="flex justify-center mb-6">
          <div class="w-16 h-16 bg-gradient-to-br from-teal-400 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg shadow-teal-500/20">
            <svg class="w-8 h-8 text-zinc-950" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
          </div>
        </div>
        
        <h2 class="text-3xl font-black mb-8 text-center tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-500">
          Bienvenido
        </h2>
        
        <form @submit.prevent="handleLogin" class="flex flex-col gap-5">
          <div class="group relative">
            <label class="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5 transition-colors group-focus-within:text-teal-400">Usuario</label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500 group-focus-within:text-teal-400 transition-colors">
                <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
              </div>
              <input 
                v-model="username" 
                type="text" 
                required 
                placeholder="Ingresa tu usuario"
                class="w-full bg-zinc-950/50 border border-zinc-800 rounded-xl pl-10 pr-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all duration-300"
              />
            </div>
          </div>
          
          <div class="group relative">
            <label class="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5 transition-colors group-focus-within:text-teal-400">Contraseña</label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500 group-focus-within:text-teal-400 transition-colors">
                <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
              </div>
              <input 
                v-model="password" 
                type="password" 
                required 
                placeholder="••••••••"
                class="w-full bg-zinc-950/50 border border-zinc-800 rounded-xl pl-10 pr-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all duration-300"
              />
            </div>
          </div>
          
          <transition name="fade">
            <div v-if="errorMsg" class="flex items-center gap-2 text-red-400 text-sm mt-2 bg-red-500/10 border border-red-500/20 p-3 rounded-lg">
              <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              {{ errorMsg }}
            </div>
          </transition>

          <button 
            type="submit" 
            :disabled="loading"
            class="mt-6 w-full relative group overflow-hidden bg-teal-500 text-zinc-950 font-bold py-3.5 rounded-xl shadow-[0_0_15px_rgba(20,184,166,0.3)] hover:shadow-[0_0_25px_rgba(20,184,166,0.5)] transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed transform active:scale-95"
          >
            <div class="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
            <span class="relative flex items-center justify-center gap-2">
              <svg v-if="loading" class="animate-spin h-5 w-5 text-zinc-950" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ loading ? 'Iniciando sesión...' : 'Ingresar al Sistema' }}
            </span>
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth.store'

const username = ref('')
const password = ref('')
const errorMsg = ref('')
const loading = ref(false)

const router = useRouter()
const auth = useAuthStore()

const handleLogin = async () => {
  loading.value = true
  errorMsg.value = ''
  try {
    await auth.login(username.value, password.value)
    router.push('/')
  } catch (err) {
    errorMsg.value = err.response?.data?.message || 'Error de conexión'
  } finally {
    loading.value = false
  }
}
</script>
