<template>
  <div class="my-bookings-page">
    <button class="back-button" @click="router.push('/main')">← Назад</button>
    <h2 class="title">Мои бронирования</h2>
    <div v-if="loading" class="empty-text">Загрузка...</div>
    <div v-else-if="bookings.length === 0" class="empty-text">У вас нет бронирований</div>
    <div v-else class="bookings-list">
      <div
        v-for="booking in bookings"
        :key="booking.id"
        class="booking-card"
      >
        <div class="row bold">
          {{ booking.trip?.from_ }} — {{ booking.trip?.to }}
          <span>({{ statusMap[booking.status] || booking.status }})</span>
        </div>
        <div class="row">
          🗓 {{ booking.trip?.date }} &nbsp; ⏰ {{ booking.trip?.time }}
        </div>
        <div class="row">
          💰 {{ booking.trip?.price }} ₽ &nbsp; 👥 Мест осталось: {{ booking.trip?.seats }}
        </div>
        <div class="row">
          Водитель: {{ booking.driver?.first_name }} <template v-if="booking.driver?.last_name">{{ booking.driver.last_name }}</template>
        </div>
        <div class="actions">
          <button
            v-if="canRate(booking)"
            class="btn btn-outline"
            @click="rateDriver(booking)"
          >Оценить водителя</button>
          <span v-else-if="alreadyRated(booking)" class="rated-label">Оценено</span>
        </div>
      </div>
    </div>
    <Toast ref="toastRef" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/store/auth";
import { getMyBookings } from "@/api/bookings";
import { getDriverReviews } from "@/api/reviews";
import { getTripById } from "@/api/trips";
import { getUserById } from "@/api/users";
import Toast from "@/components/Toast.vue";

const router = useRouter();
const auth = useAuthStore();

const bookings = ref<any[]>([]);
const reviewsByTrip = ref<Record<number, any>>({});
const loading = ref(true);
const toastRef = ref<InstanceType<typeof Toast> | null>(null);

const statusMap: Record<string, string> = {
  pending: "Ожидание",
  confirmed: "Подтверждено",
  rejected: "Отклонено",
  cancelled: "Отменено"
};

onMounted(async () => {
  loading.value = true;
  try {
    // 1. Получаем все свои брони
    const data = await getMyBookings(auth.user.id);
    // 2. Для каждой брони тянем данные поездки и водителя
    for (const booking of data) {
      booking.trip = await getTripById(booking.trip_id);
      booking.driver = await getUserById(booking.trip.owner_id);
    }
    bookings.value = data;
    // 3. Для каждой брони получаем, оставлял ли пользователь уже отзыв (чтобы не показывать кнопку "Оценить" дважды)
    const allReviews = await getDriverReviews(auth.user.id); // отзывы, где этот пользователь — автор
    allReviews.forEach((review: any) => {
      reviewsByTrip.value[review.trip_id] = review;
    });
  } catch {
    toastRef.value?.show("Ошибка загрузки бронирований!");
  } finally {
    loading.value = false;
  }
});

// Можно оценивать, если поездка завершена и отзыв ещё не оставлен
function canRate(booking: any) {
  return (
    booking.trip &&
    booking.trip.status === "done" &&
    !alreadyRated(booking)
  );
}

function alreadyRated(booking: any) {
  return Boolean(reviewsByTrip.value[booking.trip_id]);
}

function rateDriver(booking: any) {
  router.push(`/rate/${booking.trip.id}`);
}
</script>

<style scoped>
.my-bookings-page {
  padding: 16px;
  min-height: 100vh;
  background: var(--color-background);
}
.title {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 18px;
  color: var(--color-text-primary);
  text-align: center;
}
.back-button {
  background: transparent;
  border: 1px solid var(--color-primary);
  color: var(--color-primary);
  border-radius: 6px;
  padding: 6px 12px;
  font-size: 14px;
  cursor: pointer;
  margin-bottom: 12px;
  transition: background 0.2s ease;
}
.empty-text {
  color: var(--color-text-secondary);
  font-size: 16px;
  text-align: center;
  margin-top: 32px;
}
.bookings-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.booking-card {
  background: var(--color-surface);
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.row {
  font-size: 14px;
  color: var(--color-text-secondary);
  display: flex;
  flex-wrap: wrap;
}
.row.bold {
  font-weight: bold;
  font-size: 16px;
  color: var(--color-text-primary);
  justify-content: space-between;
}
.actions {
  display: flex;
  gap: 10px;
  margin-top: 8px;
  align-items: center;
}
.btn {
  background: var(--color-primary);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
}
.btn-outline {
  background: transparent;
  color: var(--color-primary);
  border: 1px solid var(--color-primary);
}
.rated-label {
  font-size: 13px;
  color: #999;
  margin-left: 10px;
}
</style>
