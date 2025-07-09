<template>
  <div class="admin-wrap">
    <h2 class="title">Админ-панель</h2>
    <div class="center-row">
      <button class="danger-btn" @click="deleteDatabase">Удалить всю базу</button>
    </div>

    <table class="users-table">
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
            <button class="btn" @click="showDetails(user)">Подробнее</button>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Модальное окно с деталями пользователя -->
    <div v-if="modalUser" class="modal-overlay" @click.self="modalUser = null">
      <div class="modal">
        <h3>Пользователь #{{ modalUser.id }}</h3>
        <div class="modal-content">
          <p><b>Имя:</b> {{ modalUser.first_name }} <span v-if="modalUser.last_name">{{ modalUser.last_name }}</span></p>
          <p><b>Telegram ID:</b> {{ modalUser.telegram_id }}</p>
          <p><b>Telegram:</b>
            <a v-if="modalUser.username" :href="`https://t.me/${modalUser.username}`" target="_blank">@{{ modalUser.username }}</a>
            <span v-else>—</span>
          </p>
          <p><b>Роль:</b>
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
            <label class="lock" style="margin-left: 8px;">
              <input type="checkbox"
                     :checked="!!modalUser.active_driver"
                     @change="toggleActive(modalUser)">
              <span>
                <!-- SVG-замок открытый/закрытый -->
                <svg v-if="!!modalUser.active_driver" width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <rect x="2" y="10" width="20" height="10" rx="5" :fill="modalUser.active_driver ? '#21beff' : '#EEE'" />
                  <circle :cx="modalUser.active_driver ? 17 : 7" cy="15" r="4" fill="#fff" />
                  <path d="M8,10V8a4,4,0,0,1,8,0" stroke="#21beff" stroke-width="2" fill="none" />
                </svg>
                <svg v-else width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <rect x="2" y="10" width="20" height="10" rx="5" :fill="modalUser.active_driver ? '#21beff' : '#EEE'" />
                  <circle :cx="modalUser.active_driver ? 17 : 7" cy="15" r="4" fill="#fff" />
                  <path d="M16,10V8a4,4,0,0,0-8,0" stroke="#B0B7C3" stroke-width="2" fill="none" />
                </svg>
              </span>
            </label>
          </p>
        </div>
        <div class="modal-actions">
          <button class="delete-btn" @click="deleteUserById(modalUser.id)">Удалить</button>
          <button class="btn close-btn" @click="modalUser = null">Закрыть</button>
        </div>
      </div>
    </div>
    <Toast ref="toastRef" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getAllUsers, updateUserRole, updateUserActiveDriver, deleteUser, deleteDatabased } from '@/api/admin';
import Toast from '@/components/Toast.vue';

const users = ref<any[]>([]);
const toastRef = ref<InstanceType<typeof Toast> | null>(null);
const modalUser = ref<any|null>(null);

async function loadUsers() {
  try {
    users.value = await getAllUsers();
  } catch {
    toastRef.value?.show('Ошибка загрузки пользователей!');
  }
}

async function setRole(is_driver: boolean) {
  if (!modalUser.value) return;
  try {
    modalUser.value.is_driver = is_driver;
    await updateUserRole(modalUser.value.id, is_driver);
    const idx = users.value.findIndex(u => u.id === modalUser.value.id);
    if (idx !== -1) users.value[idx].is_driver = is_driver;
    toastRef.value?.show('Роль обновлена');
  } catch {
    toastRef.value?.show('Ошибка обновления роли!');
  }
}

async function toggleActive(user: any) {
  try {
    user.active_driver = !user.active_driver;
    await updateUserActiveDriver(user.id, user.active_driver);
    const idx = users.value.findIndex(u => u.id === user.id);
    if (idx !== -1) users.value[idx].active_driver = user.active_driver;
    toastRef.value?.show('Статус обновлен');
  } catch {
    toastRef.value?.show('Ошибка обновления статуса!');
  }
}

async function deleteUserById(id: number) {
  if (!confirm('Удалить пользователя? Это действие необратимо!')) return;
  try {
    await deleteUser(id);
    users.value = users.value.filter(u => u.id !== id);
    toastRef.value?.show('Пользователь удалён!');
    modalUser.value = null;
  } catch {
    toastRef.value?.show('Ошибка удаления пользователя!');
  }
}

async function deleteDatabase() {
  if (!confirm('ВНИМАНИЕ: Это удалит ВСЕ ДАННЫЕ! Продолжить?')) return;
  try {
    await deleteDatabased();
    users.value = [];
    toastRef.value?.show('База удалена!');
  } catch {
    toastRef.value?.show('Ошибка удаления базы!');
  }
}

function showDetails(user: any) {
  modalUser.value = { ...user };
}

onMounted(loadUsers);
</script>

