<template>
  <div class="trip-details-page">
    <button class="back-button" @click="router.back()">← Назад</button>
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
          💰 {{ trip.price }} ₽ &nbsp; 👥 Мест: {{ trip.seats }}
        </div>
        <div class="row" v-if="trip.status">
          Статус: 
          <span :class="['status', trip.status]">
            {{ statusMap[trip.status] || trip.status }}
          </span>
        </div>
        <div class="trip-desc" v-if="trip.description">
          {{ trip.description }}
        </div>
      </div>

      <!-- Блок о водителе -->
      <div class="driver-card" v-if="driver">
        <div class="driver-header">
          <img v-if="driver.photo_url" :src="driver.photo_url" class="driver-avatar" alt="avatar" />
          <div>
            <div class="driver-name">
              {{ driver.first_name }}
              <template v-if="driver.last_name"> {{ driver.last_name }}</template>
            </div>
            <div class="driver-username" v-if="driver.username">@{{ driver.username }}</div>
          </div>
          <button class="btn btn-outline" @click="goToProfile(driver.id)">
            Профиль
          </button>
        </div>
        <div class="driver-rating">
          Рейтинг: <b>{{ avgRating > 0 ? avgRating.toFixed(1) : "—" }}</b> ⭐ ({{ reviews.length }} отзыв{{ reviews.length === 1 ? '' : reviews.length < 5 ? 'а' : 'ов' }})
        </div>
        <div v-if="reviews.length === 0" class="empty-text">Нет отзывов</div>
        <div v-for="review in reviews.slice(0,3)" :key="review.id" class="review-card">
          <div class="review-rating">{{ review.rating }} ⭐</div>
          <div class="review-text" v-if="review.text">{{ review.text }}</div>
          <div class="review-meta">
            Поездка: #{{ review.trip_id }}
            <span class="review-date">{{ formatDate(review.created_at) }}</span>
          </div>
        </div>
      </div>

      <!-- Кнопка "Забронировать" или "Пассажиры" -->
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
import { ref, onMounted, computed } from "vue";
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
    toastRef.value?.show("Ошибка при бронировании!");
  }
  booking.value = false;
}

function goToProfile(userId: number) {
  router.push("/profile"); // Или если у тебя есть страница чужого профиля — туда (например, `/profile/:id`)
}

function formatDate(dt: string | null) {
  if (!dt) return '';
  return new Date(dt).toLocaleDateString('ru-RU');
}
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
.driver-name {
  font-size: 17px;
  font-weight: bold;
  color: var(--color-text-primary);
}
.driver-username {
  font-size: 13px;
  color: var(--color-text-secondary);
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
