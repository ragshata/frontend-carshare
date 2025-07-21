<template>
  <div class="passenger-screen">
    <h2 class="title">Экран пассажира</h2>
    <div class="actions">
      <button class="btn" @click="go('/find-trip')">
        🔍 Найти поездку
      </button>
      <button class="btn" @click="go('/my-bookings')">
        📋 Мои бронирования
      </button>
      <button class="btn" @click="go('/help')">
        🛟 Помощь
      </button>
      <button class="btn" @click="go('/profile')">
        👤 Мой профиль
      </button>
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
.passenger-screen {
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
</style>
