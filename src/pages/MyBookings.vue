<template>
  <div class="my-bookings-page">
    <h2 class="title">Мои бронирования</h2>

    <div v-if="loading" class="empty-text">Загрузка...</div>
    <div v-else-if="bookings.length === 0" class="empty-text">Нет подтверждённых бронирований</div>
    <div v-else class="booking-list">
      <div class="booking-card" v-for="b in bookings" :key="b.id">
        <div class="row between bold">
          {{ b.trip?.from_ }} — {{ b.trip?.to }}
          <span>{{ b.trip?.price }}₽</span>
        </div>
        <div class="row">
          🗓 {{ b.trip?.date }} &nbsp; ⏰ {{ b.trip?.time }}
        </div>
        <div class="row">
          <span :class="['status', b.status]">{{ getStatusRu(b.status) }}</span>
        </div>
        <div v-if="b.status === 'confirmed' && b.driver" class="driver-block">
          Водитель:
          <a
            v-if="b.driver.username"
            :href="`https://t.me/${b.driver.username}`"
            target="_blank"
          >
            @{{ b.driver.username }}
          </a>
          <span v-else>Нет username</span>
        </div>
      </div>
    </div>
    <Toast ref="toastRef" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { useAuthStore } from '@/store/auth';
import { getMyBookings } from '@/api/bookings';
import { getTripById } from '@/api/trips';
import { getUserById } from '@/api/users'; // если такой нет — создай!
import Toast from '@/components/Toast.vue';

const auth = useAuthStore();
const bookings = ref<any[]>([]);
const loading = ref(true);
const toastRef = ref<InstanceType<typeof Toast> | null>(null);

function getStatusRu(status: string) {
  switch (status) {
    case 'pending': return 'Ожидание подтверждения';
    case 'confirmed': return 'Подтверждено';
    case 'rejected': return 'Отклонено';
    default: return status;
  }
}

onMounted(async () => {
  loading.value = true;
  try {
    const allBookings = await getMyBookings(auth.user.id);
    // Фильтруем только подтверждённые
    const confirmed = allBookings.filter((b: any) => b.status === 'confirmed');
    // Подгружаем поездку и водителя для каждой брони
    for (const b of confirmed) {
      try {
        b.trip = await getTripById(b.trip_id);
        b.driver = b.trip ? await getUserById(b.trip.owner_id) : null;
      } catch {
        b.trip = null;
        b.driver = null;
      }
    }
    bookings.value = confirmed;
  } catch (e) {
    toastRef.value?.show('Ошибка загрузки броней');
    bookings.value = [];
  }
  loading.value = false;
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
  background: var(--color-background, #fafbfc);
  min-height: 100vh;
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
.bold {
  font-weight: bold;
  font-size: 16px;
  color: var(--color-text-primary, #232323);
  justify-content: space-between;
}
.status {
  padding: 2px 10px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: bold;
}
.status.confirmed {
  background: #d2f9e4;
  color: #217b43;
}
.status.pending {
  background: #fff1bc;
  color: #ad9700;
}
.status.rejected {
  background: #ffe0e0;
  color: #a82424;
}
.driver-block {
  margin-top: 8px;
  font-size: 15px;
}
</style>
