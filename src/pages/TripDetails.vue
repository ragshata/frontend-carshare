<template>
  <div class="trip-details-page">
    <h2 class="title">Детали поездки</h2>

    <div v-if="!trip" class="empty-text">Загрузка...</div>
    <div v-else>
      <div class="trip-info-card">
        <div class="row bold">
          {{ trip.from_ }} — {{ trip.to }}
        </div>
        <div class="row">
          🗓 {{ trip.date }} &nbsp; ⏰ {{ trip.time }}
        </div>
        <div class="row">
          💰 {{ trip.price }} сомони (TJS) &nbsp; 👥 Мест: {{ trip.seats }}
        </div>
        <div class="trip-desc" v-if="trip.description">
          <b>Особенности поездки:</b>
          <div style="margin-top:4px;">{{ trip.description }}</div>
        </div>
        <!-- Номер и марка машины -->
        <div class="row car-info" v-if="driver && (driver.car_brand || driver.car_number)">
          🚘
          <span v-if="driver.car_brand">{{ driver.car_brand }}</span>
          <span v-if="driver.car_brand && driver.car_number">,</span>
          <span v-if="driver.car_number"> номер {{ driver.car_number }}</span>
        </div>
        <!-- Фотка машины -->
        <div class="car-photo-wrapper" v-if="driver && driver.car_photo_url">
          <img
            :src="driver.car_photo_url.startsWith('http')
              ? driver.car_photo_url
              : BACKEND_URL + driver.car_photo_url"
            class="car-photo"
            alt="Фото машины"
          />
        </div>

      </div>

      <!-- Профиль водителя без кнопки перехода -->
      <div class="driver-card" v-if="driver">
        <div class="driver-header">
          <img v-if="driver.photo_url" :src="driver.photo_url" class="driver-avatar" alt="avatar" />
          <div>
            <div class="driver-name">
              {{ driver.first_name }}
              <template v-if="driver.last_name"> {{ driver.last_name }}</template>
            </div>
            <div class="driver-username" v-if="driver.username">@{{ driver.username }}</div>
            <div class="driver-phone" v-if="driver.phone"><b>Телефон:</b>{{driver.phone}}</div>
            <div class="driver-telegramid">ID: {{ driver.telegram_id }}</div>
          </div>
        </div>
        <div class="driver-rating">
          <span>Рейтинг:</span>
          <b>{{ avgRating > 0 ? avgRating.toFixed(1) : "—" }}</b> ⭐️ ({{ reviews.length }} отзыв{{ reviews.length === 1 ? '' : reviews.length < 5 ? 'а' : 'ов' }})
        </div>
        <div v-if="reviews.length === 0" class="empty-text">Нет отзывов</div>
        <div v-for="review in reviews.slice(0,3)" :key="review.id" class="review-card">
          <div class="review-rating">{{ review.rating }} ⭐️</div>
          <div class="review-text" v-if="review.text">{{ review.text }}</div>
          <div class="review-meta">
            Поездка: #{{ review.trip_id }}
            <span class="review-date">{{ formatDate(review.created_at) }}</span>
          </div>
        </div>
      </div>

      <div class="actions">
        <button
          v-if="!isOwner"
          class="btn"
          @click="bookTrip"
          :disabled="booking"
        >Забронировать</button>
        <button
          v-if="isOwner"
          class="btn btn-outline"
          @click="router.push(`/trip/${trip.id}/passengers`)"
        >👥 Пассажиры поездки</button>
      </div>
    </div>
    <Toast ref="toastRef" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, onBeforeUnmount } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "@/store/auth";
import { getTripById } from "@/api/trips";
import { getUserById } from "@/api/users";
import { getDriverReviews } from "@/api/reviews";
import { createBooking } from "@/api/bookings";
import Toast from "@/components/Toast.vue";

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();
const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const trip = ref<any | null>(null);
const driver = ref<any | null>(null);
const reviews = ref<any[]>([]);
const avgRating = ref(0);
const booking = ref(false);
const toastRef = ref<InstanceType<typeof Toast> | null>(null);

