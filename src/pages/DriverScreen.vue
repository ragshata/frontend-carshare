<template>
  <div class="driver-screen">
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
  <div class="background-img"></div>
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
  min-height: 100vh;
  background: var(--color-background, #fafbfc);
  padding: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.title {
  font-size: 22px;
  font-weight: bold;
  margin-bottom: 32px;
  color: var(--color-text-primary, #232323);
  text-align: center;
}
.actions {
  display: flex;
  flex-direction: column;
  gap: 18px;
  width: 100%;
  max-width: 340px;
}
.btn {
  background: var(--color-primary, #007bff);
  color: white;
  border: none;
  padding: 15px 0;
  border-radius: 10px;
  font-size: 17px;
  cursor: pointer;
  transition: background 0.2s;
  width: 100%;
}
.btn:hover {
  background: #0069d9;
}
.background-img {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  background: url('@/assets/2.png') center center / cover no-repeat;
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
