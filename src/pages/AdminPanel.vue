<template>
  <div class="admin-page">
    <div class="background-img"></div>

    <div class="admin-content">
      <h2 class="title">Админ-панель</h2>

      <div class="tabs">
        <button :class="['tab', { active: tab === 'users' }]" @click="tab = 'users'">Пользователи</button>
        <button :class="['tab', { active: tab === 'trips' }]" @click="tab = 'trips'">Поездки</button>
        <button :class="['tab', { active: tab === 'stats' }]" @click="tab = 'stats'">Аналитика</button>
      </div>

      <!-- Пользователи -->
      <div v-if="tab === 'users'">
        <table class="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Имя</th>
              <th>Подробнее</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in users" :key="user.id">
              <td>{{ user.id }}</td>
              <td>{{ user.first_name }} <span v-if="user.last_name">{{ user.last_name }}</span></td>
              <td>
                <button class="info-btn" @click="showUser(user)">Подробнее</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Поездки -->
      <div v-else-if="tab === 'trips'" class="transparent-section">
        <table class="trips-table">

          <thead>
            <tr>
              <th>ID</th>
              <th>Имя водителя</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="trip in trips" :key="trip.id">
              <td>{{ trip.id }}</td>
              <td>
                <span v-if="getDriverName(trip.owner_id)">{{ getDriverName(trip.owner_id) }}</span>
                <span v-else>—</span>
              </td>
              <td>
                <button class="btn" @click="showTrip(trip)">Подробнее</button>
                <button class="btn btn-danger" @click="deleteTrip(trip.id)">Удалить</button>
              </td>

            </tr>
          </tbody>
        </table>
      </div>

      <!-- Аналитика -->
      <div v-else-if="tab === 'stats'" class="stats-section">
        <div>🚗 Всего поездок: <b>{{ stats.trips_count ?? '—' }}</b></div>
        <div>👥 Всего бронирований: <b>{{ stats.bookings_count ?? '—' }}</b></div>
        <div>⭐️ Средний рейтинг пользователей: <b>{{ stats.avg_driver_rating?.toFixed(2) ?? '—' }}</b></div>
      </div>

      <!-- Модалка пользователя -->
      <div v-if="modalUser" class="modal-overlay" @click.self="closeModal">
        <div class="modal">
          <h3>Пользователь #{{ modalUser.id }}</h3>
          <div class="modal-content">
            <p><b>Имя:</b> {{ modalUser.first_name }} <span v-if="modalUser.last_name">{{ modalUser.last_name }}</span></p>
            <p><b>Telegram ID:</b> {{ modalUser.telegram_id }}</p>
            <p><b>Telegram:</b>
              <a v-if="modalUser.username" :href="`https://t.me/${modalUser.username}`" target="_blank">@{{ modalUser.username }}</a>
              <span v-else>—</span>
            </p>
            <p>
              <b>Роль:</b>
              <span class="role-select">
                <button
                  :class="['role-option', modalUser.is_driver ? 'selected' : '']"
                  @click="setRole(true)"
                >Водитель</button>
                <button
                  :class="['role-option', !modalUser.is_driver ? 'selected' : '']"
                  @click="setRole(false)"
                >Пассажир</button>
              </span>
            </p>
            <p>
              <b>Может создавать:</b>
              <label class="switch">
                <input type="checkbox" v-model="modalUser.active_driver" @change="toggleActive(modalUser)">
                <span class="slider"></span>
              </label>
            </p>
            <p><b>Номер машины:</b> {{ modalUser.car_number || '—' }}</p>
            <p><b>Марка машины:</b> {{ modalUser.car_brand || '—' }}</p>
          </div>
          <div class="modal-actions">
            <button class="delete-btn" @click="deleteUserById(modalUser.telegram_id)">Удалить</button>
            <button class="btn close-btn" @click="closeModal">Закрыть</button>
          </div>
        </div>
      </div>

      <!-- Модалка поездки -->
      <div v-if="modalTrip" class="modal-overlay" @click.self="closeModal">
        <div class="modal">
          <h3>Поездка #{{ modalTrip.id }}</h3>
          <div class="modal-content">
            <p><b>Маршрут:</b> {{ modalTrip.from_ }} — {{ modalTrip.to }}</p>
            <p><b>Дата:</b> {{ modalTrip.date }} {{ modalTrip.time }}</p>
            <p><b>Статус:</b> {{ modalTrip.status }}</p>
            <p><b>Водитель (ID):</b> {{ modalTrip.owner_id }}</p>
            <p v-if="modalTrip.description"><b>Особенности:</b> {{ modalTrip.description }}</p>
            <p v-if="modalTrip.car_brand || modalTrip.car_number">
              <b>Машина:</b>
              <span v-if="modalTrip.car_brand">{{ modalTrip.car_brand }}</span>
              <span v-if="modalTrip.car_brand && modalTrip.car_number">,</span>
              <span v-if="modalTrip.car_number"> номер {{ modalTrip.car_number }}</span>
            </p>
          </div>
          <div class="modal-actions">
            <button class="delete-btn" @click="deleteTrip(modalTrip.id)">Удалить</button>
            <button class="btn close-btn" @click="closeModal">Закрыть</button>
          </div>
        </div>
      </div>

      <Toast ref="toastRef" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useAuthStore } from '@/store/auth';
