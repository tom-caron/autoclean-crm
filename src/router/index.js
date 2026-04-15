import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/authStore' // ➔ On importe le store
import DashboardView from '../views/DashboardView.vue'
import LoginStaffView from '../views/LoginStaffView.vue'
import ReservationsView from '../views/ReservationsView.vue'
import PlanningView from '../views/PlanningView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'dashboard', component: DashboardView },
    { path: '/reservations', name: 'reservations', component: ReservationsView },
    { path: '/planning', name: 'planning', component: PlanningView },
    { path: '/login', name: 'login', component: LoginStaffView }
  ]
})

// NOUVEAU : Le Gardien qui s'exécute avant chaque changement de page
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  // Si l'utilisateur a un jeton mais qu'on a perdu ses infos (ex: F5 de la page)
  if (authStore.token && !authStore.user) {
    await authStore.fetchProfile()
  }

  // Si la page visée n'est PAS le login ET que l'utilisateur n'est pas connecté ➔ Dehors !
  if (to.name !== 'login' && !authStore.isAuthenticated) {
    next({ name: 'login' })
  } 
  // S'il va sur le login alors qu'il est déjà connecté ➔ On le renvoie à l'accueil !
  else if (to.name === 'login' && authStore.isAuthenticated) {
    next({ name: 'dashboard' })
  } 
  // Sinon, c'est bon, on le laisse passer
  else {
    next()
  }
})

export default router