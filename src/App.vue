<template>
  <SplashScreen v-if="showSplash" @done="onSplashDone" />
  <div v-else class="container">
    <router-view />
  </div>
</template>

<script setup lang="ts">
import { ref, watchEffect } from 'vue';
import { useRouter } from 'vue-router';
import SplashScreen from '@/components/SplashScreen.vue';
import { useAuthStore } from '@/store/auth';
import { authorizeViaTelegram } from '@/auth/telegram';

const showSplash = ref(true);
const logMessage = ref('');
const auth = useAuthStore();
const router = useRouter();

function log(msg: string) {
  logMessage.value = msg;
  setTimeout(() => (logMessage.value = ''), 4000);
}

async function onSplashDone() {
  // Telegram WebApp SDK
  // @ts-ignore
  const tg = window.Telegram?.WebApp;

  if (!tg) {
    log("❌ Telegram WebApp не обнаружен (window.Telegram.WebApp is undefined)");
    showSplash.value = false;
    return;
  }

  tg.ready?.();
  tg.expand?.();

  const telegramUser = tg.initDataUnsafe?.user;
  if (!telegramUser) {
    log("❌ Нет данных пользователя Telegram. Запусти через Telegram Mini App!");
    showSplash.value = false;
    return;
  }

  // Сохраняем аватар (если есть)
  if (telegramUser.photo_url) {
    auth.user.photo_url = telegramUser.photo_url;
    localStorage.setItem('tg_user_photo_url', telegramUser.photo_url);
  }

  // Авторизация и регистрация на бэкенде
  try {
    await authorizeViaTelegram(telegramUser);

    // Если роль не выбрана, кидаем на MainScreen
    if (auth.user && typeof auth.user.is_driver !== 'boolean') {
      router.replace('/main-screen');
    }

    log("✅ Авторизация через Telegram прошла успешно!");
    showSplash.value = false;
  } catch (e: any) {
    log("❌ Ошибка авторизации через Telegram: " + (e?.message || e));
    showSplash.value = false;
  }
}

// ** Watch for changes в user после Splash **
watchEffect(() => {
  if (
    !showSplash.value &&
    auth.user &&
    typeof auth.user.is_driver !== 'boolean' &&
    router.currentRoute.value.path !== '/main-screen'
  ) {
    router.replace('/main-screen');
  }
});
</script>

<style scoped>
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
