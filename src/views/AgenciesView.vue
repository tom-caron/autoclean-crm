<template>
    <div class="h-full flex flex-col space-y-6">
        <div class="flex justify-between items-center">
            <div>
                <h1 class="text-3xl font-bold text-gray-900">Gestion des Agences</h1>
                <p class="text-gray-500 text-sm" v-if="isSuperAdmin">Gérez, créez ou supprimez les points de vente du
                    réseau.</p>
            </div>

            <div class="flex gap-3">
                <button v-if="isSuperAdmin" @click="openModal()"
                    class="bg-crmPrimary hover:bg-blue-600 text-white px-4 py-2 rounded-lg shadow-md font-bold transition flex items-center gap-2">
                    <span>➕</span> Ajouter une agence
                </button>
                <button @click="fetchAgencies"
                    class="bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg shadow-sm font-medium transition flex items-center gap-2">
                    <span>🔄</span> Actualiser
                </button>
            </div>
        </div>

        <div v-if="isLoading" class="text-center text-crmPrimary font-bold animate-pulse py-10">
            Chargement des agences...
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div v-for="agency in filteredAgencies" :key="agency._id"
                class="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col relative overflow-hidden">

                <div
                    class="absolute top-0 right-0 bg-blue-50 text-crmPrimary font-bold text-xs px-3 py-1 rounded-bl-lg">
                    Actif
                </div>

                <h2 class="text-xl font-black text-gray-900 mb-2">🏢 {{ agency.name }}</h2>

                <div class="space-y-2 mb-4 text-sm text-gray-600">
                    <p><strong>📍 Adresse :</strong> {{ agency.address?.street }}, {{ agency.address?.zipCode }} {{
                        agency.address?.city }}</p>
                    <p><strong>📞 Téléphone :</strong> {{ agency.phone || 'Non renseigné' }}</p>
                </div>

                <div class="mb-6 flex-1 bg-gray-50 rounded-lg p-3 border border-gray-100">
                    <p class="font-bold text-gray-800 text-xs uppercase tracking-wider mb-2">🕒 Horaires d'ouverture</p>
                    <ul class="text-sm space-y-1">
                        <li v-for="day in sortDaysForDisplay(agency.openingHours)" :key="day.dayOfWeek"
                            class="flex justify-between">
                            <span class="font-medium text-gray-600">{{ daysMap[day.dayOfWeek] }}</span>
                            <span v-if="day.isOpen" class="font-bold text-gray-900">{{ day.openTime }} - {{
                                day.closeTime }}</span>
                            <span v-else class="text-red-500 font-bold italic text-xs mt-0.5">Fermé</span>
                        </li>
                    </ul>
                </div>

                <div class="flex gap-2">
                    <button v-if="canEdit(agency._id)" @click="openModal(agency)"
                        :class="isSuperAdmin ? 'flex-1' : 'w-full'"
                        class="bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-2 rounded-lg transition border border-gray-300 text-sm">
                        ✏️ Modifier
                    </button>

                    <button v-if="isSuperAdmin" @click="deleteAgency(agency._id, agency.name)"
                        class="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 font-bold py-2 px-4 rounded-lg transition text-sm"
                        title="Supprimer l'agence">
                        🗑️
                    </button>
                </div>

                <div v-if="!canEdit(agency._id)"
                    class="text-center text-xs text-gray-400 italic border-t border-gray-100 pt-3">
                    Mode lecture seule
                </div>
            </div>
        </div>

        <div v-if="isModalOpen" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div class="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh] overflow-hidden">

                <div class="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center shrink-0">
                    <h3 class="font-bold text-lg text-gray-900">
                        {{ currentItem._id ? 'Modifier' : 'Créer une nouvelle' }} agence
                    </h3>
                    <button @click="closeModal"
                        class="text-gray-400 hover:text-gray-600 font-bold text-xl">&times;</button>
                </div>

                <div class="overflow-y-auto p-6">
                    <form @submit.prevent="saveAgency" id="agencyForm" class="space-y-6">
                        <div class="space-y-4">
                            <h4 class="font-bold text-crmPrimary border-b pb-1">Coordonnées</h4>
                            <div>
                                <label class="block text-sm font-bold text-gray-700 mb-1">Nom de l'agence</label>
                                <input v-model="currentItem.name" type="text" required
                                    class="w-full border-2 border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-crmPrimary focus:outline-none"
                                    placeholder="ex: AutoClean Paris 11" />
                            </div>
                            <div>
                                <label class="block text-sm font-bold text-gray-700 mb-1">Rue / Voie</label>
                                <input v-model="currentItem.address.street" type="text" required
                                    class="w-full border-2 border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-crmPrimary focus:outline-none" />
                            </div>
                            <div class="grid grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-sm font-bold text-gray-700 mb-1">Code Postal</label>
                                    <input v-model="currentItem.address.zipCode" type="text" required
                                        class="w-full border-2 border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-crmPrimary focus:outline-none" />
                                </div>
                                <div>
                                    <label class="block text-sm font-bold text-gray-700 mb-1">Ville</label>
                                    <input v-model="currentItem.address.city" type="text" required
                                        class="w-full border-2 border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-crmPrimary focus:outline-none" />
                                </div>
                                <div>
                                    <label class="block text-sm font-bold text-gray-700 mb-1">Téléphone</label>
                                    <input v-model="currentItem.phone" type="text" required
                                        class="w-full border-2 border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-crmPrimary focus:outline-none" />
                                </div>
                            </div>
                        </div>

                        <div class="space-y-3">
                            <h4 class="font-bold text-crmPrimary border-b pb-1 mt-6">Horaires d'ouverture</h4>
                            <div v-for="day in currentItem.openingHours" :key="day.dayOfWeek"
                                class="flex items-center gap-4 p-2 hover:bg-gray-50 rounded-lg">
                                <div class="w-24 font-bold text-sm text-gray-700">{{ daysMap[day.dayOfWeek] }}</div>
                                <label class="flex items-center cursor-pointer min-w-[80px]">
                                    <input type="checkbox" v-model="day.isOpen"
                                        class="form-checkbox h-4 w-4 text-crmPrimary rounded border-gray-300">
                                    <span class="ml-2 text-sm font-medium"
                                        :class="day.isOpen ? 'text-gray-700' : 'text-red-500'">{{ day.isOpen ? 'Ouvert'
                                            : 'Fermé' }}</span>
                                </label>
                                <div v-if="day.isOpen" class="flex items-center gap-2">
                                    <input type="time" v-model="day.openTime" required
                                        class="border-2 border-gray-200 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-crmPrimary focus:outline-none">
                                    <span class="text-gray-400 font-bold">à</span>
                                    <input type="time" v-model="day.closeTime" required
                                        class="border-2 border-gray-200 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-crmPrimary focus:outline-none">
                                </div>
                            </div>
                        </div>
                    </form>
                </div>

                <div class="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 shrink-0">
                    <button type="button" @click="closeModal"
                        class="px-4 py-2 text-gray-600 font-medium hover:bg-gray-200 rounded-lg transition">Annuler</button>
                    <button type="submit" form="agencyForm" :disabled="isSaving"
                        class="bg-crmPrimary hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-bold shadow-sm transition disabled:opacity-50">
                        {{ isSaving ? 'Traitement...' : (currentItem._id ? 'Enregistrer les modifications' : 'Créer l\'agence') }}
                    </button>
                </div>

            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '../stores/authStore'
