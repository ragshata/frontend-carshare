<template>
  <div class="admin-panel">
    <h2>Админ-панель пользователей</h2>
    <div class="search-controls">
      <input v-model="searchId" type="number" placeholder="Поиск по ID" />
      <input v-model="searchUsername" type="text" placeholder="Поиск по @username" />
      <button class="btn" @click="doSearch">Найти</button>
      <button class="btn btn-outline" @click="loadAll">Показать всех</button>
    </div>

    <table v-if="users.length" class="user-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Имя</th>
          <th>Телефон</th>
          <th>Telegram</th>
          <th>Роль</th>
          <th>Может создавать?</th>
          <th>Город</th>
          <th>Действия</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="u in users" :key="u.id">
          <td>{{ u.id }}</td>
          <td>{{ u.first_name }} {{ u.last_name }}</td>
          <td>{{ u.phone || '-' }}</td>
          <td>
            <a v-if="u.username" :href="`https://t.me/${u.username}`" target="_blank">
              @{{ u.username }}
            </a>
            <span v-else>-</span>
          </td>
          <td>
            <select v-model="u.is_driver" @change="changeRole(u)">
              <option :value="true">Водитель</option>
              <option :value="false">Пассажир</option>
            </select>
          </td>
          <td>
            <input
              type="checkbox"
              v-model="u.active_driver"
              @change="changeRole(u)"
              style="width:18px; height:18px; accent-color:#007bff;"
            />
          </td>
          <td>{{ u.city || '-' }}</td>
          <td>
            <!-- Здесь могут быть доп. действия, например, сброс пароля, бан и т.д. -->
          </td>
        </tr>
      </tbody>
    </table>
    <div v-else class="empty-text">Нет данных</div>
    <Toast ref="toastRef" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useAuthStore } from '@/store/auth';
import { useRouter } from 'vue-router';
import { getAdminUsers, patchUser } from "@/api/admin";
import Toast from "@/components/Toast.vue";

const users = ref<any[]>([]);
const searchId = ref('');
const searchUsername = ref('');
const toastRef = ref<InstanceType<typeof Toast> | null>(null);
const auth = useAuthStore();
const router = useRouter();

// Только админы! (замени ID на нужные)
const ADMIN_IDS = [6931781449, 23456789];
onMounted(() => {
  if (!auth.user || !ADMIN_IDS.includes(auth.user.telegram_id)) {
    router.replace('/'); // Нет доступа
    return;
  }
  loadAll();
});
    
async function loadAll() {
  try {
    users.value = await getAdminUsers({ telegram_id: auth.user.telegram_id });
  } catch {
    toastRef.value?.show("Ошибка загрузки пользователей");
  }
}

async function doSearch() {
  try {
    users.value = await getAdminUsers({
      telegram_id: auth.user.telegram_id,
      user_id: searchId.value ? Number(searchId.value) : undefined,
      username: searchUsername.value ? searchUsername.value : undefined,
    });
  } catch {
    toastRef.value?.show("Ошибка поиска");
  }
}

async function changeRole(user: any) {
  try {
    await patchUser(user.id, {
      is_driver: user.is_driver,
      active_driver: user.active_driver
    }, auth.user.telegram_id);
    toastRef.value?.show("Пользователь обновлен!");
  } catch {
    toastRef.value?.show("Ошибка обновления пользователя!");
  }
}
</script>

<style scoped>
.admin-panel {
  padding: 26px 8px;
  max-width: 1080px;
  margin: 0 auto;
}
h2 {
  text-align: center;
  font-size: 23px;
  font-weight: bold;
  margin-bottom: 20px;
}
.search-controls {
  display: flex;
  gap: 14px;
  margin-bottom: 20px;
  flex-wrap: wrap;
  justify-content: center;
}
input[type="text"], input[type="number"] {
  padding: 8px 14px;
  border-radius: 7px;
  border: 1px solid var(--color-border, #bbb);
  font-size: 16px;
  outline: none;
}
.btn {
  background: var(--color-primary, #007bff);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  cursor: pointer;
  padding: 9px 16px;
  transition: background 0.16s;
}
.btn-outline {
  background: transparent;
  color: var(--color-primary, #007bff);
  border: 1px solid var(--color-primary, #007bff);
}
.user-table {
  width: 100%;
  border-collapse: collapse;
  background: var(--color-surface, #fff);
  border-radius: 14px;
  overflow: hidden;
  margin: 0 auto;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}
.user-table th, .user-table td {
  padding: 10px 12px;
  text-align: center;
  border-bottom: 1px solid #f0f0f0;
  font-size: 15px;
}
.user-table th {
  background: #f7faff;
  color: #222;
  font-weight: 600;
}
.user-table tr:last-child td {
  border-bottom: none;
}
.empty-text {
  text-align: center;
  color: #aaa;
  font-size: 17px;
  margin-top: 35px;
}
</style>
