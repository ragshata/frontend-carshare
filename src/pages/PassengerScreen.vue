<template>
  <div class="passenger-screen">
    <div class="background-img"></div>

    <div class="passenger-content">
      <div class="actions">
        <button class="btn" @click="go('/find-trip')">
           Найти поездку
        </button>
        <button class="btn" @click="go('/my-bookings')">
           Мои бронирования
        </button>
        <button class="btn" @click="go('/help')">
           Центр помощи
        </button>
        <a
          class="btn"
          href="https://t.me/Safarbartjk"
          target="_blank"
          rel="noopener"
        >
           Написать в поддержку
        </a>
        <button class="btn" @click="go('/profile')">
           Мой профиль
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
const router = useRouter();

function go(path: string) {
  router.push(path);
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Manrope:wght@700;800&display=swap');

.passenger-screen {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  background: transparent;
}

.background-img {
  position: fixed;
  inset: 0;
  width: 100%;
  height: 100%;
  background: url('@/assets/main.webp') center center / cover no-repeat;
  z-index: 0;
  pointer-events: none;
  user-select: none;
  animation: bg-fade-in 1s ease-in-out;
}

.passenger-content {
  position: relative;
  z-index: 2;
  width: 100%;
  height: 100%;
  padding: 32px 16px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: center;
  box-sizing: border-box;
}

.actions {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
  max-width: 360px;
  margin-bottom: 10vh;
}

.btn {
  padding: 14px;
  font-size: 17px;
  font-weight: 800; /* как на экране водителя */
  font-family: 'Manrope', system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', 'Apple Color Emoji', 'Segoe UI Emoji';
  letter-spacing: 0.2px;
  border: none;
  border-radius: 12px;
  width: 100%;
  background: rgba(255, 255, 255, 0.45);
  color: #111; /* чёрный текст */
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  box-shadow: 0 6px 14px rgba(0, 0, 0, 0.08);
  transition: background 0.18s;
  text-align: center;
  display: block;
  text-decoration: none;
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
}
.btn:active {
  background: rgba(227, 238, 255, 0.6);
}

a.btn {
  text-decoration: none;
}

@keyframes bg-fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}
</style>