import { useRouter } from 'vue-router';
import Toast from '@/components/Toast.vue';

import {
  getAllUsers,
  updateUserRole,
  updateUserActiveDriver,
  deleteUserByTelegramId
} from '@/api/admin';
import {
  getAllTrips,
  getAdminStats,
  deleteTripById
} from '@/api/admin-trips';

const router = useRouter();
const auth = useAuthStore();

const ADMIN_IDS = [363320196, 6931781449];
if (!ADMIN_IDS.includes(auth.user?.telegram_id)) {
  router.replace('/main-screen');
}

const tab = ref('users');
const users = ref<any[]>([]);
const trips = ref<any[]>([]);
const stats = ref({ trips_count: 0, bookings_count: 0, avg_driver_rating: 0 });

const toastRef = ref<InstanceType<typeof Toast> | null>(null);
const modalUser = ref<any | null>(null);
const modalTrip = ref<any | null>(null);

function showUser(user: any) {
  modalUser.value = { ...user };
}
function showTrip(trip: any) {
  modalTrip.value = { ...trip };
}
function closeModal() {
  modalUser.value = null;
  modalTrip.value = null;
}

function getDriverName(owner_id: number) {
  const user = users.value.find(u => u.id === owner_id);
  return user ? `${user.first_name} ${user.last_name || ''}` : null;
}

async function loadUsers() {
  try {
    users.value = await getAllUsers();
  } catch {
    toastRef.value?.show('Ошибка загрузки пользователей!');
  }
}
async function loadTrips() {
  try {
    trips.value = await getAllTrips();
  } catch {
    toastRef.value?.show('Ошибка загрузки поездок!');
  }
}
async function loadStats() {
  try {
    stats.value = await getAdminStats();
  } catch {
    toastRef.value?.show('Ошибка загрузки статистики!');
  }
}

async function setRole(isDriver: boolean) {
  if (!modalUser.value) return;
  try {
    modalUser.value.is_driver = isDriver;
    await updateUserRole(modalUser.value.id, isDriver);
    await loadUsers();
    toastRef.value?.show('Роль обновлена');
  } catch {
    toastRef.value?.show('Ошибка обновления роли!');
  }
}
async function toggleActive(user: any) {
  try {
    user.active_driver = !!user.active_driver;
    await updateUserActiveDriver(user.id, user.active_driver);
    await loadUsers();
    toastRef.value?.show('Статус обновлён');
  } catch {
    toastRef.value?.show('Ошибка обновления статуса!');
  }
}
async function deleteUserById(telegram_id: number) {
  if (!confirm('Удалить пользователя?')) return;
  try {
    await deleteUserByTelegramId(telegram_id);
    users.value = users.value.filter(u => u.telegram_id !== telegram_id);
    closeModal();
    toastRef.value?.show('Пользователь удалён');
  } catch (e) {
    toastRef.value?.show('Ошибка удаления пользователя!');
    console.error('Ошибка удаления:', e);
  }
}
async function deleteTrip(tripId: number) {
  if (!confirm('Удалить поездку?')) return;
  try {
    await deleteTripById(tripId);
    trips.value = trips.value.filter(t => t.id !== tripId);
    closeModal();
    toastRef.value?.show('Поездка удалена');
  } catch {
    toastRef.value?.show('Ошибка при удалении поездки!');
  }
}

onMounted(() => {
  if (tab.value === 'users') loadUsers();
  if (tab.value === 'trips') loadTrips();
  if (tab.value === 'stats') loadStats();
});
watch(tab, (newTab) => {
  if (newTab === 'users') loadUsers();
  if (newTab === 'trips') loadTrips();
  if (newTab === 'stats') loadStats();
});
</script>

