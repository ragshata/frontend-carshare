<template>
  <div class="rate-driver-page">
    <button class="back-button" @click="router.back()">← Назад</button>
    <h2 class="title">Оцените водителя</h2>

    <div v-if="loadingTrip" class="empty-text">Загрузка...</div>
    <div v-else-if="!trip" class="empty-text">Поездка не найдена</div>
    <div v-else>
      <div class="trip-info">
        <div>
          <b>{{ trip.from_ }}</b> — <b>{{ trip.to }}</b>
        </div>
        <div>
          🗓 {{ trip.date }} &nbsp; ⏰ {{ trip.time }}
        </div>
      </div>
      <div class="stars">
        <span
          v-for="n in 5"
          :key="n"
          :class="['star', { active: n <= rating }]"
          @click="rating = n"
        >★</span>
      </div>
      <textarea
        v-model="review"
        class="review-input"
        rows="3"
        placeholder="Ваш комментарий (необязательно)"
      ></textarea>
      <button class="btn" @click="submit" :disabled="loading">
        Отправить отзыв
      </button>
    </div>
    <Toast ref="toastRef" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "@/store/auth";
import { getTripById } from "@/api/trips";
import { createReview } from "@/api/reviews";
import Toast from "@/components/Toast.vue";

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();
const toastRef = ref<InstanceType<typeof Toast> | null>(null);

const trip = ref<any | null>(null);
const rating = ref(0);
const review = ref("");
const loading = ref(false);
const loadingTrip = ref(true);

function getTelegramStartParam(): string {
  try {
    // @ts-ignore
    return window.Telegram?.WebApp?.initDataUnsafe?.start_param || '';
  } catch {
    return '';
  }
}

onMounted(async () => {
  loadingTrip.value = true;
  let tripId = Number(route.params.id);

  // Если открыто через стартовый параметр (Telegram)
  if (!tripId) {
    const startParam = getTelegramStartParam();
    // ищем паттерн rate_{driverId}_{tripId}
    const match = /^rate_(\d+)_(\d+)$/.exec(startParam);
    if (match) {
      // const driverId = Number(match[1]); // если понадобится
      tripId = Number(match[2]);
    }
  }

  if (!tripId) {
    toastRef.value?.show("Ошибка: не найдена поездка!");
    loadingTrip.value = false;
    return;
  }
  try {
    trip.value = await getTripById(tripId);
  } catch {
    trip.value = null;
  }
  loadingTrip.value = false;
});

async function submit() {
  if (rating.value === 0) {
    toastRef.value?.show("Поставьте оценку звёздами!");
    return;
  }
  if (!trip.value) return;
  loading.value = true;
  try {
    await createReview({
      trip_id: trip.value.id,
      author_id: auth.user.id,
      driver_id: trip.value.owner_id, // водитель = owner_id
      rating: rating.value,
      text: review.value
    });
    toastRef.value?.show("Спасибо за отзыв!");
    setTimeout(() => router.push('/manage-trips'), 600);
  } catch (e) {
    toastRef.value?.show("Ошибка при отправке отзыва!");
  }
  loading.value = false;
}
</script>

<style scoped>
.rate-driver-page {
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
.trip-info {
  margin-bottom: 20px;
  font-size: 16px;
  color: var(--color-text-primary);
  text-align: center;
}
.stars {
  display: flex;
  justify-content: center;
  font-size: 32px;
  margin-bottom: 18px;
}
.star {
  cursor: pointer;
  color: #ccc;
  margin: 0 2px;
  transition: color 0.2s;
}
.star.active {
  color: #FFD600;
}
.review-input {
  width: 100%;
  border: 1px solid var(--color-border, #ddd);
  border-radius: 8px;
  padding: 8px;
  font-size: 15px;
  margin-bottom: 18px;
  resize: none;
}
.btn {
  background: var(--color-primary);
  color: white;
  border: none;
  padding: 10px 18px;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  width: 100%;
  margin-top: 6px;
  transition: background 0.2s;
}
.btn:disabled {
  opacity: 0.7;
  cursor: default;
}
</style>
