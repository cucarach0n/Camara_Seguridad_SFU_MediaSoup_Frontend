<template>
  <div class="min-h-screen bg-zinc-950 text-white font-sans flex flex-col selection:bg-teal-500/30">
    <!-- Navbar global (Glassmorphism) -->
    <header 
      v-if="auth.token" 
      class="w-full sticky top-0 z-50 bg-zinc-950/80 backdrop-blur-md border-b border-white/5 p-4 flex justify-between items-center transition-all duration-300"
    >
      <div class="flex items-center gap-6">
        <h1 class="text-xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-cyan-400 to-blue-500 flex items-center gap-2">
          <svg class="w-6 h-6 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
          MCU MediaSoup
        </h1>
        <nav class="hidden md:flex gap-1 ml-4 text-sm font-medium">
          <router-link to="/" class="px-4 py-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-all duration-200" active-class="!text-teal-400 bg-teal-500/10 shadow-inner">Dashboard</router-link>
          <router-link to="/grabaciones" class="px-4 py-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-all duration-200" active-class="!text-teal-400 bg-teal-500/10 shadow-inner">Grabaciones</router-link>
          <router-link v-if="auth.isAdmin()" to="/admin" class="px-4 py-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-all duration-200" active-class="!text-teal-400 bg-teal-500/10 shadow-inner">Admin Panel</router-link>
        </nav>
      </div>
      <div class="flex items-center gap-4 text-sm">
        <div class="hidden sm:flex flex-col items-end mr-2">
          <span class="text-zinc-200 font-semibold leading-tight">{{ auth.user?.username }}</span>
          <span class="text-[10px] text-teal-400 uppercase tracking-wider font-bold">{{ auth.user?.rol }}</span>
        </div>
        <button @click="handleLogout" class="px-4 py-2 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-lg transition-all duration-200 flex items-center gap-2 border border-red-500/20 hover:border-transparent shadow-lg shadow-red-500/0 hover:shadow-red-500/20 active:scale-95">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
          Salir
        </button>
      </div>
    </header>

    <main class="flex-grow flex flex-col items-center p-4 sm:p-6 lg:p-8 w-full max-w-screen-2xl mx-auto">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
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