const statusMap: Record<string, string> = {
  active: "активна",
  done: "завершена",
  cancelled: "отменена"
};

const isOwner = computed(() => trip.value && driver.value && driver.value.id === auth.user.id);

onMounted(async () => {
  const tripId = Number(route.params.id);
  if (!tripId) {
    toastRef.value?.show("Ошибка: не найдена поездка!");
    return;
  }
  trip.value = await getTripById(tripId);
  driver.value = await getUserById(trip.value.owner_id);

  // ЛОГ: смотри что реально приходит!
  console.log("DRIVER DATA:", driver.value);

  reviews.value = await getDriverReviews(trip.value.owner_id);
  if (reviews.value.length) {
    avgRating.value =
      reviews.value.reduce((sum, r) => sum + (r.rating || 0), 0) /
      reviews.value.length;
  }
});

async function bookTrip() {
  if (!trip.value) return;
  booking.value = true;
  try {
    await createBooking({
      trip_id: trip.value.id,
      user_id: auth.user.id,
      status: "pending"
    });
    toastRef.value?.show("Вы успешно забронировали поездку!");
  } catch (e) {
    toastRef.value?.show("Мест нет!");
  }
  booking.value = false;
}

function formatDate(dt: string | null) {
  if (!dt) return '';
  return new Date(dt).toLocaleDateString('ru-RU');
}

onMounted(() => {
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
</script>

<style scoped>
.trip-details-page {
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
  font-size: 15px;
  text-align: center;
  margin-top: 20px;
}
.trip-info-card {
  background: var(--color-surface);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 18px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}
.row {
  font-size: 16px;
  color: var(--color-text-secondary);
  margin-bottom: 2px;
}
.bold {
  font-weight: bold;
  font-size: 18px;
  color: var(--color-text-primary);
}
.car-info {
  color: #232323;
  font-size: 15px;
  margin: 6px 0 4px 0;
}
/* Фото машины */
.car-photo-wrapper {
  display: flex;
  justify-content: center;
  margin: 16px 0 10px 0;
}
.car-photo {
  max-width: 260px;
  max-height: 130px;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.09);
  object-fit: cover;
}
.status {
  font-weight: bold;
  margin-left: 6px;
  text-transform: capitalize;
}
.status.active {
  color: #3ac569;
}
.status.done {
  color: #888;
}
.status.cancelled {
  color: #e53935;
}
.trip-desc {
  margin-top: 7px;
  color: var(--color-text-primary);
  font-size: 15px;
}
.driver-card {
  background: var(--color-surface);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 18px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.03);
}
.driver-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 6px;
}
.driver-avatar {
  width: 54px;
  height: 54px;
  border-radius: 12px;
  object-fit: cover;
}
.input, textarea.input {
  padding: 9px 12px;
  border-radius: 7px;
  border: 1px solid var(--color-border, #bbb);
  font-size: 15px;
  outline: none;
  width: 100%;
  resize: vertical;
}

.driver-name {
  font-size: 17px;
  font-weight: bold;
  color: var(--color-text-primary);
}
.driver-username {
  font-size: 13px;
  color: var(--color-text-secondary);
}
.driver-telegramid {
  font-size: 13px;
  color: #777;
}
.driver-rating {
  font-size: 15px;
  color: var(--color-text-primary);
  margin-bottom: 7px;
}
.review-card {
  background: var(--color-background);
  border-radius: 8px;
  padding: 9px 13px;
  margin-bottom: 6px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.02);
}
.review-rating {
  font-size: 15px;
  font-weight: bold;
  color: #FFD600;
  margin-bottom: 2px;
}
.review-text {
  font-size: 14px;
  color: var(--color-text-primary);
  margin-bottom: 2px;
}
.review-meta {
  font-size: 13px;
  color: var(--color-text-secondary);
}
.review-date {
  margin-left: 8px;
}
.actions {
  display: flex;
  gap: 12px;
  margin-top: 22px;
  justify-content: center;
}
.btn {
  background: var(--color-primary);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  transition: background 0.2s;
}
.btn-outline {
  background: transparent;
  color: var(--color-primary);
  border: 1px solid var(--color-primary);
}
</style>