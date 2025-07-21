<template>
  <div class="help-page">
    <div class="background-img"></div>

    <div class="help-content">
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
          <h3>❓ Частые вопросы (FAQ)</h3>
          <ul>
            <li>
              <strong>Как найти поездку?</strong><br />
              Откройте вкладку «Поиск», выберите маршрут и дату, нажмите «Найти поездку».
            </li>
            <li>
              <strong>Как создать поездку?</strong><br />
              В разделе «Мои поездки» или на главном экране выберите «Создать поездку» и заполните все поля.
            </li>
            <li>
              <strong>Как забронировать место?</strong><br />
              Найдите подходящую поездку в поиске и нажмите «Забронировать».
            </li>
            <li>
              <strong>Что делать при спорной ситуации?</strong><br />
              Попробуйте связаться с участником поездки через Telegram или по номеру. Если не удаётся — напишите в поддержку.
            </li>
          </ul>
        </div>

        <div v-else>
          <h3>📄 Правила использования</h3>
          <p>
            SafarBar — это платформа для поиска попутчиков. <br />
            <b>Ответственность за поездку и договорённости несут только сами пользователи.</b>
          </p>
          <ul>
            <li>❌ Не публикуйте ложные поездки или бронирования.</li>
            <li>✅ Будьте пунктуальны, вежливы и честны друг с другом.</li>
            <li>🚫 Не используйте сервис в коммерческих целях без согласования с администрацией.</li>
            <li>⚠️ При возникновении спорных ситуаций попытайтесь урегулировать вопрос мирно.</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useSmartBack } from "@/utils/navigation";
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
      useSmartBack(router); // передай свой router
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
  width: 100%;
  height: 100%;
  background: url('@/assets/secondary.webp') center center / cover no-repeat;
  z-index: 0;
  pointer-events: none;
  user-select: none;
  animation: bg-fade-in 1s ease-in-out;
}

.help-content {
  position: relative;
  z-index: 2;
  max-width: 360px;
  margin: 0 auto;
  margin-top: 32px;
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

.tabs {
  display: flex;
  flex-wrap: nowrap;
  overflow-x: auto;
  gap: 12px;
  margin-bottom: 20px;
  padding-bottom: 4px;
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
  white-space: nowrap;
}

.tab.active {
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

@keyframes bg-fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

</style>
