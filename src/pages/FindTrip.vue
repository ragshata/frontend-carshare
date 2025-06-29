<template>
  <div class="find-trip-page">
    <h2 class="title">Поиск поездок</h2>
    
    <form class="form" @submit.prevent="goToResults">
      <AnimatedInput
        v-model="form.from_"
        label="Откуда"
        id="from_"
        required
        :error="errors.from_"
      />
      <AnimatedInput
        v-model="form.to"
        label="Куда"
        id="to"
        required
        :error="errors.to"
      />
      <AnimatedInput
        v-model="form.date"
        label="Дата"
        id="date"
        type="date"
        required
        :error="errors.date"
      />

      <button type="button" class="btn btn-outline" @click="showAdvanced = !showAdvanced">
        {{ showAdvanced ? 'Скрыть дополнительные фильтры' : 'Показать дополнительные фильтры' }}
      </button>

      <div v-if="showAdvanced" class="advanced-filters">
        <AnimatedInput
          v-model="form.date_from"
          label="Дата с"
          id="date_from"
          type="date"
        />
        <AnimatedInput
          v-model="form.date_to"
          label="Дата по"
          id="date_to"
          type="date"
        />
        <div class="select-wrapper">
          <label for="status">Статус</label>
          <select id="status" v-model="form.status">
            <option value="active">Активные</option>
            <option value="done">Завершённые</option>
            <option value="cancelled">Отменённые</option>
          </select>
        </div>
        <AnimatedInput
          v-model="form.maxPrice"
          label="Максимальная цена"
          id="maxPrice"
          type="number"
        />
      </div>

      <div class="buttons">
        <button type="submit" class="btn">Найти поездки</button>
        <button type="button" class="btn btn-outline" @click="resetFilters">
          Сбросить фильтры
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import AnimatedInput from '@/components/AnimatedInput.vue';

const router = useRouter();
const showAdvanced = ref(false);

const form = reactive({
  from_: '',
  to: '',
  date: '',
  date_from: '',
  date_to: '',
  status: 'active',
  maxPrice: ''
});
const errors = reactive({ from_: false, to: false, date: false });

onMounted(() => {
  const tg = (window as any).Telegram?.WebApp;
  if (tg?.BackButton) {
    tg.BackButton.show();
    tg.BackButton.onClick(() => {
      router.push('/main');
    });
  }
});
onBeforeUnmount(() => {
  const tg = (window as any).Telegram?.WebApp;
  tg?.BackButton?.hide();
  tg?.BackButton?.offClick?.();
});

function validate() {
  let valid = true;
  (["from_", "to", "date"] as const).forEach((k) => {
    errors[k] = !form[k];
    if (!form[k]) valid = false;
  });
  return valid;
}
function resetFilters() {
  Object.assign(form, { from_: '', to: '', date: '', date_from: '', date_to: '', status: 'active', maxPrice: '' });
}

function goToResults() {
  if (!validate()) return;
  const query: Record<string, string> = {};
  Object.entries(form).forEach(([key, value]) => {
    if (value && value !== '') query[key] = value;
  });
  router.push({ path: '/search-results', query });
}

</script>

<style scoped>
.find-trip-page {
  padding: 16px;
  background: var(--color-background);
  min-height: 100vh;
}
.title {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 24px;
  color: var(--color-text-primary);
  text-align: center;
}
.form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.buttons {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 12px;
}
.select-wrapper {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 14px;
  color: var(--color-text-primary);
}
.select-wrapper select {
  padding: 12px;
  border-radius: 8px;
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  font-size: 15px;
  color: var(--color-text-primary);
}
.advanced-filters {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 12px;
}
.btn {
  background: var(--color-primary);
  color: white;
  padding: 12px;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}
.btn:hover {
  background-color: #0069d9;
}
.btn-outline {
  background: transparent;
  color: var(--color-primary);
  border: 1px solid var(--color-primary);
}
</style>
