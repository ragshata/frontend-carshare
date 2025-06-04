<template>
  <div class="main-menu-page">
    <h2>Добро пожаловать в CarShare TG!</h2>
    <div class="menu-buttons">
      <button class="menu-btn" @click="go('/find-trip')">🚗 Найти поездку</button>
      <button class="menu-btn" @click="go('/manage-trips')">📝 Мои поездки</button>
      <button class="menu-btn" @click="go('/offer-trip')">➕ Создать поездку</button>
      <button class="menu-btn" @click="go('/profile')">👤 Профиль</button>
      <button class="menu-btn" @click="go('/help')">❓ Помощь / FAQ</button>
    </div>
    <div class="info">💎 Простой поиск попутчиков в телеграм 💎</div>
  </div>
</template>


<script setup lang="ts">
import { onMounted, onBeforeUnmount } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();

function go(path: string) {
  router.push(path);
}

/**function setMainButton() {
  const tg = (window as any).Telegram?.WebApp;
  if (!tg) return;
  tg.ready();
  tg.MainButton.setText("🚗 Найти поездку");
  tg.MainButton.setParams({ color: "#007bff", text_color: "#ffffff" });
  tg.MainButton.show();
  tg.MainButton.onClick(() => go("/find-trip"));

  // Поддержка BackButton (шаг назад)
  tg.BackButton.show();
  tg.BackButton.onClick(() => {
    // Вернуть на этот главный экран
    router.push("/main");
  });
}

onMounted(() => {
  setMainButton();
});  */

onBeforeUnmount(() => {
  const tg = (window as any).Telegram?.WebApp;
  tg?.MainButton?.hide();
  tg?.MainButton?.offClick?.();
  tg?.BackButton?.hide?.();
  tg?.BackButton?.offClick?.();
});
</script>

<style scoped>
.main-menu-page {
  padding: 16px;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: var(--color-background, #f7f7f7);
}
h2 {
  font-size: 22px;
  font-weight: bold;
  margin-top: 48px;
  margin-bottom: 22px;
  color: var(--color-text-primary, #232323);
  text-align: center;
}
.menu-buttons {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
  max-width: 320px;
  margin-bottom: 32px;
}
.menu-btn {
  width: 100%;
  padding: 14px 0;
  font-size: 18px;
  font-weight: 500;
  background: #fff;
  border: 2px solid var(--color-primary, #007bff);
  border-radius: 12px;
  color: var(--color-primary, #007bff);
  cursor: pointer;
  transition: background 0.18s;
}
.menu-btn:hover {
  background: var(--color-primary, #007bff);
  color: #fff;
}
.info {
  font-size: 15px;
  color: var(--color-text-secondary, #888);
  text-align: center;
  margin-top: 18px;
}
</style>
