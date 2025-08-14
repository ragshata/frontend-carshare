<template>
  <div class="admin-page">
    <div class="background-img"></div>

    <div class="admin-content" ref="containerRef">
      <h2 class="title">Админ-панель</h2>

      <div class="tabs">
        <button :class="['tab', { active: tab === 'users' }]" @click="tab = 'users'">Пользователи</button>
        <button :class="['tab', { active: tab === 'trips' }]" @click="tab = 'trips'">Поездки</button>
        <button :class="['tab', { active: tab === 'reviews' }]" @click="tab = 'reviews'">Отзывы</button>
        <button :class="['tab', { active: tab === 'stats' }]" @click="tab = 'stats'">Аналитика</button>
        <button :class="['tab', { active: tab === 'tariffs' }]" @click="tab = 'tariffs'">Тарифы</button>
        <button :class="['tab', { active: tab === 'cities' }]" @click="tab = 'cities'">Города</button>
      </div>

      <!-- Пользователи -->
      <div v-if="tab === 'users'">
        <table class="data-table users-table">
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
                <button class="info-btn" @click="showUser(user, $event)">Подробнее</button>
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
            <tr v-for="trip in activeTrips" :key="trip.id">
              <td>{{ trip.id }}</td>
              <td>
                <span v-if="getDriverName(trip.owner_id)">{{ getDriverName(trip.owner_id) }}</span>
                <span v-else>—</span>
              </td>
              <td>
                <button class="btn" @click="showTrip(trip, $event)">Подробнее</button>
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
                <button class="btn" @click="showReview(review, $event)">Подробнее</button>
                <button class="btn btn-danger" @click="deleteReview(review.id)">Удалить</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Тарифы -->
      <div v-else-if="tab === 'tariffs'" class="transparent-section">
        <table class="trips-table">
          <thead>
            <tr>
              <th>Название</th>
              <th>Длительность (дней)</th>
              <th>Цена (сомони)</th>
              <th>Реквизиты/описание</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="tariff in tariffs" :key="tariff.id">
              <td>{{ tariff.name }}</td>
              <td>{{ tariff.duration_days }}</td>
              <td>
                <input type="number" v-model.number="tariff.price" style="width:80px; padding: 4px;" />
              </td>
              <td>
                <textarea v-model="tariff.description" rows="2" style="width:180px; padding: 4px;"></textarea>
              </td>
              <td><button class="btn" @click="saveTariff(tariff)">Сохранить</button></td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Города -->
      <div v-else-if="tab === 'cities'" class="transparent-section">
        <table class="trips-table">
          <thead>
            <tr>
              <th>Город</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="city in customCities" :key="city">
              <td>{{ city }}</td>
              <td><button class="btn btn-danger" @click="deleteCity(city)">Удалить</button></td>
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

      <!-- Слой для клика вне поповера -->
      <div v-if="detailType" class="admin-popover-layer" @click="closePopover"></div>

      <!-- Поповер: Пользователь -->
      <div
        v-if="detailType === 'user' && detUser"
        class="admin-popover"
        :class="placement"
        :style="{ left: popX + 'px', top: popY + 'px' }"
        @click.stop
      >
        <h3>Пользователь #{{ detUser.id }}</h3>
        <div class="modal-content">
          <p><b>Имя:</b> {{ detUser.first_name }} <span v-if="detUser.last_name">{{ detUser.last_name }}</span></p>
          <p><b>Telegram ID:</b> {{ detUser.telegram_id }}</p>
          <p><b>Telegram:</b>
            <a v-if="detUser.username" :href="`https://t.me/${detUser.username}`" target="_blank">@{{ detUser.username }}</a>
            <span v-else>—</span>
          </p>
          <p>
            <b>Роль:</b>
            <span class="role-select">
              <button :class="['role-option', detUser.is_driver ? 'selected' : '']" @click="setRole(true)">Водитель</button>
              <button :class="['role-option', !detUser.is_driver ? 'selected' : '']" @click="setRole(false)">Пассажир</button>
            </span>
          </p>
          <p>
            <b>Может создавать:</b>
            <label class="switch">
              <input type="checkbox" v-model="detUser.active_driver" @change="toggleActive(detUser)">
              <span class="slider"></span>
            </label>
          </p>
          <p><b>Номер машины:</b> {{ detUser.car_number || '—' }}</p>
          <p><b>Марка машины:</b> {{ detUser.car_brand || '—' }}</p>
        </div>
        <div class="modal-actions">
          <button class="delete-btn" @click="deleteUserById(detUser.telegram_id)">Удалить</button>
          <button class="btn close-btn" @click="closePopover">Закрыть</button>
        </div>
      </div>

      <!-- Поповер: Поездка -->
      <div
        v-if="detailType === 'trip' && detTrip"
        class="admin-popover"
        :class="placement"
        :style="{ left: popX + 'px', top: popY + 'px' }"
        @click.stop
      >
        <h3>Поездка #{{ detTrip.id }}</h3>
        <div class="modal-content">
          <p><b>Маршрут:</b> {{ detTrip.from_ }} — {{ detTrip.to }}</p>
          <p><b>Дата:</b> {{ detTrip.date }} {{ detTrip.time }}</p>
          <p><b>Статус:</b> {{ detTrip.status }}</p>
          <p><b>Водитель (ID):</b> {{ detTrip.owner_id }}</p>
          <p v-if="detTrip.description"><b>Особенности:</b> {{ detTrip.description }}</p>
          <p v-if="detTrip.car_brand || detTrip.car_number">
            <b>Машина:</b>
            <span v-if="detTrip.car_brand">{{ detTrip.car_brand }}</span>
            <span v-if="detTrip.car_brand && detTrip.car_number">,</span>
            <span v-if="detTrip.car_number"> номер {{ detTrip.car_number }}</span>
          </p>
        </div>
        <div class="modal-actions">
          <button class="delete-btn" @click="deleteTrip(detTrip.id)">Удалить</button>
          <button class="btn close-btn" @click="closePopover">Закрыть</button>
        </div>
      </div>

      <!-- Поповер: Отзыв -->
      <div
        v-if="detailType === 'review' && detReview"
        class="admin-popover"
        :class="placement"
        :style="{ left: popX + 'px', top: popY + 'px' }"
        @click.stop
      >
        <h3>Отзыв #{{ detReview.id }}</h3>
        <div class="modal-content">
          <p><b>Автор:</b> {{ getUserName(detReview.author_id) }}</p>
          <p><b>Водитель:</b> {{ getUserName(detReview.driver_id) }}</p>
          <p><b>Оценка:</b> {{ detReview.rating }}</p>
          <p><b>Комментарий:</b> {{ detReview.text || '—' }}</p>
        </div>
        <div class="modal-actions">
          <button class="delete-btn" @click="deleteReview(detReview.id)">Удалить</button>
          <button class="btn close-btn" @click="closePopover">Закрыть</button>
        </div>
      </div>

      <Toast ref="toastRef" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue';