import api from '../services/api'

// ... (Variables réactives et computed identiques) ...
const authStore = useAuthStore()
const agencies = ref([])
const isLoading = ref(true)
const isModalOpen = ref(false)
const isSaving = ref(false)
const currentItem = ref({})
const daysMap = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']

const roleName = computed(() => typeof authStore.user?.role === 'object' ? authStore.user.role.name : authStore.user?.role)
const isSuperAdmin = computed(() => roleName.value === 'SuperAdmin')
const isManager = computed(() => roleName.value === 'Manager')
const userAgencyId = computed(() => typeof authStore.user?.agency === 'object' ? authStore.user.agency._id : authStore.user?.agency)

const filteredAgencies = computed(() => {
    if (isSuperAdmin.value) return agencies.value
    return agencies.value.filter(a => a._id === userAgencyId.value)
})

const canEdit = (agencyId) => {
    if (isSuperAdmin.value) return true
    if (isManager.value && agencyId === userAgencyId.value) return true
    return false
}

const sortDaysForDisplay = (hours) => {
    if (!hours) return []
    return [...hours].sort((a, b) => {
        const dayA = a.dayOfWeek === 0 ? 7 : a.dayOfWeek
        const dayB = b.dayOfWeek === 0 ? 7 : b.dayOfWeek
        return dayA - dayB
    })
}

