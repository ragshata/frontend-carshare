<template>
  <div class="my-bookings-page">
    <div class="background-img"></div>

    <div class="content-card">
      <h2 class="title">Мои бронирования (debug)</h2>

      <div class="tabs">
        <button :class="{ active: currentTab === 'active' }" @click="currentTab = 'active'">Активные</button>
        <button :class="{ active: currentTab === 'done' }" @click="currentTab = 'done'">Завершённые</button>
      </div>

      <div v-if="loading" class="empty-text">Загрузка...</div>
      <div v-else-if="filteredBookings.length === 0" class="empty-text">Нет бронирований</div>

      <div v-else class="booking-list">
        <div
          class="booking-card"
          v-for="b in filteredBookings"
          :key="b.id"
        >
          <div class="row between bold">
            {{ tripMap[b.trip_id]?.from_ || '—' }} — {{ tripMap[b.trip_id]?.to || '—' }}
            <span>{{ tripMap[b.trip_id]?.price ? tripMap[b.trip_id].price + ' сомони (TJS)' : '' }}</span>
          </div>

          <div class="row">
            <span v-if="tripMap[b.trip_id]?.date">🗓 {{ tripMap[b.trip_id].date }}</span>
            <span v-if="tripMap[b.trip_id]?.time">⏰ {{ tripMap[b.trip_id].time }}</span>
          </div>

          <div class="row">
            <span :class="['status', b.status]">{{ ruStatus(b.status) }}</span>
          </div>

          <div v-if="drivers[b.trip_id]" class="driver-info">
            <div v-if="drivers[b.trip_id]?.username">
              Telegram:
              <a :href="'https://t.me/' + drivers[b.trip_id].username" target="_blank">
                @{{ drivers[b.trip_id].username }}
              </a>
            </div>
          </div>

          <!-- DEBUG INFO -->
          <div class="debug-box">
            <div>confirmed_at: {{ b.confirmed_at }}</div>
            <div>secondsPassed: {{ secondsPassed(b) }}</div>
            <div>remainingSeconds: {{ remainingSeconds(b) }}</div>
            <div>now: {{ new Date(now).toISOString() }}</div>
          </div>

          <div class="actions">
            <button class="btn-outline" @click="goToTripDetails(b.trip_id)">Подробнее</button>

            <template v-if="b.status === 'confirmed'">
              <template v-if="remainingSeconds(b) > 0">
                <button
                  class="btn-cancel"
                  @click="cancelBookingClick(b)"
                >
                  Отменить ({{ formatTime(remainingSeconds(b)) }})
                </button>
              </template>
              <template v-else>
                <span class="cancel-expired">Отменить уже нельзя</span>
              </template>
            </template>
          </div>
        </div>
      </div>
    </div>

    <Toast ref="toastRef" />
  </div>
</template>


<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed } from "vue";
import { useAuthStore } from "@/store/auth";
import { getMyBookings, cancelBooking } from "@/api/bookings";
import { getTripById } from "@/api/trips";
import { getUserById } from "@/api/users";
import Toast from "@/components/Toast.vue";
import { useRouter } from "vue-router";
import { useSmartBack } from "@/utils/navigation";

const auth = useAuthStore();
const router = useRouter();

const loading = ref(true);
const confirmedBookings = ref<any[]>([]);
const tripMap = ref<Record<number, any>>({});
const drivers = ref<Record<number, any>>({});
const toastRef = ref<InstanceType<typeof Toast> | null>(null);

const currentTab = ref<'active' | 'done'>('active');

const now = ref(Date.now());
let timer: any = null;
onMounted(() => {
  timer = setInterval(() => {
    now.value = Date.now();
  }, 1000); // каждую секунду
});
onBeforeUnmount(() => {
  clearInterval(timer);
});

const filteredBookings = computed(() =>
  confirmedBookings.value.filter(b => {
    const trip = tripMap.value[b.trip_id];
    if (!trip) return false;
    return currentTab.value === 'active'
      ? trip.status !== 'done'
      : trip.status === 'done';
  })
);

function ruStatus(status: string) {
  switch (status) {
    case "confirmed":
      return "Подтверждено";
    case "pending":
      return "Ожидает подтверждения";
    case "cancelled":
      return "Отменено";
    default:
      return status;
  }
}

function goToTripDetails(tripId: number) {
  router.push(`/trip/${tripId}`);
}

