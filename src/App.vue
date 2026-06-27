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
        
        <!-- Desktop Nav -->
        <nav class="hidden lg:flex gap-1 ml-4 text-sm font-medium">
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
        
        <!-- Desktop Logout -->
        <button @click="handleLogout" class="hidden lg:flex px-4 py-2 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-lg transition-all duration-200 items-center gap-2 border border-red-500/20 hover:border-transparent shadow-lg shadow-red-500/0 hover:shadow-red-500/20 active:scale-95">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
          Salir
        </button>

        <!-- Mobile Hamburger Button -->
        <button @click="mobileMenuOpen = !mobileMenuOpen" class="lg:hidden p-2 text-zinc-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
          <svg v-if="!mobileMenuOpen" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
          <svg v-else class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
      </div>
    </header>

    <!-- Mobile Nav Menu (Dropdown) -->
    <transition name="fade">
      <div v-if="auth.token && mobileMenuOpen" class="lg:hidden absolute top-[73px] left-0 right-0 bg-zinc-950/95 backdrop-blur-xl border-b border-white/10 z-40 p-4 flex flex-col gap-2 shadow-2xl">
        <router-link @click="mobileMenuOpen = false" to="/" class="px-4 py-3 rounded-xl text-zinc-300 hover:text-white hover:bg-white/5 transition-all font-medium" active-class="!text-teal-400 bg-teal-500/10 border border-teal-500/20">Dashboard</router-link>
        <router-link @click="mobileMenuOpen = false" to="/grabaciones" class="px-4 py-3 rounded-xl text-zinc-300 hover:text-white hover:bg-white/5 transition-all font-medium" active-class="!text-teal-400 bg-teal-500/10 border border-teal-500/20">Grabaciones</router-link>
        <router-link v-if="auth.isAdmin()" @click="mobileMenuOpen = false" to="/admin" class="px-4 py-3 rounded-xl text-zinc-300 hover:text-white hover:bg-white/5 transition-all font-medium" active-class="!text-teal-400 bg-teal-500/10 border border-teal-500/20">Admin Panel</router-link>
        
        <div class="h-px bg-white/10 my-2"></div>
        <button @click="handleLogout" class="px-4 py-3 text-left text-red-400 hover:text-white hover:bg-red-500/20 rounded-xl transition-all font-medium flex items-center gap-2">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
          Cerrar Sesión
        </button>
      </div>
    </transition>

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
import { ref } from 'vue'
import { useAuthStore } from './stores/auth.store'
import { useRouter } from 'vue-router'

const auth = useAuthStore()
const router = useRouter()
const mobileMenuOpen = ref(false)

const handleLogout = () => {
  auth.logout()
  router.push('/login')
}
</script>

<style>
@import 'tailwindcss';
</style>
