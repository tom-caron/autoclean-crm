<template>
  <div class="h-full flex flex-col space-y-6">
    
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">Bonjour, {{ authStore.user?.firstName }} 👋</h1>
        <p class="text-gray-500 mt-1">Voici le résumé de l'activité pour votre agence.</p>
      </div>
      <button @click="fetchBookings" class="bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg shadow-sm font-medium transition flex items-center gap-2">
        <span>🔄</span> Actualiser
      </button>
    </div>

    <div v-if="isLoading" class="flex-1 flex justify-center items-center">
      <div class="animate-pulse text-crmPrimary font-bold text-xl">Calcul des statistiques...</div>
    </div>

    <template v-else>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p class="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">CA du mois</p>
            <p class="text-3xl font-black text-gray-900">{{ monthlyRevenue }} €</p>
          </div>
          <div class="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center text-2xl">
            📈
          </div>
        </div>

        <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p class="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">CA du jour</p>
            <p class="text-3xl font-black text-crmPrimary">{{ todayRevenue }} €</p>
          </div>
          <div class="w-12 h-12 bg-green-50 text-green-600 rounded-full flex items-center justify-center text-2xl">
            💶
          </div>
        </div>

        <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p class="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">RDV Aujourd'hui</p>
            <p class="text-3xl font-black text-gray-900">{{ todayBookings.length }}</p>
          </div>
          <div class="w-12 h-12 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center text-2xl">
            🚗
          </div>
        </div>

        <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p class="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">En attente / En cours</p>
            <p class="text-3xl font-black text-orange-500">{{ pendingOrInProgressCount }}</p>
          </div>
          <div class="w-12 h-12 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center text-2xl">
            ⏳
          </div>
        </div>

      </div>

      <div class="bg-white rounded-2xl shadow-sm border border-gray-200 flex-1 flex flex-col overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
          <h2 class="text-lg font-bold text-gray-900">Arrivées prévues aujourd'hui</h2>
          <router-link to="/reservations" class="text-sm font-bold text-crmPrimary hover:underline">Voir tout le planning &rarr;</router-link>
        </div>
        
        <div v-if="todayBookings.length === 0" class="p-10 text-center text-gray-500 flex-1">
          <p class="text-3xl mb-2">🌴</p>
          <p>Aucun rendez-vous prévu pour aujourd'hui.</p>
        </div>

        <div v-else class="overflow-y-auto flex-1 p-6 space-y-4">
          <div v-for="booking in todayBookings" :key="booking._id" 
               class="flex items-center justify-between p-4 rounded-xl border border-gray-100 bg-gray-50 hover:bg-blue-50/50 transition">
            
            <div class="flex items-center gap-6">
              <div class="text-center">
                <p class="text-2xl font-black text-crmPrimary">{{ formatTime(booking.date) }}</p>
                <p class="text-xs font-bold text-gray-500 uppercase">{{ booking.totalDurationMinutes }} min</p>
              </div>
              
              <div class="h-10 w-px bg-gray-200"></div>

              <div>
                <p class="font-bold text-gray-900 text-lg">{{ booking.customer?.firstName }} {{ booking.customer?.lastName }}</p>
                <p class="text-sm text-gray-500 font-medium">{{ booking.service?.name }} <span v-if="booking.options?.length"> (+ options)</span></p>
              </div>
            </div>

            <div class="flex items-center gap-4">
              <p class="font-black text-gray-900 text-lg">{{ booking.totalPrice }} €</p>
              <span :class="getStatusBadge(booking.status)" class="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                {{ formatStatus(booking.status) }}
              </span>
            </div>

          </div>
        </div>
      </div>

    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '../stores/authStore'
import api from '../services/api'

const authStore = useAuthStore()
const bookings = ref([])
const isLoading = ref(true)

// --- RÉCUPÉRATION DES DONNÉES ---
const fetchBookings = async () => {
  isLoading.value = true
  try {
    const response = await api.get('/bookings')
    // On garde uniquement les rendez-vous non annulés pour les stats financières
    bookings.value = response.data.data
  } catch (error) {
    console.error("Erreur de récupération :", error)
  } finally {
    isLoading.value = false
  }
}

onMounted(fetchBookings)

// --- FONCTIONS UTILITAIRES DE DATE ---
const isToday = (dateObj) => {
  const today = new Date()
  return dateObj.getDate() === today.getDate() && 
         dateObj.getMonth() === today.getMonth() && 
         dateObj.getFullYear() === today.getFullYear()
}

const isThisMonth = (dateObj) => {
  const today = new Date()
  return dateObj.getMonth() === today.getMonth() && 
         dateObj.getFullYear() === today.getFullYear()
}

// --- CALCUL DES STATISTIQUES (Computed) ---

// 1. Liste des réservations d'aujourd'hui, triées par heure
const todayBookings = computed(() => {
  return bookings.value
    .filter(b => isToday(new Date(b.date)))
    .sort((a, b) => new Date(a.date) - new Date(b.date))
})

// 2. Chiffre d'affaires du jour (on exclut les annulés)
const todayRevenue = computed(() => {
  return todayBookings.value
    .filter(b => b.status !== 'Cancelled')
    .reduce((sum, b) => sum + b.totalPrice, 0)
})

// 3. Chiffre d'affaires du mois en cours
const monthlyRevenue = computed(() => {
  return bookings.value
    .filter(b => isThisMonth(new Date(b.date)) && b.status !== 'Cancelled')
    .reduce((sum, b) => sum + b.totalPrice, 0)
})

// 4. Compteur des tâches urgentes ("En attente" ou "En cours" sur tout le planning)
const pendingOrInProgressCount = computed(() => {
  return bookings.value.filter(b => b.status === 'Pending' || b.status === 'InProgress').length
})

// --- FORMATTAGE VISUEL ---
const formatTime = (dateStr) => new Date(dateStr).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }).replace(':', 'h')

const formatStatus = (status) => {
  const map = { 'Pending': 'En attente', 'Confirmed': 'Confirmé', 'InProgress': 'En cours', 'Completed': 'Terminé', 'Cancelled': 'Annulé' }
  return map[status] || status
}

const getStatusBadge = (status) => {
  const map = {
    'Pending': 'bg-yellow-100 text-yellow-700',
    'Confirmed': 'bg-green-100 text-green-700',
    'InProgress': 'bg-blue-100 text-crmPrimary',
    'Completed': 'bg-gray-200 text-gray-700',
    'Cancelled': 'bg-red-100 text-red-700 line-through'
  }
  return map[status] || 'bg-gray-100 text-gray-600'
}
</script>