<template>
  <div class="h-full flex flex-col">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold text-gray-900">Planning de la semaine</h1>
      
      <div class="flex items-center gap-2 bg-white px-3 py-2 rounded-xl shadow-sm border border-gray-200">
        <button @click="changeWeek(-1)" class="w-10 h-10 flex items-center justify-center hover:bg-gray-100 rounded-lg transition text-gray-600 font-bold text-lg">
          &lt;
        </button>
        
        <span class="font-black text-crmPrimary min-w-[140px] text-center capitalize text-lg">
          {{ monthYearString }}
        </span>
        
        <button @click="changeWeek(1)" class="w-10 h-10 flex items-center justify-center hover:bg-gray-100 rounded-lg transition text-gray-600 font-bold text-lg">
          &gt;
        </button>

        <div class="h-8 w-px bg-gray-200 mx-2"></div> <input 
          type="date" 
          @change="jumpToDate"
          title="Aller à une date spécifique"
          class="p-2 text-sm text-gray-600 bg-transparent border-2 border-transparent hover:border-gray-200 focus:border-crmPrimary focus:ring-0 rounded-lg cursor-pointer transition font-medium"
        />
      </div>
    </div>

    <div class="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
      
      <div v-if="isLoading" class="p-10 text-center text-crmPrimary font-bold animate-pulse">
        Chargement de l'agenda...
      </div>

      <div v-else class="grid grid-cols-5 lg:grid-cols-7 flex-1 divide-x divide-gray-200">
        
        <div v-for="day in weekDays" :key="day.date.toISOString()" class="flex flex-col h-full bg-gray-50/30">
          
          <div :class="isToday(day.date) ? 'bg-crmPrimary text-white' : 'bg-gray-100 text-gray-700'" class="p-3 text-center border-b border-gray-200">
            <p class="text-xs font-bold uppercase tracking-wider">{{ day.name }}</p>
            <p class="text-2xl font-black">{{ day.dayNumber }}</p>
          </div>

          <div class="flex-1 p-2 space-y-3 overflow-y-auto">
            <div v-for="booking in getBookingsForDate(day.date)" :key="booking._id" 
                 :class="getCardStyle(booking.status)"
                 class="p-3 rounded-lg border shadow-sm text-sm transition hover:shadow-md cursor-pointer relative overflow-hidden">
              
              <div :class="getStatusColor(booking.status)" class="absolute left-0 top-0 bottom-0 w-1.5"></div>

              <div class="font-black text-gray-900 mb-1">{{ formatTime(booking.date) }}</div>
              <div class="font-bold text-crmPrimary truncate">{{ booking.customer?.firstName }} {{ booking.customer?.lastName }}</div>
              <div class="text-xs text-gray-500 font-medium truncate mt-1">{{ booking.service?.name }}</div>
              <div class="text-xs text-gray-400 mt-2 flex justify-between">
                <span>{{ booking.totalDurationMinutes }} min</span>
                <span class="font-bold">{{ booking.totalPrice }} €</span>
              </div>
            </div>
            
            <div v-if="getBookingsForDate(day.date).length === 0" class="text-center text-xs text-gray-400 italic mt-4">
              Aucun RDV
            </div>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '../services/api'

// --- DONNÉES ---
const bookings = ref([])
const isLoading = ref(true)
const currentDate = ref(new Date()) // Date de référence pour la semaine affichée

// --- CHARGEMENT ---
const fetchBookings = async () => {
  isLoading.value = true
  try {
    const response = await api.get('/bookings')
    bookings.value = response.data.data
  } catch (error) {
    console.error(error)
  } finally {
    isLoading.value = false
  }
}

onMounted(fetchBookings)

// --- LOGIQUE DU CALENDRIER ---
const startOfWeek = computed(() => {
  const d = new Date(currentDate.value)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  return new Date(d.setDate(diff))
})

const weekDays = computed(() => {
  const days = []
  const jours = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']
  
  for (let i = 0; i < 7; i++) {
    const d = new Date(startOfWeek.value)
    d.setDate(d.getDate() + i)
    days.push({ date: d, name: jours[d.getDay()], dayNumber: d.getDate() })
  }
  return days
})

const monthYearString = computed(() => {
  return startOfWeek.value.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
})

// --- NOUVELLES FONCTIONS DE NAVIGATION ---
const changeWeek = (direction) => {
  const newDate = new Date(currentDate.value)
  newDate.setDate(newDate.getDate() + (direction * 7))
  currentDate.value = newDate
}

// C'est cette fonction qui s'active quand le gérant choisit une date dans le calendrier
const jumpToDate = (event) => {
  if (event.target.value) {
    // On met à jour la date courante avec la date sélectionnée
    // Le computed "startOfWeek" va automatiquement recalculer la semaine !
    currentDate.value = new Date(event.target.value)
  }
}

// --- FILTRES ---
const getBookingsForDate = (date) => {
  return bookings.value.filter(b => {
    const bDate = new Date(b.date)
    return bDate.getDate() === date.getDate() && bDate.getMonth() === date.getMonth() && bDate.getFullYear() === date.getFullYear()
  }).sort((a, b) => new Date(a.date) - new Date(b.date))
}

// --- UTILITAIRES ---
const isToday = (date) => {
  const today = new Date()
  return date.getDate() === today.getDate() && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear()
}

const formatTime = (dateStr) => new Date(dateStr).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }).replace(':', 'h')

const getCardStyle = (status) => {
  if (status === 'Cancelled') return 'bg-gray-100 opacity-60'
  return 'bg-white'
}

const getStatusColor = (status) => {
  const map = { 'Pending': 'bg-yellow-400', 'Confirmed': 'bg-green-400', 'InProgress': 'bg-blue-500', 'Completed': 'bg-gray-800', 'Cancelled': 'bg-red-500' }
  return map[status] || 'bg-gray-400'
}
</script>