<template>
  <div class="h-full flex flex-col">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold text-gray-900">Liste des Réservations</h1>
      <button @click="fetchBookings" class="bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg shadow-sm font-medium transition flex items-center gap-2">
        <span>🔄</span> Rafraîchir
      </button>
    </div>

    <div class="bg-white p-5 rounded-xl shadow-sm border border-gray-200 mb-6 flex flex-wrap justify-between items-end gap-6">
      
      <div class="flex flex-wrap items-end gap-6">
        <div>
          <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Filtrer par statut</label>
          <select v-model="filterStatus" class="border-2 border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-crmPrimary focus:border-transparent cursor-pointer font-medium text-gray-700 min-w-[180px]">
            <option value="">Tous les statuts</option>
            <option value="Pending">En attente</option>
            <option value="Confirmed">Confirmé</option>
            <option value="InProgress">En cours</option>
            <option value="Completed">Terminé</option>
            <option value="Cancelled">Annulé</option>
          </select>
        </div>
        
        <div>
          <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Filtrer par date</label>
          <input type="date" v-model="filterDate" class="border-2 border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-crmPrimary focus:border-transparent cursor-pointer font-medium text-gray-700" />
        </div>

        <div v-if="filterStatus || filterDate">
          <button @click="resetFilters" class="text-sm font-bold text-red-500 hover:text-red-700 hover:bg-red-50 px-4 py-2 rounded-lg transition">
            ✖ Effacer
          </button>
        </div>
      </div>

      <div>
        <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 text-right">Résultats par page</label>
        <select v-model="itemsPerPage" class="border-2 border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-crmPrimary focus:border-transparent cursor-pointer font-medium text-gray-700 bg-gray-50">
          <option :value="5">5</option>
          <option :value="10">10</option>
          <option :value="20">20</option>
          <option :value="50">50</option>
        </select>
      </div>

    </div>

    <div class="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col flex-1 overflow-hidden">
      
      <div v-if="isLoading" class="p-10 text-center text-crmPrimary font-bold animate-pulse">
        Chargement de la liste...
      </div>

      <div v-else-if="filteredBookings.length === 0" class="p-10 text-center text-gray-500 bg-gray-50 flex-1 flex flex-col justify-center items-center">
        <p class="text-2xl mb-2">🔍</p>
        <p>Aucune réservation ne correspond à votre recherche.</p>
      </div>

      <div v-else class="overflow-x-auto flex-1">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-200">
              <th class="p-4 font-bold">Date & Heure</th>
              <th class="p-4 font-bold">Client</th>
              <th class="p-4 font-bold">Prestation & Options</th>
              <th class="p-4 font-bold text-right">Durée / Prix</th>
              <th class="p-4 font-bold text-center">Statut</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100 text-sm">
            <tr v-for="booking in paginatedBookings" :key="booking._id" class="hover:bg-blue-50/50 transition">
              
              <td class="p-4">
                <p class="font-black text-gray-900">{{ formatDate(booking.date) }}</p>
                <p class="text-crmPrimary font-bold">{{ formatTime(booking.date) }}</p>
              </td>

              <td class="p-4">
                <p class="font-bold text-gray-800">{{ booking.customer?.firstName }} {{ booking.customer?.lastName }}</p>
                <p class="text-gray-500 text-xs">{{ booking.customer?.phone || 'Pas de tel' }}</p>
              </td>

              <td class="p-4">
                <p class="font-bold text-gray-800">{{ booking.service?.name }}</p>
                <p class="text-xs text-gray-500 truncate max-w-xs">
                  {{ booking.options?.map(opt => opt.name).join(', ') || 'Aucune option' }}
                </p>
              </td>

              <td class="p-4 text-right">
                <p class="font-bold text-gray-900">{{ booking.totalPrice }} €</p>
                <p class="text-xs text-gray-500">{{ booking.totalDurationMinutes }} min</p>
              </td>

              <td class="p-4 text-center">
                <select 
                  v-model="booking.status" 
                  @change="updateStatus(booking._id, booking.status)"
                  :class="getStatusColor(booking.status)"
                  class="text-xs font-bold uppercase tracking-wider px-3 py-2 rounded-lg border-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-crmPrimary transition-colors text-center appearance-none w-36">
                  <option value="Pending" class="bg-white text-gray-900">En attente</option>
                  <option value="Confirmed" class="bg-white text-gray-900">Confirmé</option>
                  <option value="InProgress" class="bg-white text-gray-900">En cours</option>
                  <option value="Completed" class="bg-white text-gray-900">Terminé</option>
                  <option value="Cancelled" class="bg-white text-gray-900">Annulé</option>
                </select>
              </td>

            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="filteredBookings.length > 0" class="bg-gray-50 border-t border-gray-200 px-6 py-4 flex items-center justify-between">
        <p class="text-sm text-gray-600">
          Affichage de <span class="font-bold text-gray-900">{{ startIndex + 1 }}</span> à 
          <span class="font-bold text-gray-900">{{ Math.min(endIndex, filteredBookings.length) }}</span> 
          sur <span class="font-bold text-gray-900">{{ filteredBookings.length }}</span> résultats
        </p>
        
        <div class="flex items-center gap-2">
          <button 
            @click="prevPage" 
            :disabled="currentPage === 1"
            class="px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition">
            Précédent
          </button>
          
          <div class="text-sm font-bold text-gray-700 px-4">
            Page {{ currentPage }} sur {{ totalPages }}
          </div>

          <button 
            @click="nextPage" 
            :disabled="currentPage === totalPages"
            class="px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition">
            Suivant
          </button>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
