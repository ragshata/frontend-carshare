<template>
  <div class="driver-screen">
    <div class="background-img"></div>

    <div class="driver-content">
      <div class="actions">
        <button class="btn btn-access" @click="go('/buy-access')">
          💳 Купить доступ
        </button>
        <button class="btn" @click="go('/offer-trip')">
          🚗 Создать поездку
        </button>
        <button class="btn" @click="go('/manage-trips')">
          📋 Мои поездки
        </button>
        <button class="btn" @click="go('/help')">
          🛟 Помощь
        </button>
                <a
          class="btn"
          href="https://t.me/Safarbartjk"
          target="_blank"
          rel="noopener"
        >
          🛠 Написать поддержке
        </a>
        <button class="btn" @click="go('/profile')">
          👤 Профиль
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
.driver-screen {
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

.driver-content {
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
  font-weight: 600;
  border: none;
  border-radius: 12px;
  width: 100%;
  background: rgba(255, 255, 255, 0.45);
  color: #007bff;
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  box-shadow: 0 6px 14px rgba(0, 0, 0, 0.08);
  transition: background 0.18s;
}
.btn:active {
  background: rgba(227, 238, 255, 0.6);
}

.btn-access {
  background: #ff9800;
  color: white;
}
.btn-access:active {
  background: #fb8c00;
}
a.btn {
  text-decoration: none;
}

@keyframes bg-fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}
</style>
