<template>
  <div class="container">
    <!-- Можешь оставить приветствие или лого, а кнопок не будет -->
    <h2 style="text-align:center;margin-top:60px;">Добро пожаловать в CarShare TJ!</h2>
    <p style="text-align:center;">Для навигации используйте большую кнопку Telegram внизу 👇</p>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

onMounted(() => {
  const tg = (window as any).Telegram?.WebApp;
  if (!tg) return;

  tg.ready();
  tg.MainButton.setText('🚗 Найти поездку');
  tg.MainButton.setParams({ color: '#007bff', text_color: '#ffffff' });
  tg.MainButton.show();

  // Слушаем клик — переход на нужный экран
  const handleClick = () => {
    router.push('/find-trip');
  };
  tg.MainButton.onClick(handleClick);

  // Если нужно — меняй MainButton после перехода на другие страницы (например, через глобальный beforeEach)
});

onBeforeUnmount(() => {
  const tg = (window as any).Telegram?.WebApp;
  tg?.MainButton?.hide();
  tg?.MainButton?.offClick?.();
});
</script>

<style scoped>
/* можно убрать или сделать приветственный экран */
</style>
