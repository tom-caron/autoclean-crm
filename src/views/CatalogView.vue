<template>
    <div class="h-full flex flex-col space-y-6">
        <div class="flex justify-between items-center">
            <h1 class="text-3xl font-bold text-gray-900">Gestion du Catalogue</h1>
            <button @click="fetchData"
                class="bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg shadow-sm font-medium transition flex items-center gap-2">
                <span>🔄</span> Actualiser
            </button>
        </div>

        <div v-if="isLoading" class="text-center text-crmPrimary font-bold animate-pulse py-10">
            Chargement du catalogue...
        </div>

        <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-8">

            <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
                <div class="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                    <h2 class="text-lg font-bold text-gray-900">🧼 Prestations (Services)</h2>
                    <button v-if="isSuperAdmin" @click="openModal('service')"
                        class="bg-crmPrimary hover:bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm font-bold shadow-sm transition">
                        + Ajouter
                    </button>
                </div>
                <div class="p-4 flex-1 overflow-y-auto">
                    <ul class="space-y-3">
                        <li v-for="item in services" :key="item._id"
                            class="flex justify-between items-center p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition">
                            <div>
                                <p class="font-bold text-gray-800">{{ item.name }}</p>
                                <p class="text-xs text-gray-500">{{ item.durationMinutes }} min • <span
                                        class="font-bold text-gray-700">{{ item.price }} €</span></p>
                            </div>
                            <div v-if="isSuperAdmin" class="flex gap-2">
                                <button @click="openModal('service', item)"
                                    class="text-blue-500 hover:text-blue-700 p-1">✏️</button>
                                <button @click="deleteItem('service', item._id)"
                                    class="text-red-500 hover:text-red-700 p-1">🗑️</button>
                            </div>
                        </li>
                    </ul>
                </div>
            </div>

            <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
                <div class="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                    <h2 class="text-lg font-bold text-gray-900">✨ Options supplémentaires</h2>
                    <button v-if="isSuperAdmin" @click="openModal('option')"
                        class="bg-crmPrimary hover:bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm font-bold shadow-sm transition">
                        + Ajouter
                    </button>
                </div>
                <div class="p-4 flex-1 overflow-y-auto">
                    <ul class="space-y-3">
                        <li v-for="item in options" :key="item._id"
                            class="flex justify-between items-center p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition">
                            <div>
                                <p class="font-bold text-gray-800">{{ item.name }}</p>
                                <p class="text-xs text-gray-500">{{ item.durationMinutes }} min • <span
                                        class="font-bold text-gray-700">{{ item.price }} €</span></p>
                            </div>
                            <div v-if="isSuperAdmin" class="flex gap-2">
                                <button @click="openModal('option', item)"
                                    class="text-blue-500 hover:text-blue-700 p-1">✏️</button>
                                <button @click="deleteItem('options', item._id)"
                                    class="text-red-500 hover:text-red-700 p-1">🗑️</button>
                            </div>
                        </li>
                    </ul>
                </div>
            </div>

        </div>

        <div v-if="isModalOpen" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in">
                <div class="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                    <h3 class="font-bold text-lg text-gray-900">
                        {{ currentItem._id ? 'Modifier' : 'Ajouter' }} {{ modalType === 'service' ? 'une prestation' :
                            'une option' }}
                    </h3>
                    <button @click="closeModal"
                        class="text-gray-400 hover:text-gray-600 font-bold text-xl">&times;</button>
                </div>

                <form @submit.prevent="saveItem" class="p-6 space-y-4">
                    <div>
                        <label class="block text-sm font-bold text-gray-700 mb-1">Nom</label>
                        <input v-model="currentItem.name" type="text" required
                            class="w-full border-2 border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-crmPrimary focus:outline-none" />
                    </div>
                    <div>
                        <label class="block text-sm font-bold text-gray-700 mb-1">Description</label>
                        <textarea v-model="currentItem.description" rows="2"
                            class="w-full border-2 border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-crmPrimary focus:outline-none"></textarea>
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-bold text-gray-700 mb-1">Prix (€)</label>
                            <input v-model.number="currentItem.price" type="number" step="0.01" required
                                class="w-full border-2 border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-crmPrimary focus:outline-none" />
                        </div>
                        <div>
                            <label class="block text-sm font-bold text-gray-700 mb-1">Durée (min)</label>
                            <input v-model.number="currentItem.durationMinutes" type="number" required
                                class="w-full border-2 border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-crmPrimary focus:outline-none" />
                        </div>
                    </div>

                    <div class="pt-4 flex justify-end gap-3 border-t border-gray-100">
                        <button type="button" @click="closeModal"
                            class="px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition">Annuler</button>
                        <button type="submit" :disabled="isSaving"
                            class="bg-crmPrimary hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-bold shadow-sm transition disabled:opacity-50">
                            {{ isSaving ? 'Sauvegarde...' : 'Enregistrer' }}
                        </button>
                    </div>
                </form>
            </div>
        </div>

    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '../stores/authStore'