import { useAuthStore } from '@/store/auth';
import { useRouter } from 'vue-router';
import { getDriverReviews, deleteReviewById, getAllReviews } from '@/api/reviews';
import { getAdminTariffs, updateTariff, Tariff } from '@/api/admin-tariffs';
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

import { getCustomCities, deleteCityByName } from "@/api/cities";

const router = useRouter();
const auth = useAuthStore();

const reviews = ref<any[]>([]);
const tariffs = ref<any[]>([]);
const users = ref<any[]>([]);
const trips = ref<any[]>([]);
const stats = ref({ trips_count: 0, bookings_count: 0, avg_driver_rating: 0 });
const customCities = ref<string[]>([]);

const toastRef = ref<InstanceType<typeof Toast> | null>(null);

const ADMIN_IDS = [363320196, 6931781449];
if (!ADMIN_IDS.includes(auth.user?.telegram_id)) {
  router.replace('/main-screen');
}

const tab = ref<'users'|'trips'|'reviews'|'stats'|'tariffs'|'cities'>('users');

const activeTrips = computed(() => trips.value.filter(t => t.status === 'active'));

function getDriverName(owner_id: number) {
  const user = users.value.find(u => u.id === owner_id);
  return user ? `${user.first_name} ${user.last_name || ''}` : null;
}
function getUserName(userId: number) {
  const user = users.value.find(u => u.id === userId);
  return user ? `${user.first_name} ${user.last_name || ''}` : `ID ${userId}`;
}

