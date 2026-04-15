import { defineStore } from 'pinia'
import api from '../services/api'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('crm_token') || null,
    user: null,
  }),
  
  getters: {
    isAuthenticated: (state) => !!state.token,
    // Permet de vérifier facilement si c'est un membre du staff
    isStaff: (state) => {
      if (!state.user) return false
      const roleName = typeof state.user.role === 'object' ? state.user.role.name : state.user.role
      return ['SuperAdmin', 'Manager', 'Employee'].includes(roleName)
    }
  },
  
  actions: {
    async login(email, password) {
      const response = await api.post('/auth/login', { email, password })
      const user = response.data.user

      // 🚨 SÉCURITÉ : On vérifie le rôle AVANT d'accepter la connexion
      const roleName = typeof user.role === 'object' ? user.role.name : user.role
      if (roleName === 'Customer') {
        throw new Error("Accès refusé. Ce portail est strictement réservé au personnel.")
      }

      // Si c'est bien le staff, on sauvegarde
      this.token = response.data.token
      this.user = user
      localStorage.setItem('crm_token', this.token)
    },

    async fetchProfile() {
      if (!this.token) return
      try {
        const response = await api.get('/auth/me')
        const user = response.data.user
        
        // Double vérification si on rafraîchit la page
        const roleName = typeof user.role === 'object' ? user.role.name : user.role
        if (roleName === 'Customer') throw new Error("Accès refusé.")

        this.user = user
      } catch (error) {
        this.logout()
      }
    },

    logout() {
      this.token = null
      this.user = null
      localStorage.removeItem('crm_token')
    }
  }
})