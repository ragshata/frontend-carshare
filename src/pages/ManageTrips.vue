<template>
  <div class="manage-trips-page">
    <h2 class="title">Мои поездки</h2>

    <div class="tabs">
      <button
        v-for="tab in tabs"
        :key="tab"
        :class="['tab', { active: currentTab === tab }]"
        @click="handleTabClick(tab)"
      >
        {{ tab }}
      </button>
    </div>

    <div v-if="loading" class="empty-text">Загрузка...</div>
    <div v-else-if="filteredTrips.length === 0" class="empty-text">Нет поездок</div>
    <div v-else class="trip-list">
      <div
        v-for="trip in filteredTrips"
        :key="trip.id"
        class="trip-card"
      >
        <div class="row between bold">
          {{ trip.from_ }} — {{ trip.to }}
          <span>{{ trip.price }} сомони (TJS)</span>
        </div>
        <div class="row">
          🗓 {{ trip.date }} &nbsp;&nbsp; ⏰ {{ trip.time }}
        </div>
        <div class="row">
          👥 Мест: {{ trip.seats }} &nbsp; 
          <span v-if="trip.status === 'active'">🟢 Активна</span>
          <span v-else-if="trip.status === 'draft'">💤 Черновик</span>
          <span v-else-if="trip.status === 'done'">✅ Завершена</span>
          <span v-else>⏳ {{ trip.status }}</span>
        </div>
        <div class="actions">
          <!-- Кнопка завершить только для активных -->
          <button
            v-if="trip.status === 'active'"
            class="btn btn-done"
            @click="finishTrip(trip.id)"
          >
            ✅ Завершить поездку
          </button>
          <!-- Кнопка удалить только для черновиков -->
          <button
            v-if="trip.status === 'draft'"
            class="btn btn-danger"
            @click="deleteTrip(trip.id)"
          >
            🗑 Удалить
          </button>
          <button
            v-if="trip.status === 'draft'"
            class="btn btn-outline"
            @click="publishTrip(trip.id)"
          >
            🚀 Опубликовать
          </button>
          <button
            class="btn btn-outline"
            @click="goToPassengers(trip.id)"
          >
            👥 Пассажиры
          </button>
          <!-- Новая кнопка Редактировать -->
          <button
            class="btn btn-outline"
            @click="editTrip(trip.id)"
          >
            ✏️ Редактировать
          </button>
        </div>
      </div>
    </div>
    <Toast ref="toastRef" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/store/auth';
import { getMyTrips, deleteTrip as apiDeleteTrip, publishTrip as apiPublishTrip, finishTrip as apiFinishTrip } from '@/api/trips';
import Toast from '@/components/Toast.vue';
import { useSmartBack } from '@/utils/navigation';

const router = useRouter();
const auth = useAuthStore();

const tabs = ['Активные', 'История', 'Черновики'];
const currentTab = ref(tabs[0]);

const allTrips = ref<any[]>([]);
const loading = ref(true);
const toastRef = ref<InstanceType<typeof Toast> | null>(null);

const statusMap: Record<string, string> = {
  'Активные': 'active',
  'История': 'done',
  'Черновики': 'draft'
};

async function loadTrips() {
  loading.value = true;
  try {
    allTrips.value = await getMyTrips(auth.user.id);
  } catch (e) {
    allTrips.value = [];
    toastRef.value?.show('Ошибка загрузки поездок!');
  } finally {
    loading.value = false;
  }
}

const filteredTrips = computed(() =>
  allTrips.value.filter(trip => trip.status === statusMap[currentTab.value])
);

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

function handleTabClick(tab: string) {
  currentTab.value = tab;
}

function goToPassengers(tripId: number) {
  router.push(`/trip/${tripId}/passengers`);
}

function editTrip(tripId: number) {
  router.push(`/trip/${tripId}/edit`);
}

async function deleteTrip(id: number) {
  if (!confirm('Удалить поездку?')) return;
  try {
    await apiDeleteTrip(id);
    allTrips.value = allTrips.value.filter(trip => trip.id !== id);
    toastRef.value?.show('Поездка удалена');
  } catch (e) {
    toastRef.value?.show('Ошибка при удалении');
  }
}

async function publishTrip(id: number) {
  try {
    await apiPublishTrip(id);
    toastRef.value?.show('Поездка опубликована');
    await loadTrips();
  } catch (e) {
    toastRef.value?.show('Ошибка публикации');
  }
}

// Новая функция завершения поездки
async function finishTrip(id: number) {
  try {
    await apiFinishTrip(id);
    toastRef.value?.show('Поездка завершена');
    await loadTrips();
  } catch (e) {
    toastRef.value?.show('Ошибка завершения');
  }
}

onMounted(() => {
  const tg = (window as any).Telegram?.WebApp;
  if (tg?.BackButton) {
    tg.BackButton.show();
    tg.BackButton.onClick(() => {
      useSmartBack(router); // передай свой router
    });
  }
});
</script>

<style scoped>
.manage-trips-page {
  padding: 16px;
  background: var(--color-background);
  min-height: 100vh;
}
.title {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 16px;
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
  transition: background 0.2s ease;
}
.tabs {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 20px;
}
.tab {
  padding: 10px 16px;
  border: 1px solid var(--color-primary);
  border-radius: 8px;
  background: transparent;
  color: var(--color-primary);
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;
}
.tab.active {
  background: var(--color-primary);
  color: white;
}
.empty-text {
  color: var(--color-text-secondary);
  font-size: 16px;
  text-align: center;
  margin-top: 32px;
}
.trip-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.trip-card {
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
.row.between {
  justify-content: space-between;
}
.bold {
  font-weight: bold;
  font-size: 16px;
  color: var(--color-text-primary);
}
.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
}
.btn {
  background: var(--color-primary);
  color: white;
  border: none;
  padding: 10px 18px;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.2s;
}
.btn-outline {
  background: transparent;
  color: var(--color-primary);
  border: 1px solid var(--color-primary);
}
.btn-danger {
  background: #e53935;
  color: white;
}
.btn-danger:hover {
  background: #b71c1c;
}
.btn-done {
  background: #1bc47d;
  color: white;
}
.btn-done:hover {
  background: #17985d;
}
</style>
