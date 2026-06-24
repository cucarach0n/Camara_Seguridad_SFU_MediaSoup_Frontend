<template>
  <div class="flex flex-col items-center justify-center h-[80vh]">
    <div class="bg-zinc-800/50 backdrop-blur-md p-8 rounded-2xl shadow-xl border border-zinc-700 w-full max-w-sm">
      <h2 class="text-3xl font-extrabold mb-6 text-center text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-500">
        Iniciar Sesión
      </h2>
      <form @submit.prevent="handleLogin" class="flex flex-col gap-4">
        <div>
          <label class="block text-sm font-medium text-zinc-400 mb-1">Usuario</label>
          <input 
            v-model="username" 
            type="text" 
            required 
            class="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-teal-500 transition"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-zinc-400 mb-1">Contraseña</label>
          <input 
            v-model="password" 
            type="password" 
            required 
            class="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-teal-500 transition"
          />
        </div>
        
        <div v-if="errorMsg" class="text-red-400 text-sm mt-1 bg-red-900/20 p-2 rounded">
          {{ errorMsg }}
        </div>

        <button 
          type="submit" 
          :disabled="loading"
          class="mt-4 w-full bg-teal-500 hover:bg-teal-400 text-zinc-900 font-bold py-3 rounded-xl shadow-lg shadow-teal-500/30 transition disabled:opacity-50"
        >
          {{ loading ? 'Ingresando...' : 'Entrar' }}
        </button>
      </form>
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
