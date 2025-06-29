<template>
  <div class="search-results-page">
    <h2 class="title">Результаты поиска</h2>
    <div v-if="loading" class="empty-text">Загрузка...</div>
    <div v-else-if="trips.length === 0" class="empty-text">Поездки не найдены</div>
    <div v-else class="trip-list">
      <div class="trip-card" v-for="trip in trips" :key="trip.id">
        <div class="row between bold">{{ trip.from_ }} — {{ trip.to }}</div>
        <div class="row">🗓 {{ trip.date }} &nbsp; ⏰ {{ trip.time }}</div>
        <div class="row">💺 Мест: {{ trip.seats }} &nbsp; 💰 {{ trip.price }}₽</div>
        <div class="row">📌 Статус: {{ trip.status }}</div>
        <button class="btn" @click="book(trip)">Забронировать</button>
      </div>
    </div>
    <Toast ref="toastRef" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { useRoute } from 'vue-router';
import { searchTrips } from '@/api/trips';
import { useAuthStore } from '@/store/auth';
import { bookTrip } from '@/api/bookings';
import Toast from '@/components/Toast.vue';
import { useRouter } from 'vue-router';
const router = useRouter();
const trips = ref<any[]>([]);
const loading = ref(true);
const toastRef = ref<InstanceType<typeof Toast> | null>(null);

const route = useRoute();
const auth = useAuthStore();

async function load() {
  loading.value = true;
  // Получаем параметры из query
  const params: any = {
    from_: typeof route.query.from_ === 'string' ? route.query.from_ : '',
    to: typeof route.query.to === 'string' ? route.query.to : '',
    date: typeof route.query.date === 'string' ? route.query.date : '',
    date_from: typeof route.query.date_from === 'string' ? route.query.date_from : '',
    date_to: typeof route.query.date_to === 'string' ? route.query.date_to : '',
    status: typeof route.query.status === 'string' ? route.query.status : '',
    maxPrice: typeof route.query.maxPrice === 'string' ? route.query.maxPrice : ''
  };
  try {
    trips.value = await searchTrips(params);
  } catch {
    trips.value = [];
  }
  loading.value = false;
}

onMounted(() => {
  const tg = (window as any).Telegram?.WebApp;
  if (tg?.BackButton) {
    tg.BackButton.show();
    tg.BackButton.onClick(() => {
      router.back(); // Можно заменить на router.push('/main') если надо
    });
  }
});

onBeforeUnmount(() => {
  const tg = (window as any).Telegram?.WebApp;
  tg?.BackButton?.hide();
  tg?.BackButton?.offClick?.();
});

async function book(trip: any) {
  try {
    await bookTrip(trip.id, auth.user.id);
    toastRef.value?.show('🚗 Поездка забронирована!');
  } catch {
    toastRef.value?.show('❌ Ошибка при бронировании');
  }
}
</script>

<style scoped>
.search-results-page {
  padding: 16px;
  min-height: 100vh;
  background: var(--color-background, #fafbfc);
}
.title {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 16px;
  color: var(--color-text-primary, #232323);
  text-align: center;
}
.empty-text {
  color: var(--color-text-secondary, #999);
  font-size: 16px;
  text-align: center;
  margin-top: 32px;
}
.trip-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.trip-card {
  background: var(--color-surface, #fff);
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.row {
  font-size: 14px;
  color: var(--color-text-secondary, #444);
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
}
.bold {
  font-weight: bold;
  font-size: 16px;
  color: var(--color-text-primary, #232323);
  justify-content: space-between;
}
.btn {
  background: var(--color-primary, #007bff);
  color: white;
  border: none;
  padding: 10px 18px;
  border-radius: 8px;
  font-size: 15px;
  cursor: pointer;
  transition: background 0.2s;
  margin-top: 8px;
}
.btn:disabled {
  background: #bbb;
  cursor: not-allowed;
}
.btn-outline {
  background: transparent;
  color: var(--color-primary, #007bff);
  border: 1px solid var(--color-primary, #007bff);
  margin-left: 10px;
}
.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.15);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
}
.modal {
  background: #fff;
  border-radius: 16px;
  padding: 30px 26px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.09);
  min-width: 260px;
  text-align: center;
}
.modal-header {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 8px;
}
.modal-body {
  font-size: 15px;
}
</style>
