<template>
  <div class="help-page">
    <h2 class="title">Помощь</h2>

    <div class="tabs">
      <button
        v-for="tab in tabs"
        :key="tab"
        :class="['tab', { active: currentTab === tab }]"
        @click="currentTab = tab"
      >
        {{ tab }}
      </button>

    </div>

    <div class="tab-content">
      <div v-if="currentTab === 'Частые вопросы'">
        <h3>❓ Частые вопросы</h3>
        <ul>
          <li><strong>Как забронировать поездку?</strong><br />Выберите подходящую поездку и нажмите кнопку "Забронировать".</li>
          <li><strong>Как связаться с водителем?</strong><br />После бронирования появится чат или номер телефона.</li>
          <li><strong>Как отменить поездку?</strong><br />В разделе "Мои поездки" нажмите "Отменить".</li>
        </ul>
      </div>

      <div v-else>
        <h3>📄 Правила использования</h3>
        <p>Используя SafarBar, вы соглашаетесь соблюдать правила:</p>
        <ul>
          <li>❌ Не публиковать ложные поездки.</li>
          <li>✅ Быть пунктуальным и уважительным.</li>
          <li>🚫 Не использовать сервис в коммерческих целях без согласования.</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from "vue";
import { useRouter } from 'vue-router';

const router = useRouter();
const tabs = ['Частые вопросы', 'Правила использования'];
const currentTab = ref(tabs[0]);

onMounted(() => {
  const tg = (window as any).Telegram?.WebApp;
  if (tg?.BackButton) {
    tg.BackButton.show();
    tg.BackButton.onClick(() => {
      router.back(); // или router.back()
    });
  }
});
onBeforeUnmount(() => {
  const tg = (window as any).Telegram?.WebApp;
  tg?.BackButton?.hide();
  tg?.BackButton?.offClick?.();
});
</script>

<style scoped>
.help-page {
  padding: 16px;
  background: var(--color-background);
  min-height: 100vh;
}

.title {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 16px;
  color: var(--color-text-primary);
  text-align: center;
}

.tabs {
  display: flex;
  flex-wrap: nowrap;         /* ❗ Не переносить на новую строку */
  overflow-x: auto;          /* ❗ Горизонтальная прокрутка при нехватке места */
  gap: 12px;
  margin-bottom: 20px;
  padding-bottom: 4px;       /* немного отступа снизу для красоты */
}


.tab {
  padding: 10px 16px;
  border: 1px solid var(--color-primary);
  border-radius: 8px;
  background: transparent;
  color: var(--color-primary);
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;
}

.tab.active {
  background: var(--color-primary);
  color: white;
}

.back-button {
  background: transparent;
  border: 1px solid var(--color-primary);
  color: var(--color-primary);
  border-radius: 6px;
  padding: 6px 12px;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.2s ease;
}
.tab.back {
  color: var(--color-primary);
  border-color: var(--color-primary);
  background: transparent;
}

.tab.back:hover {
  background: var(--color-primary);
  color: white;
}

.tab-content {
  font-size: 14px;
  color: var(--color-text-primary);
  line-height: 1.6;
}

ul {
  padding-left: 16px;
  margin-top: 8px;
}

li {
  margin-bottom: 10px;
}
</style>
