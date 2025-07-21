<template>
  <div class="driver-screen">
    <div class="background-img"></div>

    <div class="driver-content">
      <h2 class="title">Экран водителя</h2>

      <div class="actions">
        <button class="btn" @click="go('/offer-trip')">
          🚗 Создать поездку
        </button>
        <button class="btn" @click="go('/manage-trips')">
          📋 Мои поездки
        </button>
        <button class="btn" @click="go('/help')">
          🛟 Помощь
        </button>
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
  justify-content: space-between;
  background: transparent;
}

.background-img {
  position: fixed;
  inset: 0;
  width: 100%;
  height: 100%;
  background: url('@/assets/main-bg.svg') center center / cover no-repeat;
  z-index: 0;
  pointer-events: none;
  user-select: none;
  animation: bg-fade-in 1s ease-in-out;
}

.driver-content {
  position: relative;
  z-index: 2;
  width: 100%;
  padding: 28px 16px 36px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
  box-sizing: border-box;
}

.title {
  font-size: 22px;
  font-weight: bold;
  color: #222;
  text-align: center;
  margin-top: 20px;
}

.actions {
  display: flex;
  flex-direction: column;
  gap: 16px;
  align-items: stretch;
  margin-bottom: 10vh;
}

.btn {
  padding: 14px;
  font-size: 17px;
  font-weight: 600;
  border: none;
  border-radius: 12px;
  background: #fff;
  color: #007bff;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  transition: background 0.18s;
}
.btn:active {
  background: #e3eeff;
}

@keyframes bg-fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}
</style>
