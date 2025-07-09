<template>
  <div class="admin-wrap">
    <h2 class="title">Админ-панель</h2>
    <button class="danger-btn" @click="deleteDatabase" style="margin-bottom: 28px;">Удалить всю базу</button>

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
            <span class="lock-icon" @click="toggleActive(modalUser)">
              <svg v-if="!!modalUser.active_driver" width="28" height="28" viewBox="0 0 24 24" fill="#21beff" style="vertical-align:middle">
                <path d="M12 17a1.5 1.5 0 0 0 1.5-1.5V14a1.5 1.5 0 0 0-3 0v1.5A1.5 1.5 0 0 0 12 17zm6-6V9a6 6 0 1 0-12 0h2a4 4 0 1 1 8 0v2a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-6a2 2 0 0 1 2-2h10zm-10 8h8v-6H8v6z"/>
              </svg>
              <svg v-else width="28" height="28" viewBox="0 0 24 24" fill="#B0B7C3" style="vertical-align:middle">
                <path d="M12 17a1.5 1.5 0 0 0 1.5-1.5V14a1.5 1.5 0 0 0-3 0v1.5A1.5 1.5 0 0 0 12 17zm6-6V9a6 6 0 1 0-12 0h2a4 4 0 1 1 8 0v2a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-6a2 2 0 0 1 2-2h10zm-10 8h8v-6H8v6z"/>
              </svg>
            </span>
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
    // сразу обновить и в таблице
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
    // сразу обновить и в таблице
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
  // Клонируем чтобы изменения в модалке не влияли сразу на таблицу
  modalUser.value = { ...user };
}

onMounted(loadUsers);
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
  padding: 9px 22px;
  margin-bottom: 10px;
  cursor: pointer;
  transition: background 0.17s;
}
.danger-btn:hover {
  background: #c9302c;
}
/* Роль — красивые кнопки */
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
.lock-icon {
  display: inline-block;
  cursor: pointer;
  vertical-align: middle;
  margin-left: 5px;
}
.lock-icon svg {
  transition: filter 0.19s;
  filter: drop-shadow(0 1px 3px rgba(33,190,255,0.09));
}
.lock-icon:hover svg {
  filter: brightness(1.18) drop-shadow(0 2px 6px rgba(33,190,255,0.12));
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
