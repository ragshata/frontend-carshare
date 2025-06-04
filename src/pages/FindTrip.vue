<template>
  <div class="find-trip-page">
    <h2 class="title">Поиск поездок</h2>

    <form class="form" @submit.prevent="searchTripsHandler">
      <AnimatedInput
        v-model="form.from"
        label="Откуда"
        id="from"
        required
        :error="errors.from"
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
          v-model="form.dateFrom"
          label="Дата с"
          id="dateFrom"
          type="date"
          :error="errors.dateFrom"
        />
        <AnimatedInput
          v-model="form.dateTo"
          label="Дата по"
          id="dateTo"
          type="date"
          :error="errors.dateTo"
        />
        <div class="select-wrapper">
          <label for="status">Статус</label>
          <select id="status" v-model="form.status">
            <option value="active">Активные</option>
            <option value="done">Завершённые</option>
            <option value="cancelled">Отменённые</option>
          </select>
        </div>
      </div>

      <div class="buttons">
        <button type="submit" class="btn">Найти поездки</button>
        <button type="button" class="btn btn-outline" @click="resetFilters">
          Сбросить фильтры
        </button>
      </div>
    </form>

    <div v-if="trips.length" class="trip-results">
      <h3 class="results-title">Найденные поездки</h3>
      <div
        class="trip-card"
        v-for="trip in trips"
        :key="trip.id"
        @click="goToDetails(trip.id)"
        style="cursor: pointer;"
      >
        <div class="row between bold">{{ trip.from_ }} — {{ trip.to_city }}</div>
        <div class="row">🗓 {{ trip.date }} &nbsp;&nbsp; ⏰ {{ trip.time }}</div>
        <div class="row">💺 Мест: {{ trip.seats }} &nbsp;&nbsp; 💰 {{ trip.price }}₽</div>
        <div class="row">📌 Статус: {{ trip.status }}</div>
        <!-- Можно добавить кнопку бронирования отдельно, если нужно -->
      </div>
    </div>

    <Toast ref="toastRef" />
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import Toast from '@/components/Toast.vue';
import AnimatedInput from '@/components/AnimatedInput.vue';
import { searchTrips } from '@/api/trips';

const router = useRouter();
const toastRef = ref<InstanceType<typeof Toast> | null>(null);
const trips = ref<any[]>([]);
const showAdvanced = ref(false);

const form = reactive({
  from: '',
  to: '',
  date: '',
  maxPrice: '',
  dateFrom: '',
  dateTo: '',
  status: 'active'
});

const errors = reactive<Record<string, boolean>>({
  from: false,
  to: false,
  date: false,
  maxPrice: false,
  dateFrom: false,
  dateTo: false,
});

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



function validate() {
  let valid = true;
  Object.keys(errors).forEach((key) => {
    if (
      ['from', 'to', 'date'].includes(key) &&
      !form[key as keyof typeof form]
    ) {
      errors[key] = true;
      valid = false;
    } else {
      errors[key] = false;
    }
  });
  return valid;
}

function resetFilters() {
  form.from = '';
  form.to = '';
  form.date = '';
  form.maxPrice = '';
  form.dateFrom = '';
  form.dateTo = '';
  form.status = 'active';
  trips.value = [];
  Object.keys(errors).forEach(key => (errors[key] = false));
}

async function searchTripsHandler() {
  if (!validate()) return;

  try {
    const results = await searchTrips({
      from_city: form.from,
      to_city: form.to,
      date: form.date,
      date_from: form.dateFrom,
      date_to: form.dateTo,
      status: form.status
    });

    trips.value = results;
    toastRef.value?.show(`🚗 Найдено: ${results.length}`);
  } catch (error) {
    console.error('❌ Ошибка при поиске поездок:', error);
    toastRef.value?.show('❌ Ошибка при поиске');
  }
}

function goToDetails(id: number) {
  router.push(`/trip/${id}`);
}

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

.trip-results {
  margin-top: 32px;
}

.results-title {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 12px;
  color: var(--color-text-primary);
  text-align: center;
}

.trip-card {
  background: var(--color-surface);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.05);
  display: flex;
  flex-direction: column;
  gap: 8px;
  transition: box-shadow 0.1s;
}

.trip-card:hover {
  box-shadow: 0 4px 16px rgba(0,0,0,0.12);
  background: #f9fbff;
}

.row {
  font-size: 14px;
  color: var(--color-text-secondary);
  display: flex;
  flex-wrap: wrap;
}

.row.between {
  justify-content: space-between;
}

.bold {
  font-weight: bold;
  font-size: 16px;
  color: var(--color-text-primary);
}
</style>