<style scoped>
.admin-page {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: transparent;
}

.background-img {
  position: fixed;
  inset: 0;
  background: url('@/assets/secondary.webp') center center / cover no-repeat;
  z-index: 0;
  pointer-events: none;
  user-select: none;
  animation: bg-fade-in 1s ease-in-out;
}

@keyframes bg-fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

.admin-content {
  position: relative;
  z-index: 2;
  max-width: 360px;
  margin: 32px auto;
  background: rgba(255, 255, 255, 0.45);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  padding: 24px 20px;
  border-radius: 18px;
  box-shadow: 0 6px 14px rgba(0, 0, 0, 0.1);
  overflow-y: auto;
  max-height: calc(100vh - 64px);
}

.title {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 16px;
  color: var(--color-text-primary);
  text-align: center;
}

/* Tabs */
.admin-tabs {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-bottom: 20px;
  padding-bottom: 4px;
}
.tab {
  padding: 6px 10px;
  font-size: 13px;
  border: 1px solid var(--color-primary);
  border-radius: 6px;
  background: transparent;
  color: var(--color-primary);
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  flex-shrink: 0;
}
.tab.active {
  background: var(--color-primary);
  color: white;
}

/* Таблицы */
.users-table, .trips-table {
  width: 100%;
  border-collapse: collapse;
  background: rgba(255, 255, 255, 0.45);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.05);
  margin-top: 16px;
}
.users-table th, .users-table td,
.trips-table th, .trips-table td {
  padding: 10px;
  font-size: 15px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  background: transparent;
  text-align: center;
  color: #222;
}
.users-table th, .trips-table th {
  font-weight: bold;
  background: rgba(255, 255, 255, 0.2);
}

/* Кнопки */
.btn, .close-btn, .info-btn {
  padding: 9px 18px;
  font-size: 14px;
  font-weight: 500;
  border: 1.5px solid #007bff;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.6);
  color: #007bff;
  cursor: pointer;
  transition: background 0.17s;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}
.btn:hover, .info-btn:hover, .close-btn:hover {
  background: rgba(255, 255, 255, 0.8);
}
.btn:active, .info-btn:active {
  background: #e3eeff;
}

.delete-btn {
  background: rgba(229, 57, 53, 0.85);
  color: white;
  border: none;
  border-radius: 7px;
  font-size: 15px;
  padding: 8px 12px;
  cursor: pointer;
  transition: background 0.13s;
}
.delete-btn:hover {
  background: rgba(198, 40, 40, 0.9);
}

/* Модалка */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(30,30,30,0.14);
  z-index: 99999;
  display: flex;
  align-items: center;
  justify-content: center;
}
.modal {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 35px 26px 28px 26px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.09);
  min-width: 280px;
  max-width: 99vw;
  text-align: left;
}
.modal-content p {
  margin: 10px 0;
  font-size: 15px;
}
.modal-actions {
  display: flex;
  gap: 14px;
  margin-top: 19px;
  justify-content: flex-end;
}

/* Статистика */
.stats-section {
  padding: 40px;
  text-align: center;
  font-size: 17px;
}

/* Роль пользователя */
.role-select {
  display: inline-flex;
  border-radius: 11px;
  overflow: hidden;
  box-shadow: 0 0 0 1.5px #007bff inset;
  margin-left: 12px;
}
.role-option {
  border: none;
  padding: 6px 18px;
  font-size: 15px;
  font-weight: 500;
  background: #fff;
  color: #007bff;
  cursor: pointer;
  transition: background 0.17s, color 0.13s;
}
.role-option.selected {
  background: #007bff;
  color: #fff;
}
.role-option:not(.selected):hover {
  background: #e6f8ff;
}

/* Переключатель */
.switch {
  position: relative;
  display: inline-block;
  width: 60px;
  height: 32px;
  margin-left: 10px;
}
.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}
.slider {
  position: absolute;
  cursor: pointer;
  inset: 0;
  background-color: #EEE;
  border-radius: 32px;
  transition: .4s;
}
.slider:before {
  position: absolute;
  content: "";
  height: 26px;
  width: 26px;
  left: 3px;
  bottom: 3px;
  background-color: #fff;
  border-radius: 50%;
  transition: .4s;
  box-shadow: 0 1px 3px rgba(30,30,30,0.07);
}
.switch input:checked + .slider {
  background-color: #007bff;
}
.switch input:checked + .slider:before {
  transform: translateX(28px);
}
</style>