function secondsPassed(b: any) {
  const base = b.confirmed_at || b.created_at;
  if (!base) return 999999;
  const start = new Date(base).getTime();
  return Math.floor((now.value - start) / 1000);
}

function remainingSeconds(b: any) {
  return Math.max(30 * 60 - secondsPassed(b), 0);
}

function formatTime(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

async function cancelBookingClick(b: any) {
  if (!confirm("Отменить бронирование?")) return;
  try {
    await cancelBooking(b.id, auth.user.id);
    toastRef.value?.show("Бронирование отменено");
    const booking = confirmedBookings.value.find(x => x.id === b.id);
    if (booking) booking.status = "cancelled";
  } catch (e: any) {
    toastRef.value?.show(e.response?.data?.detail || "Ошибка отмены");
  }
}

onMounted(async () => {
  loading.value = true;
  try {
    const all = await getMyBookings(auth.user.id);
    confirmedBookings.value = all.filter((b: any) =>
      ["confirmed", "cancelled"].includes(b.status)
    );
    for (const b of confirmedBookings.value) {
      if (!tripMap.value[b.trip_id]) {
        try {
          const trip = await getTripById(b.trip_id);
          tripMap.value[b.trip_id] = trip;
          if (trip && trip.owner_id && !drivers.value[b.trip_id]) {
            try {
              const driver = await getUserById(trip.owner_id);
              drivers.value[b.trip_id] = driver;
            } catch {
              drivers.value[b.trip_id] = {};
            }
          }
        } catch {
          tripMap.value[b.trip_id] = {};
        }
      }
    }
  } catch {
    confirmedBookings.value = [];
    toastRef.value?.show("Ошибка загрузки бронирований");
  }
  loading.value = false;
});

onMounted(() => {
  const tg = (window as any).Telegram?.WebApp;
  if (tg?.BackButton) {
    tg.BackButton.show();
    tg.BackButton.onClick(() => {
      useSmartBack(router);
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
.my-bookings-page {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  overflow-y: auto;
  background: transparent;
}

.actions {
  display: flex;
  gap: 8px;
}

.btn-cancel {
  background: #e53935;
  color: white;
  border: none;
  padding: 9px 14px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
}
.btn-cancel:hover {
  background: #c62828;
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
  margin: 38px auto;
  padding: 20px 16px 28px;
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
  color: var(--color-text-primary, #232323);
  text-align: center;
}

.tabs {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-bottom: 18px;
}
.tabs button {
  padding: 8px 18px;
  border-radius: 8px;
  border: 1.4px solid var(--color-primary, #007bff);
  background: white;
  color: var(--color-primary, #007bff);
  cursor: pointer;
  font-weight: 500;
}
.tabs button.active {
  background: var(--color-primary, #007bff);
  color: white;
}

.empty-text {
  color: var(--color-text-secondary, #888);
  font-size: 15px;
  text-align: center;
  margin-top: 32px;
}

.booking-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.booking-card {
  background: rgba(255, 255, 255, 0.75);
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.row {
  font-size: 15px;
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
  font-size: 15px;
  color: var(--color-text-primary, #232323);
}
.status.confirmed {
  background: #c6efd4;
  color: #168749;
  font-weight: 600;
  padding: 4px 14px;
  border-radius: 9px;
  font-size: 14px;
}
.status.pending {
  background: #ffe6a3;
  color: #b78d03;
  font-weight: 600;
  padding: 4px 14px;
  border-radius: 9px;
  font-size: 14px;
}
.status.cancelled {
  background: #ffd6d6;
  color: #b83030;
  font-weight: 600;
  padding: 4px 14px;
  border-radius: 9px;
  font-size: 14px;
}
.driver-info {
  margin-top: 10px;
  font-size: 15px;
  color: var(--color-text-secondary, #555);
}
.driver-info a {
  color: var(--color-primary, #007bff);
  text-decoration: underline;
}
.btn-outline {
  background: transparent;
  color: var(--color-primary, #007bff);
  border: 1px solid var(--color-primary, #007bff);
  margin-top: 8px;
  font-size: 15px;
  border-radius: 8px;
  padding: 9px 18px;
  cursor: pointer;
  transition: background 0.2s;
}
.btn-outline:hover {
  background: rgba(0, 123, 255, 0.05);
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

</style>