<style scoped>
body {
  background:#FCFCFC;
  color:#222;
  font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Oxygen,Ubuntu,Cantarell,Open Sans,Helvetica Neue,sans-serif;
}
.admin-wrap {
  max-width: 900px;
  margin: 36px auto 0 auto;
  padding: 24px 8px 44px 8px;
  background: #fff;
  border-radius: 22px;
  box-shadow: 0 2px 12px rgba(60,80,120,0.06);
}
.center-row {
  width: 100%;
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}
.title {
  font-size: 25px;
  font-weight: bold;
  margin-bottom: 20px;
  color: #232323;
  text-align: center;
}
.users-table {
  width: 100%;
  border-collapse: collapse;
  background: #fff;
  margin-top: 12px;
}
.users-table th, .users-table td {
  padding: 11px 10px;
  font-size: 15px;
  border-bottom: 1px solid #eee;
  text-align: center;
}
.users-table th {
  background: #f8fafc;
  font-weight: 600;
  color: #222;
}
.users-table td {
  background: #fff;
}
.btn, .close-btn {
  background: #fff;
  color: #007bff;
  border: 1.5px solid #007bff;
  border-radius: 7px;
  font-size: 15px;
  padding: 6px 16px;
  cursor: pointer;
  transition: background 0.13s, color 0.13s;
  margin-right: 8px;
}
.btn:hover {
  background: #f1f7ff;
}
.close-btn {
  margin-right: 0;
}
.delete-btn {
  background: #e53935;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 15px;
  padding: 6px 13px;
  cursor: pointer;
  margin-right: 8px;
  min-width: 80px;
  transition: background 0.13s;
}
.delete-btn:hover {
  background: #c62828;
}
.danger-btn {
  background: #d9534f;
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 500;
  padding: 11px 38px;
  cursor: pointer;
  transition: background 0.17s;
  margin-bottom: 10px;
}
.danger-btn:hover {
  background: #c9302c;
}
.role-select {
  display: inline-flex;
  border-radius: 11px;
  overflow: hidden;
  box-shadow: 0 0 0 1.5px #21beff inset;
}
.role-option {
  border: none;
  padding: 6px 18px;
  font-size: 15px;
  font-weight: 500;
  background: #fff;
  color: #21beff;
  cursor: pointer;
  transition: background 0.17s, color 0.13s;
  outline: none;
}
.role-option.selected {
  background: #21beff;
  color: #fff;
}
.role-option:not(.selected):hover {
  background: #e6f8ff;
}

/* Toggle-lock (в стиле твоего примера) */
.lock {
  position:relative;
  cursor:pointer;
  height:32px;
  user-select:none;
  display: inline-block;
  vertical-align:middle;
  margin-left: 2px;
}
.lock input {
  display:none;
}
.lock span:before,
.lock span:after{
  content:"";
}
.lock span:before {
  width:64px;
  height:32px;
  margin-right:8px;
  background:#EEE;
  border-radius:32px;
  display:inline-block;
  vertical-align:middle;
  transition:all .5s cubic-bezier(.175, .885, .32, 1);
}
.lock input:checked + span:before {
  background-color:#1CC691;
}
.lock span:after {
  margin:2px;
  width:28px;
  height:28px;
  background:#FFF;
  border-radius:28px;
  position:absolute;
  left:0;
  top:0;
  background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAB6ElEQVRYR+3XS8gPURjH8c8bkYV7KVslC4US5RJhgWKDQsnCJZcFWcrCJVkqioVsZOG+eDdvLJAkJJKVkr1EIQu3okfnXy/9Z+bMO8O/5OxmznP5nud35pxn+vR49A0hf/gsxHJMSf4vcQP38L1OzLoA83AaswqSPMFuPMyFqAOwBWcwrCL4N2zDuRyIXIDV6EfYf8IJXMDz9G4aNmEPRiQZVmGgCiIHYAxeYBLeYRmi1N3GHNzEaLzCVHwsg8gB2IfjKchmnK9Y1VacTTZ7cbIpQOzs+XiDyQiNy0ZI8BpjcReLmgJ8SCW9jpVVmqb5kGEp3mNcU4DOd30Z6zMBrmFNsi2VuWwySrkEsfIY96v0HAQX+2Zuel6BW/jaDb4IYCLuYHrmiqvMnmFx+op+sS0COIb9VVFrzh/C4d99igCuYF3NBFXmF7ExF+Aq1lZFrDl/CRv+A7RZgUfpdoyYOzG7QpJWJYjk0ZR8SUlH4kFJnxBmrQJsH3ThdBa+KzUrRYX44wDRCZ0qkaFVgMdYgM8p4agkwYy/BRB5nqZNGIfZDpQlb30P1DyDfpq3KsG/D9Dzy+goDgylziU+B3Ek9ygej9uY2RJEtPGdHjGrIQmj4amjndAQ4m3qjrt20zn/BQ3zl7v3HOAHddxjIRWQtfEAAAAASUVORK5CYII=);
  background-size: 16px 16px;
  background-position: center;
  background-repeat: no-repeat;
  z-index:2;
  transition:all .5s cubic-bezier(.175, .885, .32, 1); 
}
.lock input:checked + span:after {
  left:32px;
  background-image:none;
}
.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(30,30,30,0.17);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 99999;
}
.modal {
  background: #fff;
  border-radius: 17px;
  box-shadow: 0 2px 20px rgba(30,30,30,0.08);
  min-width: 320px;
  padding: 28px 32px 16px 32px;
  text-align: left;
}
.modal-content p {
  font-size: 15px;
  margin-bottom: 9px;
}
.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 18px;
}
</style>
