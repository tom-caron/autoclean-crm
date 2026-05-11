<template>
  <div class="flex h-screen bg-gray-100 font-sans">

    <aside class="hidden md:flex flex-col w-64 bg-crmDark text-white shadow-xl">
      <div class="flex items-center justify-center h-20 border-b border-gray-800">
        <h1 class="text-2xl font-black tracking-wider text-crmPrimary">💧 CRM Pro</h1>
      </div>
      <div class="flex-1 py-6 px-3 space-y-2">
        <router-link to="/" class="flex items-center px-4 py-3 rounded-lg hover:bg-crmHover transition"
          active-class="bg-crmPrimary font-bold shadow-lg">
          <span class="mr-3">📊</span> Tableau de bord
        </router-link>

        <router-link to="/planning" class="flex items-center px-4 py-3 rounded-lg hover:bg-crmHover transition"
          active-class="bg-crmPrimary font-bold shadow-lg">
          <span class="mr-3">📅</span> Agenda
        </router-link>

        <router-link to="/reservations" class="flex items-center px-4 py-3 rounded-lg hover:bg-crmHover transition"
          active-class="bg-crmPrimary font-bold shadow-lg">
          <span class="mr-3">📋</span> Liste des réservations
        </router-link>

        <router-link to="/catalog" class="flex items-center px-4 py-3 rounded-lg hover:bg-crmHover transition"
          active-class="bg-crmPrimary font-bold shadow-lg">
          <span class="mr-3">⚙️</span> Catalogue & Prix
        </router-link>

        <router-link to="/agencies" class="flex items-center px-4 py-3 rounded-lg hover:bg-crmHover transition"
          active-class="bg-crmPrimary font-bold shadow-lg">
          <span class="mr-3">🏢</span> Infos de l'Agence
        </router-link>
      </div>
    </aside>

    <div class="flex-1 flex flex-col overflow-hidden">
      <header class="h-20 bg-white border-b border-gray-200 flex items-center justify-between px-6 shadow-sm">

        <h2 class="text-lg font-medium text-gray-800">
          Espace <span class="font-bold text-crmPrimary">{{ roleName }}</span>
        </h2>

        <div class="flex items-center gap-6">
          <div class="text-right hidden sm:block">
            <p class="text-sm font-bold text-gray-900">{{ authStore.user?.firstName }} {{ authStore.user?.lastName }}
            </p>
            <p class="text-xs text-gray-500">{{ authStore.user?.email }}</p>
          </div>

          <button @click="handleLogout"
            class="text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 px-4 py-2 rounded-lg transition">
            Déconnexion
          </button>
        </div>

      </header>

      <main class="flex-1 overflow-x-hidden overflow-y-auto p-6">
        <slot></slot>
      </main>
    </div>

  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'

const router = useRouter()
const authStore = useAuthStore()

// Un petit "computed" pour afficher le nom du rôle proprement
const roleName = computed(() => {
  if (!authStore.user) return ''
  const role = typeof authStore.user.role === 'object' ? authStore.user.role.name : authStore.user.role
  const map = { 'SuperAdmin': 'Administrateur', 'Manager': 'Gérant', 'Employee': 'Employé' }
  return map[role] || role
})

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}

const isSuperAdmin = computed(() => {
  if (!authStore.user) return false
  const role = typeof authStore.user.role === 'object' ? authStore.user.role.name : authStore.user.role
  return role === 'SuperAdmin'
})
</script>