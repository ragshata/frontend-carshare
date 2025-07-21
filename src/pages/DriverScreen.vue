<template>
  <div class="driver-screen">
    <div class="driver-content">

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
    <div class="background-img"></div>
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
  position: relative;
  min-height: 100vh;
  overflow: hidden;
}
.driver-content {
  position: relative;
  z-index: 2;
  padding: 24px 16px;
  text-align: center;
}

.title {
  font-size: 22px;
  font-weight: bold;
  margin-bottom: 24px;
  color: #222;
}

.actions {
  display: flex;
  flex-direction: column;
  gap: 14px;
  align-items: stretch;
  justify-content: center;
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

.background-img {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  background: url('@/assets/main-bg.svg') center center / cover no-repeat;
  z-index: 0;
  pointer-events: none;
  user-select: none;
  animation: bg-fade-in 1.1s;
}

@keyframes bg-fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}
</style>