// ➔ On importe "watch" en plus !
import { ref, computed, watch, onMounted } from 'vue'
import api from '../services/api'

const bookings = ref([])
const isLoading = ref(true)

// Variables des filtres
const filterStatus = ref('')
const filterDate = ref('')

// --- VARIABLES POUR LA PAGINATION ---
const currentPage = ref(1)
const itemsPerPage = ref(10) // Nombre de réservations affichées par page

const fetchBookings = async () => {
  isLoading.value = true
  try {
    const response = await api.get('/bookings')
    bookings.value = response.data.data.sort((a, b) => new Date(b.date) - new Date(a.date))
  } catch (error) {
    console.error(error)
  } finally {
    isLoading.value = false
  }
}

// 1. On filtre les réservations
const filteredBookings = computed(() => {
  return bookings.value.filter(booking => {
    if (filterStatus.value && booking.status !== filterStatus.value) return false
    if (filterDate.value) {
      const bDateObj = new Date(booking.date)
      const localDateString = `${bDateObj.getFullYear()}-${String(bDateObj.getMonth() + 1).padStart(2, '0')}-${String(bDateObj.getDate()).padStart(2, '0')}`
      if (localDateString !== filterDate.value) return false
    }
    return true
  })
})

// 2. On calcule les éléments de la pagination
const totalPages = computed(() => Math.ceil(filteredBookings.value.length / itemsPerPage.value) || 1)
const startIndex = computed(() => (currentPage.value - 1) * itemsPerPage.value)
const endIndex = computed(() => startIndex.value + itemsPerPage.value)

// 3. On crée la tranche de résultats pour la page actuelle
const paginatedBookings = computed(() => {
  return filteredBookings.value.slice(startIndex.value, endIndex.value)
})

// 4. Si l'utilisateur change un filtre, on le renvoie à la page 1 automatiquement !
watch([filterStatus, filterDate, itemsPerPage], () => {
  currentPage.value = 1
})

// Fonctions de navigation
const prevPage = () => { if (currentPage.value > 1) currentPage.value-- }
const nextPage = () => { if (currentPage.value < totalPages.value) currentPage.value++ }

const resetFilters = () => {
  filterStatus.value = ''
  filterDate.value = ''
  currentPage.value = 1
}

const updateStatus = async (bookingId, newStatus) => {
  try {
    await api.put(`/bookings/${bookingId}`, { status: newStatus })
  } catch (error) {
    alert("Erreur lors du changement de statut.")
    await fetchBookings()
  }
}

onMounted(fetchBookings)

// Utilitaires visuels
const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
const formatTime = (dateStr) => new Date(dateStr).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }).replace(':', 'h')
const getStatusColor = (status) => {
  const map = {
    'Pending': 'bg-yellow-50 text-yellow-700 border-yellow-200',
    'Confirmed': 'bg-green-50 text-green-700 border-green-200',
    'InProgress': 'bg-blue-50 text-crmPrimary border-blue-200',
    'Completed': 'bg-gray-50 text-gray-700 border-gray-200',
    'Cancelled': 'bg-red-50 text-red-700 border-red-200 line-through'
  }
  return map[status] || 'bg-gray-50 text-gray-600 border-gray-200'
}
</script>