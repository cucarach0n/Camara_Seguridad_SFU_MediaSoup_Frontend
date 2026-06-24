import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth.store';

const routes = [
  { path: '/login', component: () => import('../views/LoginView.vue') },
  { path: '/', component: () => import('../views/DashboardView.vue'), meta: { requiresAuth: true } },
  { path: '/grabaciones', component: () => import('../views/GrabacionesView.vue'), meta: { requiresAuth: true } },
  { path: '/admin', component: () => import('../views/AdminView.vue'), meta: { requiresAuth: true, requiresAdmin: true } },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to, from, next) => {
  const auth = useAuthStore();
  
  if (auth.token && !auth.user) {
    await auth.loadProfile();
  }

  if (to.meta.requiresAuth && !auth.token) {
    next('/login');
  } else if (to.meta.requiresAdmin && !auth.isAdmin()) {
    next('/');
  } else if (to.path === '/login' && auth.token) {
    next('/');
  } else {
    next();
  }
});

export default router;
