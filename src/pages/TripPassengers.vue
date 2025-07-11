<template>
  <div class="trip-passengers-page">
    <h2 class="title">Пассажиры поездки</h2>

    <div v-if="loading" class="empty-text">Загрузка...</div>
    <div v-else-if="bookings.length === 0" class="empty-text">Нет пассажиров</div>
    <div v-else>
      <div v-for="booking in bookings" :key="booking.id" class="passenger-card">
        <div class="row between bold">
          <span>
            {{ booking.user?.first_name }}
            <template v-if="booking.user?.last_name"> {{ booking.user.last_name }}</template>
          </span>
          <span class="status" :class="booking.status">
            {{ statusMap[booking.status] || booking.status }}
          </span>
        </div>
        <div class="row">
          <span v-if="booking.user?.username">
            Telegram:
            <a :href="`https://t.me/${booking.user.username}`" target="_blank">@{{ booking.user.username }}</a>
          </span>
        </div>
        <div class="row">
          <span>
            Телефон:
            <b v-if="booking.user?.phone">{{ booking.user.phone }}</b>
            <span v-else class="empty-phone">—</span>
          </span>
        </div>
        <div class="row">
          <span>Telegram ID: <b>{{ booking.user?.telegram_id }}</b></span>
        </div>
        <div class="actions" v-if="booking.status === 'pending'">
          <button class="btn" @click="confirm(booking.id)">Подтвердить</button>
          <button class="btn btn-danger" @click="reject(booking.id)">Отклонить</button>
        </div>
      </div>
    </div>
    <Toast ref="toastRef" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from "vue";
import { useRoute, useRouter } from "vue-router";
import { getBookingsByTrip, confirmBooking, rejectBooking } from "@/api/bookings";
import Toast from "@/components/Toast.vue";

const route = useRoute();
const router = useRouter();
const tripId = Number(route.params.id);

const bookings = ref<any[]>([]);
const loading = ref(true);
const toastRef = ref<InstanceType<typeof Toast> | null>(null);

const statusMap: Record<string, string> = {
  "pending": "Ожидает",
  "confirmed": "Подтвержден",
  "rejected": "Отклонён",
  "cancelled": "Отменён"
};

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

async function loadBookings() {
  loading.value = true;
  try {
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

onMounted(loadBookings);
</script>

<style scoped>
.trip-passengers-page {
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
.passenger-card {
  background: var(--color-surface);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
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
</style>