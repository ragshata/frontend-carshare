<template>
  <div class="search-results-page">
    <!-- Фоновое изображение -->
    <div class="background-img"></div>

    <!-- Полупрозрачная карточка -->
    <div class="content-card">
      <h2 class="title">Результаты поиска</h2>
      <div v-if="loading" class="empty-text">Загрузка...</div>
      <div v-else-if="trips.length === 0" class="empty-text">Поездки не найдены</div>
      <div v-else class="trip-list">
        <div class="trip-card" v-for="trip in trips" :key="trip.id">
          <div class="row between bold">{{ trip.from_ }} — {{ trip.to }}</div>
          <div class="row">🗓 {{ trip.date }} &nbsp; ⏰ {{ trip.time }}</div>
          <div class="row">💺 Мест: {{ trip.seats }} &nbsp; 💰 {{ trip.price }} сомони (TJS)</div>
          <div class="row">📌 Статус: {{ trip.status }}</div>
          <button
            class="btn"
            @click="book(trip)"
            :disabled="isTripBooked(trip.id)"
          >
            {{ isTripBooked(trip.id) ? "Уже забронировано" : "Забронировать" }}
          </button>
          <button class="btn btn-outline" @click="goToDetails(trip.id)">Подробнее</button>
        </div>
      </div>
      <Toast ref="toastRef" />
    </div>
  </div>
</template>


<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { searchTrips } from '@/api/trips';
import { useAuthStore } from '@/store/auth';
import { bookTrip, getBookings } from '@/api/bookings';
import Toast from '@/components/Toast.vue';

const router = useRouter();
const trips = ref<any[]>([]);
const loading = ref(true);
const toastRef = ref<InstanceType<typeof Toast> | null>(null);

const route = useRoute();
const auth = useAuthStore();
const myBookings = ref<any[]>([]);

function isTripBooked(tripId: number): boolean {
  return myBookings.value.some(b => b.trip_id === tripId);
}

async function load() {
  loading.value = true;

  // Получаем параметры из query
  const rawParams: any = {
    from_: typeof route.query.from_ === 'string' ? route.query.from_ : undefined,
    to: typeof route.query.to === 'string' ? route.query.to : undefined,
    date: typeof route.query.date === 'string' ? route.query.date : undefined,
    date_from: typeof route.query.date_from === 'string' ? route.query.date_from : undefined,
    date_to: typeof route.query.date_to === 'string' ? route.query.date_to : undefined,
    status: typeof route.query.status === 'string' ? route.query.status : undefined,
    maxPrice: typeof route.query.maxPrice === 'string' ? route.query.maxPrice : undefined,
  };

  // Только не пустые
  const params: any = {};
  Object.entries(rawParams).forEach(([k, v]) => {
    if (typeof v === 'string' && v.trim() !== '') params[k] = v;
  });
  params.status = 'active';

  try {
    // Получаем только будущие поездки
    trips.value = (await searchTrips(params)).filter(t => {
      if (!t.date) return false;
      const today = new Date();
      const tripDate = new Date(t.date);
      today.setHours(0,0,0,0);
      tripDate.setHours(0,0,0,0);
      return tripDate >= today;
    });

    // Получаем все бронирования пользователя
    if (auth.user?.id) {
      myBookings.value = await getBookings(auth.user.id);
    }
  } catch {
    trips.value = [];
    myBookings.value = [];
  }
  loading.value = false;
}

function goToDetails(id: number) {
  router.push(`/trip/${id}`);
}

onMounted(() => {
  load();

  const tg = (window as any).Telegram?.WebApp;
  if (tg?.BackButton) {
    tg.BackButton.show();
    tg.BackButton.onClick(() => {
      router.back();
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
    alert('Заявка на бронирование отправлена!\nПоездка появится во вкладке "Мои брони" только после подтверждения водителем.');
    myBookings.value.push({ trip_id: trip.id });
  } catch {
    alert('Мест нет!');
  }
}
</script>

<style scoped>
.search-results-page {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  overflow-y: auto;
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
  animation: fadeIn 1s ease-in-out;
}

.content-card {
  position: relative;
  z-index: 2;
  max-width: 480px;
  margin: 36px auto;
  padding: 24px 18px 32px;
  background: rgba(255, 255, 255, 0.45);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border-radius: 18px;
  box-shadow: 0 6px 14px rgba(0, 0, 0, 0.1);
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
  background: rgba(255, 255, 255, 0.65);
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

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
</style>