const fetchAgencies = async () => {
    isLoading.value = true
    try {
        const response = await api.get('/agencies')
        agencies.value = response.data.data || response.data
    } catch (error) { console.error(error) }
    finally { isLoading.value = false }
}

onMounted(fetchAgencies)

// --- NOUVELLE FONCTION : SUPPRESSION ---
const deleteAgency = async (id, name) => {
    const confirmFirst = confirm(`🚨 Êtes-vous sûr de vouloir supprimer l'agence "${name}" ?`)
    if (!confirmFirst) return

    const confirmSecond = confirm(`⚠️ Attention : Cette action est irréversible. Toutes les données liées à cette agence seront impactées. Confirmer la suppression ?`)
    if (!confirmSecond) return

    try {
        await api.delete(`/agencies/${id}`)
        await fetchAgencies() // On rafraîchit la grille
    } catch (error) {
        console.error(error)
        alert(error.response?.data?.message || "Erreur lors de la suppression. Vérifiez que l'agence n'est plus liée à des employés ou des réservations.")
    }
}

// --- AUTRES FONCTIONS (openModal, saveAgency...) ---
const openModal = (agency = null) => {
    if (agency) {
        const address = agency.address ? { ...agency.address } : { street: '', city: '', zipCode: '' }
        let hours = agency.openingHours && agency.openingHours.length > 0
            ? JSON.parse(JSON.stringify(agency.openingHours))
            : createDefaultHours()
        currentItem.value = { ...agency, address, openingHours: sortDaysForDisplay(hours) }
    } else {
        currentItem.value = {
            name: '', phone: '',
            address: { street: '', city: '', zipCode: '' },
            openingHours: sortDaysForDisplay(createDefaultHours())
        }
    }
    isModalOpen.value = true
}

const createDefaultHours = () => {
    return Array.from({ length: 7 }, (_, i) => ({
        dayOfWeek: i, isOpen: i !== 0, openTime: '08:00', closeTime: '18:00'
    }))
}

const closeModal = () => {
    isModalOpen.value = false
    currentItem.value = {}
}

const saveAgency = async () => {
    isSaving.value = true
    try {
        const payload = {
            name: currentItem.value.name,
            phone: currentItem.value.phone,
            address: {
                street: currentItem.value.address.street,
                zipCode: currentItem.value.address.zipCode,
                city: currentItem.value.address.city
            },
            openingHours: currentItem.value.openingHours.map(day => ({
                dayOfWeek: day.dayOfWeek, isOpen: day.isOpen, openTime: day.openTime, closeTime: day.closeTime
            }))
        }

        if (currentItem.value._id) {
            await api.put(`/agencies/${currentItem.value._id}`, payload)
        } else {
            await api.post('/agencies', payload)
        }
        await fetchAgencies()
        closeModal()
    } catch (error) {
        alert(error.response?.data?.message || "Erreur de sauvegarde.")
    } finally { isSaving.value = false }
}
</script>