<template>
  <div class="min-h-screen bg-crmDark flex items-center justify-center p-4">
    <div class="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
      
      <div class="text-center mb-8">
        <h1 class="text-3xl font-black text-crmPrimary mb-2">💧 CRM Pro</h1>
        <p class="text-gray-500 font-medium">Accès réservé au personnel</p>
      </div>

      <div v-if="errorMessage" class="mb-6 bg-red-50 text-red-600 p-4 rounded-lg text-sm text-center border border-red-200 font-bold">
        {{ errorMessage }}
      </div>

      <form @submit.prevent="handleLogin" class="space-y-6">
        <div>
          <label class="block text-sm font-bold text-gray-700 mb-1">Email professionnel</label>
          <input v-model="form.email" type="email" required class="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-crmPrimary focus:border-transparent transition" placeholder="admin@autoclean.fr" />
        </div>

        <div>
          <label class="block text-sm font-bold text-gray-700 mb-1">Mot de passe</label>
          <input v-model="form.password" type="password" required class="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-crmPrimary focus:border-transparent transition" placeholder="••••••••" />
        </div>

        <button type="submit" :disabled="isLoading" class="w-full bg-crmPrimary hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-lg transition duration-200 shadow-md disabled:opacity-50">
          <span v-if="isLoading">Connexion en cours...</span>
          <span v-else>Accéder au portail</span>
        </button>
      </form>
      
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'

const router = useRouter()
const authStore = useAuthStore()

const isLoading = ref(false)
const errorMessage = ref('')

const form = reactive({
  email: '',
  password: ''
})

const handleLogin = async () => {
  isLoading.value = true
  errorMessage.value = ''
  
  try {
    await authStore.login(form.email, form.password)
    // Si la connexion réussit (et que ce n'est pas un client), on l'envoie sur le Dashboard !
    router.push('/')
  } catch (error) {
    console.error(error)
    // On affiche notre erreur personnalisée, ou celle de l'API
    errorMessage.value = error.message || error.response?.data?.message || "Erreur de connexion."
  } finally {
    isLoading.value = false
  }
}
</script>