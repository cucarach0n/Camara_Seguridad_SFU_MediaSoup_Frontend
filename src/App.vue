<template>
  <div class="min-h-screen bg-zinc-900 text-white font-sans flex flex-col">
    <!-- Navbar global -->
    <header class="w-full bg-zinc-950 p-4 shadow-md flex justify-between items-center" v-if="auth.token">
      <div class="flex items-center gap-4">
        <h1 class="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-500">
          MCU MediaSoup
        </h1>
        <nav class="hidden md:flex gap-4 ml-6 text-sm font-medium">
          <router-link to="/" class="hover:text-teal-400" active-class="text-teal-400">Dashboard</router-link>
          <router-link to="/grabaciones" class="hover:text-teal-400" active-class="text-teal-400">Grabaciones</router-link>
          <router-link v-if="auth.isAdmin()" to="/admin" class="hover:text-teal-400" active-class="text-teal-400">Admin Panel</router-link>
        </nav>
      </div>
      <div class="flex items-center gap-4 text-sm">
        <span class="text-zinc-400">Hola, {{ auth.user?.username }} ({{ auth.user?.rol }})</span>
        <button @click="handleLogout" class="px-3 py-1 bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white rounded transition">Salir</button>
      </div>
    </header>

    <main class="flex-grow flex flex-col items-center p-6">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { useAuthStore } from './stores/auth.store'
import { useRouter } from 'vue-router'

const auth = useAuthStore()
const router = useRouter()

const handleLogout = () => {
  auth.logout()
  router.push('/login')
}
</script>

<style>
@import 'tailwindcss';
</style>
