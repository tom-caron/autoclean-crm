/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        crmDark: '#0f172a',    // Un bleu nuit très sombre pour la barre latérale
        crmPrimary: '#3b82f6', // Un bleu vif pour les boutons d'action
        crmHover: '#1e293b',   // Pour le survol des menus
      }
    },
  },
  plugins: [],
}