import api from '../services/api'

const authStore = useAuthStore()
const services = ref([])
const options = ref([])
const isLoading = ref(true)

// Gestion de la modale
const isModalOpen = ref(false)
const isSaving = ref(false)
const modalType = ref('service')
const currentItem = ref({})

const isSuperAdmin = computed(() => {
    if (!authStore.user) return false
    const role = typeof authStore.user.role === 'object' ? authStore.user.role.name : authStore.user.role
    return role === 'SuperAdmin'
})

const fetchData = async () => {
    isLoading.value = true
    try {
        // ➔ AJUSTEMENT : On utilise /prestations ici
        const [resServices, resOptions] = await Promise.all([
            api.get('/prestations'),
            api.get('/options')
        ])
        services.value = resServices.data.data
        options.value = resOptions.data.data
    } catch (error) {
        console.error("Erreur de récupération :", error)
    } finally {
        isLoading.value = false
    }
}

onMounted(fetchData)

// --- ACTIONS MODALE ---
const openModal = (type, item = null) => {
    modalType.value = type
    currentItem.value = item ? { ...item } : { name: '', description: '', price: 0, durationMinutes: 30 }
    isModalOpen.value = true
}

const closeModal = () => {
    isModalOpen.value = false
    currentItem.value = {}
}

const saveItem = async () => {
    isSaving.value = true
    const endpoint = modalType.value === 'service' ? '/prestations' : '/options'

    try {
        // ➔ NOUVEAU : On crée un objet "propre" avec uniquement les champs autorisés
        const payload = {
            name: currentItem.value.name,
            description: currentItem.value.description,
            price: currentItem.value.price,
            durationMinutes: currentItem.value.durationMinutes
        }

        if (currentItem.value._id) {
            // Modification (PUT) : On envoie l'objet nettoyé
            await api.put(`${endpoint}/${currentItem.value._id}`, payload)
        } else {
            // Création (POST) : On envoie l'objet nettoyé
            await api.post(endpoint, payload)
        }

        await fetchData()
        closeModal()
    } catch (error) {
        console.error(error)
        alert(error.response?.data?.message || "Une erreur est survenue.")
    } finally {
        isSaving.value = false
    }
}

const deleteItem = async (type, id) => {
    if (!confirm("Attention, êtes-vous sûr de vouloir supprimer cet élément ?")) return

    // On s'assure que le 'type' correspond bien aux endpoints de ton API
    // Si type est 'service', on va sur /prestations. Sinon on va sur /options.
    const endpoint = type === 'service' ? '/prestations' : '/options'

    console.log(`Tentative de suppression sur : ${endpoint}/${id}`); // Pour débugger dans la console

    try {
        await api.delete(`${endpoint}/${id}`)
        await fetchData() // On rafraîchit la liste après suppression
    } catch (error) {
        console.error("Erreur suppression :", error)
        alert(error.response?.data?.message || "Impossible de supprimer cet élément.")
    }
}
</script>

<style scoped>
.animate-fade-in {
    animation: fadeIn 0.2s ease-out;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: scale(0.95);
    }

    to {
        opacity: 1;
        transform: scale(1);
    }
}
</style>