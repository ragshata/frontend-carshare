import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import { createPinia } from 'pinia';
import piniaPersistedState from 'pinia-plugin-persistedstate';

import './assets/css/global.css';

const app = createApp(App);

const pinia = createPinia();
pinia.use(piniaPersistedState);

app.use(pinia);
app.use(router);

// ——— Обработка Telegram start_param перед монтированием
const tg = (window as any).Telegram?.WebApp;
tg?.ready?.();

const startParam = tg?.initDataUnsafe?.start_param;
if (startParam && startParam.startsWith("trip_")) {
  const tripId = startParam.split("_")[1];
  if (tripId) {
    router.replace(`/trip/${tripId}/passengers`);
  }
}

app.mount('#app');