/* -------- загрузка данных -------- */
async function loadUsers() { try { users.value = await getAllUsers(); } catch { toastRef.value?.show('Ошибка загрузки пользователей!'); } }
async function loadTrips() { try { trips.value = await getAllTrips(); } catch { alert('Ошибка загрузки поездок'); } }
async function loadStats() { try { stats.value = await getAdminStats(); } catch { toastRef.value?.show('Ошибка загрузки статистики!'); } }
async function loadReviews() { try { reviews.value = await getAllReviews(); } catch { toastRef.value?.show('Ошибка загрузки отзывов!'); } }
async function loadTariffs() { try { tariffs.value = (await getAdminTariffs()).slice(0, 3); } catch { toastRef.value?.show('Ошибка загрузки тарифов!'); } }
async function saveTariff(tariff: any) {
  try {
    await updateTariff(tariff.id, { price: tariff.price, description: tariff.description });
    toastRef.value?.show('Тариф обновлён');
    await loadTariffs();
  } catch {
    toastRef.value?.show('Ошибка сохранения тарифа!');
  }
}

async function loadCustomCities() {
  try { customCities.value = await getCustomCities(); }
  catch { toastRef.value?.show('Ошибка загрузки городов'); }
}
async function deleteCity(city: string) {
  if (!confirm(`Удалить город "${city}"?`)) return;
  try {
    await deleteCityByName(city);
    await loadCustomCities();
    toastRef.value?.show('Город удалён');
  } catch {
    toastRef.value?.show('Ошибка удаления города');
  }
}

/* -------- поповер (позиционирование рядом с кнопкой) -------- */
const containerRef = ref<HTMLElement | null>(null);
const detailType = ref<null | 'user' | 'trip' | 'review'>(null);
const detail = ref<any | null>(null);
const popX = ref(0);
const popY = ref(0);
const placement = ref<'bottom' | 'top'>('bottom');

const detUser = computed(() => detailType.value === 'user' ? detail.value : null);
const detTrip = computed(() => detailType.value === 'trip' ? detail.value : null);
const detReview = computed(() => detailType.value === 'review' ? detail.value : null);

function computePopoverPosition(evt: MouseEvent, prefer: 'bottom'|'top' = 'bottom') {
  const container = containerRef.value;
  if (!container) return;
  const target = (evt.currentTarget as HTMLElement) || (evt.target as HTMLElement);
  const btnRect = target.getBoundingClientRect();
  const contRect = container.getBoundingClientRect();

  // координаты центра кнопки относительно контейнера
  const x = (btnRect.left - contRect.left) + btnRect.width / 2;
  // базовая Y-координата (внутри прокручиваемого контейнера)
  const baseY = container.scrollTop + (btnRect.top - contRect.top);

  // оценка высоты поповера (для простого «флипа»)
  const estimatedHeight = 320; // эвристика
  const spaceBelow = (contRect.height - (btnRect.bottom - contRect.top));
  const openTop = spaceBelow < estimatedHeight;

  placement.value = openTop ? 'top' : prefer;
  popX.value = Math.max(16, Math.min(x, contRect.width - 16));
  popY.value = openTop ? baseY - 8 : baseY + btnRect.height + 8;
}

function showUser(user: any, evt: MouseEvent) {
  detailType.value = 'user';
  detail.value = { ...user };
  computePopoverPosition(evt);
}
function showTrip(trip: any, evt: MouseEvent) {
  detailType.value = 'trip';
  detail.value = { ...trip };
  computePopoverPosition(evt);
}
function showReview(review: any, evt: MouseEvent) {
  detailType.value = 'review';
  detail.value = { ...review };
  computePopoverPosition(evt);
}
function closePopover() {
  detailType.value = null;
  detail.value = null;
}

/* -------- действия из поповеров -------- */
async function setRole(isDriver: boolean) {
  if (detailType.value !== 'user' || !detail.value) return;
  try {
    detail.value.is_driver = isDriver;
    await updateUserRole(detail.value.id, isDriver);
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
    closePopover();
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
    closePopover();
    toastRef.value?.show('Поездка удалена');
  } catch {
    toastRef.value?.show('Ошибка при удалении поездки!');
  }
}
async function deleteReview(id: number) {
  if (!confirm('Удалить отзыв?')) return;
  try {
    await deleteReviewById(id);
    await loadReviews();
    closePopover();
    toastRef.value?.show('Отзыв удалён');
  } catch {
    toastRef.value?.show('Ошибка при удалении отзыва!');
  }
}

