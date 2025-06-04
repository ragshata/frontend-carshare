<template>
  <div class="bookings-page">
    <div class="top-row">
      <button class="btn-back" @click="goBack">← Назад</button>
      <h2 class="title">Мои бронирования</h2>
    </div>

    <div v-if="loading" class="empty-text">
      Загрузка...
    </div>
    <div v-else-if="bookings.length === 0" class="empty-text">
      Нет активных бронирований
    </div>

    <div v-else class="bookings-list">
      <div
        class="booking-card"
        v-for="booking in bookings"
        :key="booking.id"
      >
        <div class="row bold">
          {{ booking.trip?.from_city || "?" }} — {{ booking.trip?.to_city || "?" }}
        </div>
        <div class="row">
          🗓 {{ booking.trip?.date || "?" }} &nbsp;&nbsp; ⏰ {{ booking.trip?.time || "?" }}
        </div>
        <div class="row">
          💸 {{ booking.trip?.price || "?" }}₽ &nbsp; 👥 {{ booking.trip?.seats || "?" }} мест
        </div>
        <div class="row">
          👤 Водитель: {{ booking.trip?.driver_name || "?" }}
        </div>
        <button class="btn-cancel" @click="confirmCancel(booking.id)">
          Отменить бронь
        </button>
      </div>
    </div>
    <Toast ref="toastRef" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { getBookings, deleteBooking } from '@/api/bookings';
import Toast from '@/components/Toast.vue';
import { useAuthStore } from '@/store/auth';

const router = useRouter();
const toastRef = ref<InstanceType<typeof Toast> | null>(null);
const bookings = ref<any[]>([]);
const loading = ref(true);

const auth = useAuthStore();

function goBack() {
  router.push('/main');
}

async function loadBookings() {
  loading.value = true;
  try {
    // Подгружаем бронирования пользователя (user_id)
    const result = await getBookings(auth.user.id);
    bookings.value = Array.isArray(result) ? result : [];
  } catch (err) {
    toastRef.value?.show('❌ Ошибка загрузки');
    bookings.value = [];
  } finally {
    loading.value = false;
  }
}

// Подтверждение и удаление бронирования
async function confirmCancel(id: number) {
  if (window.confirm("Вы точно хотите отменить это бронирование?")) {
    await handleCancel(id);
  }
}
async function handleCancel(id: number) {
  try {
    await deleteBooking(id);
    bookings.value = bookings.value.filter(b => b.id !== id);
    toastRef.value?.show('✅ Бронирование отменено!');
  } catch (err) {
    toastRef.value?.show('❌ Не удалось отменить бронь');
  }
}

onMounted(loadBookings);
</script>

<style scoped>
.bookings-page {
  padding: 16px;
  background: var(--color-background);
  min-height: 100vh;
}
.top-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}
.btn-back {
  background: transparent;
  border: 1px solid var(--color-primary);
  color: var(--color-primary);
  border-radius: 8px;
  font-size: 15px;
  padding: 8px 16px;
  cursor: pointer;
  transition: background 0.2s;
}
.title {
  font-size: 20px;
  font-weight: bold;
  color: var(--color-text-primary);
  flex: 1;
  text-align: center;
  margin: 0;
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
  box-shadow: 0 2px 6px rgba(0,0,0,0.08);
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.row {
  font-size: 14px;
  color: var(--color-text-secondary);
}
.bold {
  font-weight: bold;
  font-size: 16px;
  color: var(--color-text-primary);
}
.btn-cancel {
  margin-top: 8px;
  background: #e53935;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 10px;
  font-size: 15px;
  cursor: pointer;
  transition: background 0.2s;
}
.btn-cancel:hover {
  background: #c62828;
}
</style>
