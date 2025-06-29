<template>
  <div class="my-bookings-page">
    <h2 class="title">Мои бронирования</h2>
    <div v-if="loading" class="empty-text">Загрузка...</div>
    <div v-else-if="bookings.length === 0" class="empty-text">Нет бронирований</div>
    <div v-else class="booking-list">
      <div class="booking-card" v-for="booking in bookings" :key="booking.id">
        <div class="row between bold">
          <span>
            {{ booking.trip?.from_ }} — {{ booking.trip?.to }}
            <span class="small" v-if="booking.trip">({{ booking.trip.date }} {{ booking.trip.time }})</span>
          </span>
          <span>{{ booking.trip?.price }}₽</span>
        </div>
        <div class="row">Статус: {{ booking.status }}</div>
        <button class="btn btn-danger" @click="removeBooking(booking.id)">Отменить</button>
      </div>
    </div>
    <Toast ref="toastRef" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { getMyBookings, deleteBooking } from '@/api/bookings';
import { getTripById } from '@/api/trips';
import { useAuthStore } from '@/store/auth';
import Toast from '@/components/Toast.vue';

interface Trip {
  id: number;
  from_: string;
  to: string;
  date: string;
  time: string;
  seats: number;
  price: number;
  owner_id: number;
  status: string;
}

interface Booking {
  id: number;
  trip_id: number;
  user_id: number;
  status: string;
  created_at?: string;
  trip?: Trip | null;
}

const auth = useAuthStore();
const bookings = ref<Booking[]>([]);
const loading = ref(true);
const toastRef = ref<InstanceType<typeof Toast> | null>(null);

async function loadBookings() {
  loading.value = true;
  try {
    const items = await getMyBookings(auth.user.id);
    // Для каждого бронирования подтягиваем инфу о поездке
    bookings.value = await Promise.all(
      items.map(async (b: Booking) => {
        try {
          b.trip = await getTripById(b.trip_id);
        } catch {
          b.trip = null;
        }
        return b;
      })
    );
  } catch {
    bookings.value = [];
  }
  loading.value = false;
}

async function removeBooking(id: number) {
  if (!confirm('Отменить бронирование?')) return;
  try {
    await deleteBooking(id);
    bookings.value = bookings.value.filter(b => b.id !== id);
    toastRef.value?.show('Бронирование отменено');
  } catch {
    toastRef.value?.show('Ошибка при отмене');
  }
}

onMounted(() => {
  loadBookings();
  const tg = (window as any).Telegram?.WebApp;
  if (tg?.BackButton) {
    tg.BackButton.show();
    tg.BackButton.onClick(() => window.history.back());
  }
});
onBeforeUnmount(() => {
  const tg = (window as any).Telegram?.WebApp;
  tg?.BackButton?.hide();
  tg?.BackButton?.offClick?.();
});
</script>

<style scoped>
.my-bookings-page {
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
.booking-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.booking-card {
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
.row.between {
  justify-content: space-between;
}
.bold {
  font-weight: bold;
  font-size: 16px;
  color: var(--color-text-primary, #232323);
}
.small {
  font-size: 13px;
  color: #777;
}
.btn {
  background: var(--color-primary, #007bff);
  color: white;
  border: none;
  padding: 8px 15px;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  margin-top: 10px;
}
.btn-danger {
  background: #e53935;
}
</style>
