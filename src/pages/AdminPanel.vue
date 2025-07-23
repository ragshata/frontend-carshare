<template>
  <div class="admin-page">
    <div class="background-img"></div>

    <div class="admin-content">
      <h2 class="title">Админ-панель</h2>

      <div class="tabs">
        <button :class="['tab', { active: tab === 'users' }]" @click="tab = 'users'">Пользователи</button>
        <button :class="['tab', { active: tab === 'trips' }]" @click="tab = 'trips'">Поездки</button>
        <button :class="['tab', { active: tab === 'reviews' }]" @click="tab = 'reviews'">Отзывы</button>
        <button :class="['tab', { active: tab === 'stats' }]" @click="tab = 'stats'">Ааналитика</button>
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
      <!-- Отзывы -->
      <div v-else-if="tab === 'reviews'" class="transparent-section">
        <table class="trips-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Имя</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="review in reviews" :key="review.id">
              <td>{{ review.id }}</td>
              <td>{{ getUserName(review.author_id) }}</td>
              <td>
                <button class="btn" @click="showReview(review)">Подробнее</button>
                <button class="btn btn-danger" @click="deleteReview(review.id)">Удалить</button>
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
      <!-- Модалка отзыва -->
      <div v-if="modalReview" class="modal-overlay" @click.self="closeModal">
        <div class="modal">
          <h3>Отзыв #{{ modalReview.id }}</h3>
          <div class="modal-content">
            <p><b>Автор:</b> {{ getUserName(modalReview.author_id) }}</p>
            <p><b>Водитель:</b> {{ getUserName(modalReview.driver_id) }}</p>
            <p><b>Оценка:</b> {{ modalReview.rating }}</p>
            <p><b>Комментарий:</b> {{ modalReview.text || '—' }}</p>
          </div>
          <div class="modal-actions">
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
import { getDriverReviews, deleteReviewById, getAllReviews } from '@/api/reviews';
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
const reviews = ref<any[]>([]);

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
const modalReview = ref<any | null>(null);


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
function showReview(review: any) {
  modalReview.value = { ...review };
}
async function loadReviews() {
  try {
    const allReviews = await getAllReviews(); // 0 вернёт ВСЕ отзывы
    reviews.value = allReviews;
  } catch {
    toastRef.value?.show('Ошибка загрузки отзывов!');
  }
}
watch(tab, (newTab) => {
  if (newTab === 'users') loadUsers();
  if (newTab === 'trips') loadTrips();
  if (newTab === 'stats') loadStats();
  if (newTab === 'reviews') loadReviews();
});


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
function getUserName(userId: number) {
  const user = users.value.find(u => u.id === userId);
  return user ? `${user.first_name} ${user.last_name || ''}` : `ID ${userId}`;
}
async function deleteReview(id: number) {
  if (!confirm('Удалить отзыв?')) return;
  try {
    await deleteReviewById(id);
    reviews.value = reviews.value.filter(r => r.id !== id);
    toastRef.value?.show('Отзыв удалён');
  } catch {
    toastRef.value?.show('Ошибка при удалении отзыва!');
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
.admin-wrap {
  max-width: 900px;
  margin: 36px auto 0 auto;
  padding: 24px 8px 44px 8px;
  background: #fff;
  border-radius: 22px;
  box-shadow: 0 2px 12px rgba(60,80,120,0.06);
}
.title {
  font-size: 25px;
  font-weight: bold;
  margin-bottom: 20px;
  color: #232323;
  text-align: center;
}



/* Маленькие tabs, в строку и с прокруткой */
.admin-tabs.small {
  display: flex;
  flex-wrap: nowrap;
  overflow-x: auto;
  gap: 7px;
  justify-content: flex-start;
  margin-bottom: 15px;
}
.admin-tabs.small button {
  font-size: 13px;
  padding: 7px 14px;
  border-radius: 8px;
  min-width: 92px;
  background: #fff;
  border: 1.5px solid #007bff;
  color: #007bff;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.14s;
  white-space: nowrap;
}
.admin-tabs.small button.active,
.admin-tabs.small button:hover {
  background: #e8f1ff;
}

/* Таблицы */
.users-table, .trips-table {
  width: 100%;
  border-collapse: collapse;
  background: #fff;
  margin-top: 12px;
}
.users-table th, .users-table td,
.trips-table th, .trips-table td {
  padding: 11px 10px;
  font-size: 15px;
  border-bottom: 1px solid #eee;
  text-align: center;
}
.users-table th, .trips-table th {
  background: #f8fafc;
  font-weight: 600;
  color: #222;
}
.users-table td, .trips-table td {
  background: #fff;
}
.info-btn {
  background: #fff;
  color: #007bff;
  border: 1.5px solid #007bff;
  border-radius: 9px;
  font-size: 15px;
  font-weight: 500;
  padding: 5px 18px;
  cursor: pointer;
  transition: background 0.14s;
}
.info-btn:hover {
  background: #e8f1ff;
}
.stats-section {
  padding: 40px;
  text-align: center;
  font-size: 17px;
}
.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(30,30,30,0.14);
  z-index: 99999;
  display: flex;
  align-items: center;
  justify-content: center;
}
.modal {
  background: #fff;
  border-radius: 20px;
  padding: 35px 26px 28px 26px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.09);
  min-width: 280px;
  max-width: 99vw;
  text-align: left;
}
.delete-btn.small {
  font-size: 13px;
  padding: 6px 10px;
  min-width: auto;
}
.modal-content p {
  margin: 10px 0 10px 0;
  font-size: 15px;
}
.modal-actions {
  display: flex;
  gap: 14px;
  margin-top: 19px;
  justify-content: flex-end;
}
.btn, .close-btn {
  background: #fff;
  color: #007bff;
  border: 1.5px solid #007bff;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 500;
  padding: 9px 22px;
  cursor: pointer;
  transition: background 0.17s;
}
.btn:hover, .close-btn:hover {
  background: #e8f1ff;
}
.delete-btn {
  background: #e53935;
  color: white;
  border: none;
  border-radius: 7px;
  font-size: 15px;
  padding: 8px 12px;
  cursor: pointer;
  transition: background 0.13s;
  min-width: 80px;
}
.delete-btn:hover {
  background: #c62828;
}
.role-select {
  display: inline-flex;
  border-radius: 11px;
  overflow: hidden;
  box-shadow: 0 0 0 1.5px #007bff inset;
  margin-left: 12px;
  vertical-align: middle;
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
  outline: none;
}
.role-option.selected {
  background: #007bff;
  color: #fff;
}
.role-option:not(.selected):hover {
  background: #e6f8ff;
}
.switch {
  position: relative;
  display: inline-block;
  width: 60px;
  height: 32px;
  margin-left: 10px;
  vertical-align: middle;
}
.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}
.slider {
  position: absolute;
  cursor: pointer;
  top: 0; left: 0; right: 0; bottom: 0;
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

.admin-tabs {
  display: flex;
  flex-wrap: nowrap;
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
  max-width: 48%;
  text-overflow: ellipsis;
  overflow: hidden;
}

.tab.active {
  background: var(--color-primary);
  color: white;
}

@keyframes bg-fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}
.btn {
  padding: 11px;
  font-size: 14px;
  font-weight: 600;
  border: none;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.65);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  color: #007bff;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  transition: background 0.18s;
  cursor: pointer;
  min-width: 90px;
}
.btn:hover {
  background: rgba(255, 255, 255, 0.8);
}
.btn:active {
  background: #e3eeff;
}
.btn-danger {
  background: rgba(229, 57, 53, 0.85);
  color: white;
}
.btn-danger:hover {
  background: rgba(198, 40, 40, 0.9);
}
.trips-table {
  width: 100%;
  border-collapse: collapse;
  background: rgba(255, 255, 255, 0.45);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border-radius: 12px;
  overflow: hidden;
}

.trips-table th, .trips-table td {
  padding: 10px;
  font-size: 15px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  color: #222;
  background: transparent; /* убираем белую подложку */
  text-align: center;
}

.trips-table th {
  font-weight: bold;
  background: rgba(255, 255, 255, 0.2);
}

</style>