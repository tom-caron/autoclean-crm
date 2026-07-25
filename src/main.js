import { createApp } from 'vue'
import * as Sentry from "@sentry/vue";
import { createPinia } from 'pinia'
import './style.css'
import App from './App.vue'
import router from './router'

const app = createApp(App)
const pinia = createPinia()

Sentry.init({
  app,
  dsn: "https://6f6dccf5d8fae1c1c856aa1e7f83abaf@o4511797826748416.ingest.de.sentry.io/4511798041706576",

  integrations: [
    Sentry.browserTracingIntegration({ router }),
    Sentry.replayIntegration(),
  ],
  tracesSampleRate: 1.0,

  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});

app.use(pinia)
app.use(router)
app.mount('#app')