/* -------- табы / загрузки -------- */
onMounted(() => {
  if (tab.value === 'users') loadUsers();
  if (tab.value === 'trips') loadTrips();
  if (tab.value === 'stats') loadStats();
});
watch(tab, (newTab) => {
  if (newTab === 'users') loadUsers();
  if (newTab === 'trips') loadTrips();
  if (newTab === 'stats') loadStats();
  if (newTab === 'reviews') loadReviews();
  if (newTab === 'tariffs') loadTariffs();
  if (newTab === 'cities') loadCustomCities();
});
</script>

<style scoped>
.title {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 16px;
  color: var(--color-text-primary);
  text-align: center;
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
.info-btn:hover { background: #e8f1ff; }

.stats-section {
  padding: 40px;
  text-align: center;
  font-size: 17px;
}

/* Страница и фон */
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
@keyframes bg-fade-in { from { opacity: 0; } to { opacity: 1; } }

/* Контентная карточка */
.admin-content {
  position: relative; /* важно для абсолютного позиционирования поповеров */
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

/* Табы — 2 ряда (3 колонки) */
.tabs {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
  margin-bottom: 20px;
  padding-bottom: 4px;
}
.tab {
  padding: 8px 10px;
  font-size: 13px;
  border: 1px solid var(--color-primary);
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.6);
  color: var(--color-primary);
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: center;
  line-height: 1.15;
  white-space: normal;       /* позволяем перенос */
  word-break: break-word;    /* переносим длинные слова */
}
.tab.active { background: var(--color-primary); color: #fff; }

/* Кнопки */
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
  box-shadow: 0 2px 6px rgba(0,0,0,0.05);
  transition: background 0.18s;
  cursor: pointer;
  min-width: 90px;
}
.btn:hover { background: rgba(255, 255, 255, 0.8); }
.btn:active { background: #e3eeff; }
.btn-danger { background: rgba(229,57,53,0.85); color: #fff; }
.btn-danger:hover { background: rgba(198,40,40,0.9); }

/* Поповерный слой и окно */
.admin-popover-layer {
  position: absolute;
  inset: 0;
  z-index: 90;
  background: transparent; /* клики вне поповера закроют его */
}
.admin-popover {
  position: absolute;
  z-index: 91;
  transform: translateX(-50%); /* центрируем по anchor X */
  background: #fff;
  border-radius: 16px;
  padding: 16px 16px 14px 16px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.15);
  min-width: 260px;
  max-width: min(92vw, 340px);
  text-align: left;
}
.admin-popover.bottom::after,
.admin-popover.top::after {
  content: "";
  position: absolute;
  left: 50%;
  width: 0; height: 0;
  border-left: 8px solid transparent;
  border-right: 8px solid transparent;
  transform: translateX(-50%);
}
.admin-popover.bottom::after {
  top: -8px;
  border-bottom: 8px solid #fff;
}
.admin-popover.top {
  transform: translate(-50%, -100%); /* смещаем вверх от якоря */
}
.admin-popover.top::after {
  bottom: -8px;
  border-top: 8px solid #fff;
}

.modal-content p { margin: 10px 0; font-size: 15px; }
.modal-actions {
  display: flex;
  gap: 12px;
  margin-top: 14px;
  justify-content: flex-end;
}
.delete-btn {
  background: #e53935;
  color: #fff;
  border: none;
  border-radius: 7px;
  font-size: 15px;
  padding: 8px 12px;
  cursor: pointer;
  transition: background 0.13s;
  min-width: 80px;
}
.delete-btn:hover { background: #c62828; }

/* Переключатель роли */
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
.role-option.selected { background: #007bff; color: #fff; }
.role-option:not(.selected):hover { background: #e6f8ff; }

/* Тумблер */
.switch { position: relative; display: inline-block; width: 60px; height: 32px; margin-left: 10px; vertical-align: middle; }
.switch input { opacity: 0; width: 0; height: 0; }
.slider {
  position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0;
  background-color: #EEE; border-radius: 32px; transition: .4s;
}
.slider:before {
  position: absolute; content: ""; height: 26px; width: 26px; left: 3px; bottom: 3px;
  background-color: #fff; border-radius: 50%; transition: .4s; box-shadow: 0 1px 3px rgba(30,30,30,0.07);
}
.switch input:checked + .slider { background-color: #007bff; }
.switch input:checked + .slider:before { transform: translateX(28px); }
</style>
