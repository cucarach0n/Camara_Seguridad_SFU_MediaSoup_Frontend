import { defineStore } from 'pinia';
import { ref } from 'vue';
import { http } from '../api/http';

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('jwt'));
  const user = ref<{ id: number; username: string; rol: string } | null>(null);

  const login = async (username: string, password: string) => {
    const res = await http.post('/auth/login', { username, password });
    token.value = res.data.access_token;
    user.value = { id: res.data.id, username: res.data.username, rol: res.data.rol };
    localStorage.setItem('jwt', token.value as string);
  };

  const logout = () => {
    token.value = null;
    user.value = null;
    localStorage.removeItem('jwt');
  };

  const loadProfile = async () => {
    if (!token.value) return;
    try {
      const res = await http.get('/auth/me');
      user.value = res.data;
    } catch (e) {
      logout();
    }
  };

  const isAdmin = () => user.value?.rol === 'ADMIN';

  return { token, user, login, logout, loadProfile, isAdmin };
});
