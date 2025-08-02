<template>
  <div class="trip-passengers-page">
    <!-- Фоновое изображение -->
    <div class="background-img"></div>

    <!-- Полупрозрачная карточка -->
    <div class="content-card">
      <h2 class="title">Пассажиры поездки</h2>

      <div v-if="loading" class="empty-text">Загрузка...</div>
      <div v-else-if="trip && bookings.length === 0" class="empty-text">
        Нет пассажиров
      </div>
      <div v-else-if="trip">
        <div v-for="booking in bookings" :key="booking.id" class="passenger-card">
          <div class="row between bold">
            <span>
              {{ booking.user?.first_name }}
              <template v-if="booking.user?.last_name">
                {{ booking.user.last_name }}
              </template>
            </span>
            <span class="status" :class="booking.status">
              {{ statusMap[booking.status] || booking.status }}
            </span>
          </div>

          <!-- Если владелец поездки -->
          <template v-if="isOwner">
            <div class="row" v-if="booking.user?.username">
              Telegram:
              <a :href="`https://t.me/${booking.user.username}`" target="_blank">
                @{{ booking.user.username }}
              </a>
            </div>
            <div class="row">
              Телефон:
              <b v-if="booking.user?.phone">{{ booking.user.phone }}</b>
              <span v-else class="empty-phone">—</span>
            </div>
            <div class="row">
              Telegram ID: <b>{{ booking.user?.telegram_id }}</b>
            </div>
          </template>

          <!-- Если не владелец -->
          <template v-else>
            <div class="row" v-if="booking.user?.gender">
              Пол: <b>{{ genderLabel(booking.user.gender) }}</b>
            </div>
          </template>

          <div class="actions" v-if="isOwner && booking.status === 'pending'">
            <button class="btn" @click="confirm(booking.id)">Подтвердить</button>
            <button class="btn btn-danger" @click="reject(booking.id)">Отклонить</button>
          </div>
        </div>
      </div>

      <Toast ref="toastRef" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { getBookingsByTrip, confirmBooking, rejectBooking } from "@/api/bookings";
import { getTripById } from "@/api/trips";
import { useAuthStore } from "@/store/auth";
import Toast from "@/components/Toast.vue";

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();

const tripId = Number(route.params.id);

const bookings = ref<any[]>([]);
const trip = ref<any | null>(null);
const loading = ref(true);
const toastRef = ref<InstanceType<typeof Toast> | null>(null);

const statusMap: Record<string, string> = {
  pending: "Ожидает",
  confirmed: "Подтвержден",
  rejected: "Отклонён",
  cancelled: "Отменён",
};

const isOwner = computed(() => {
  return trip.value?.owner_id === auth.user?.id;
});

function genderLabel(g: string) {
  if (g === "male") return "Мужской";
  if (g === "female") return "Женский";
  return "Не указан";
}

async function loadBookings() {
  loading.value = true;
  try {
    trip.value = await getTripById(tripId);
    bookings.value = await getBookingsByTrip(tripId);
  } catch {
    toastRef.value?.show("Ошибка загрузки пассажиров!");
  } finally {
    loading.value = false;
  }
}

async function confirm(id: number) {
  try {
    await confirmBooking(id);
    toastRef.value?.show("Пассажир подтвержден");
    await loadBookings();
  } catch {
    toastRef.value?.show("Ошибка!");
  }
}

async function reject(id: number) {
  try {
    await rejectBooking(id);
    toastRef.value?.show("Бронь отклонена");
    await loadBookings();
  } catch {
    toastRef.value?.show("Ошибка!");
  }
}

onMounted(() => {
  const tg = (window as any).Telegram?.WebApp;
  tg?.BackButton?.show();
  tg?.BackButton?.onClick(() => {
    router.back();
  });

  loadBookings();
});

onBeforeUnmount(() => {
  const tg = (window as any).Telegram?.WebApp;
  tg?.BackButton?.hide();
  tg?.BackButton?.offClick?.();
});
</script>

<style scoped>
.trip-passengers-page {
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
  background: url("@/assets/secondary.webp") center center / cover no-repeat;
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
  margin-bottom: 18px;
  color: var(--color-text-primary);
  text-align: center;
}

.empty-text {
  color: var(--color-text-secondary);
  font-size: 16px;
  text-align: center;
  margin-top: 32px;
}

.passenger-card {
  background: rgba(255, 255, 255, 0.65);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.row {
  font-size: 15px;
  color: var(--color-text-secondary);
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.row.between {
  justify-content: space-between;
}
.bold {
  font-weight: bold;
  font-size: 16px;
  color: var(--color-text-primary);
}
.status {
  font-size: 13px;
  padding: 2px 8px;
  border-radius: 6px;
  background: #eee;
}
.status.pending {
  background: #ffe082;
}
.status.confirmed {
  background: #c8e6c9;
}
.status.rejected,
.status.cancelled {
  background: #ffcdd2;
}
.empty-phone {
  color: #b5b5b5;
  font-style: italic;
}
.actions {
  display: flex;
  gap: 10px;
  margin-top: 8px;
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
.btn-danger {
  background: #e53935;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>
