<template>
  <div class="admin-page">
    <div class="background-img"></div>

    <div class="admin-content">
      <h2 class="title">Админ-панель</h2>

      <div class="admin-tabs">
        <router-link to="/admin/users" class="tab" :class="{ active: isActive('/admin/users') }">Пользователи</router-link>
        <router-link to="/admin/trips" class="tab" :class="{ active: isActive('/admin/trips') }">Поездки</router-link>
        <router-link to="/admin/reviews" class="tab" :class="{ active: isActive('/admin/reviews') }">Отзывы</router-link>
        <router-link to="/admin/stats" class="tab" :class="{ active: isActive('/admin/stats') }">Аналитика</router-link>
      </div>

      <router-view />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router';
const route = useRoute();
const isActive = (path: string) => route.path.startsWith(path);
</script>

<style scoped>
.admin-page {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: transparent;
}
.background-img {
  position: fixed;
  inset: 0;
  background: url('@/assets/secondary.webp') center center / cover no-repeat;
  z-index: 0;
  pointer-events: none;
  user-select: none;
  animation: bg-fade-in 1s ease-in-out;
}
.admin-content {
  position: relative;
  z-index: 2;
  max-width: 360px;
  margin: 32px auto;
  background: rgba(255, 255, 255, 0.45);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  padding: 24px 20px;
  border-radius: 18px;
  box-shadow: 0 6px 14px rgba(0, 0, 0, 0.1);
  overflow-y: auto;
  max-height: calc(100vh - 64px);
}
.title {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 16px;
  color: var(--color-text-primary);
  text-align: center;
}
.admin-tabs {
  display: flex;
  flex-wrap: nowrap;
  justify-content: center;
  gap: 8px;
  margin-bottom: 20px;
  padding-bottom: 4px;
  flex-wrap: wrap;
}
.tab {
  padding: 6px 10px;
  font-size: 13px;
  border: 1px solid var(--color-primary);
  border-radius: 6px;
  background: transparent;
  color: var(--color-primary);
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  flex-shrink: 0;
  max-width: 48%;
  text-overflow: ellipsis;
  overflow: hidden;
  text-align: center;
}
.tab.active {
  background: var(--color-primary);
  color: white;
}
@keyframes bg-fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}
</style>
