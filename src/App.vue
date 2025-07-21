<template>
  <SplashScreen v-if="showSplash" @done="onSplashDone" />
  <div v-else class="container">
    <router-view />
    <div v-if="logMessage" class="tg-log">{{ logMessage }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import SplashScreen from '@/components/SplashScreen.vue';
import { useAuthStore } from '@/store/auth';
import { authorizeViaTelegram } from '@/auth/telegram';

const showSplash = ref(true);
const logMessage = ref('');
const auth = useAuthStore();
const router = useRouter();

const initialRedirectHandled = ref(false); // Чтобы не было двойного перехода

function log(msg: string) {
  logMessage.value = msg;
  setTimeout(() => (logMessage.value = ''), 4000);
}

// --- ОБРАБОТКА start_param ---
onMounted(() => {
  // @ts-ignore
  const startParam = window.Telegram?.WebApp?.initDataUnsafe?.start_param;

  if (startParam?.startsWith('rate_')) {
    const [, driverId, tripId] = startParam.split('_');
    router.replace(`/rate/${tripId}?driver=${driverId}`);
    initialRedirectHandled.value = true;
  }

  if (startParam?.startsWith('trip_')) {
    const [, tripId] = startParam.split('_');
    router.replace(`/trip/${tripId}/passengers`);
    initialRedirectHandled.value = true;
  }
});

const ADMIN_IDS = [363320196, 6931781449];

function redirectByRole() {
  if (auth.user && ADMIN_IDS.includes(auth.user.telegram_id)) {
    if (router.currentRoute.value.path !== '/admin') {
      router.replace('/admin');
    }
    return;
  }

  if (typeof auth.user.is_driver !== 'boolean') {
    if (router.currentRoute.value.path !== '/main-screen') {
      router.replace('/main-screen');
    }
    return;
  }

  if (auth.user.is_driver) {
    if (router.currentRoute.value.path !== '/driver') {
      router.replace('/driver');
    }
    return;
  }

  if (router.currentRoute.value.path !== '/passenger') {
    router.replace('/passenger');
  }
}

async function onSplashDone() {
  // @ts-ignore
  const tg = window.Telegram?.WebApp;

  if (!tg) {
    showSplash.value = false;
    return;
  }

  tg.ready?.();
  tg.expand?.();

  const telegramUser = tg.initDataUnsafe?.user;
  if (!telegramUser) {
    showSplash.value = false;
    return;
  }

  // Сохраняем аватар
  if (telegramUser.photo_url) {
    auth.user.photo_url = telegramUser.photo_url;
    localStorage.setItem('tg_user_photo_url', telegramUser.photo_url);
  }

  try {
    await authorizeViaTelegram(telegramUser);
    if (!initialRedirectHandled.value) {
      redirectByRole();
    }
    showSplash.value = false;
  } catch (e: any) {
    showSplash.value = false;
  }
}
</script>

<style scoped>
.container {
  min-height: 100vh;
  background: var(--color-background, #fafbfc);
}
.tg-log {
  position: fixed;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  background: #222;
  color: #fff;
  padding: 10px 24px;
  border-radius: 16px;
  font-size: 15px;
  z-index: 9999;
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
  opacity: 0.95;
  pointer-events: none;
}
</style>
