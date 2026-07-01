import { defineStore } from 'pinia';
import { ref } from 'vue';
import { http } from '../api/http';

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('jwt'));
  const user = ref<{ id: number; username: string; rol: string } | null>(null);

  let refreshTimer: any = null;

  const startRefreshTimer = () => {
    stopRefreshTimer();
    // Renovar token cada 1 hora (1 * 60 * 60 * 1000 ms = 3600000 ms)
    refreshTimer = setInterval(async () => {
      try {
        if (!token.value) return;
        const res = await http.get('/auth/refresh');
        token.value = res.data.access_token;
        localStorage.setItem('jwt', token.value as string);
      } catch (e) {
        logout();
      }
    }, 3600000);
  };

  const stopRefreshTimer = () => {
    if (refreshTimer) {
      clearInterval(refreshTimer);
      refreshTimer = null;
    }
  };

  const login = async (username: string, password: string) => {
    const res = await http.post('/auth/login', { username, password });
    token.value = res.data.access_token;
    user.value = { id: res.data.id, username: res.data.username, rol: res.data.rol };
    localStorage.setItem('jwt', token.value as string);
    startRefreshTimer();
  };

  const logout = () => {
    token.value = null;
    user.value = null;
    localStorage.removeItem('jwt');
    stopRefreshTimer();
  };

  const loadProfile = async () => {
    if (!token.value) return;
    try {
      const res = await http.get('/auth/me');
      user.value = res.data;
      startRefreshTimer();
    } catch (e) {
      logout();
    }
  };

  const isAdmin = () => user.value?.rol === 'ADMIN';

  return { token, user, login, logout, loadProfile, isAdmin };
});
