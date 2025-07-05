<template>
  <div class="main-screen">
    <h1 class="title">Добро пожаловать в CARshare!</h1>
    <p class="desc">
      Это мини-приложение для поиска попутчиков и совместных поездок. Выберите, кто вы:
    </p>
    <div class="roles">
      <button class="role-btn driver" @click="selectRole(true)">
        🚗 Я водитель
      </button>
      <button class="role-btn passenger" @click="selectRole(false)">
        🙋 Я попутчик
      </button>
    </div>
    <div v-if="loading" class="loading">Сохраняем выбор...</div>
    <Toast ref="toastRef" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/store/auth';
import { patchProfile } from '@/api/auth';
import Toast from '@/components/Toast.vue';

const router = useRouter();
const auth = useAuthStore();
const loading = ref(false);
const toastRef = ref<InstanceType<typeof Toast> | null>(null);

async function selectRole(isDriver: boolean) {
  if (!auth.user) return;
  loading.value = true;
  try {
    // Сохраняем роль в бэке
    const updated = await patchProfile({
      telegram_id: auth.user.telegram_id,
      is_driver: isDriver,
    });
    auth.setUser(updated); // обновить в store
    toastRef.value?.show('✅ Роль успешно выбрана!');
    setTimeout(() => {
      if (isDriver) {
        router.replace('/driver');
      } else {
        router.replace('/passenger');
      }
    }, 600);
  } catch (err) {
    toastRef.value?.show('❌ Ошибка выбора роли');
  }
  loading.value = false;
}
</script>

<style scoped>
.main-screen {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: var(--color-background, #f9fbfc);
  padding: 18px;
}
.app-logo {
  margin-bottom: 12px;
}
.logo {
  width: 70px;
  height: 70px;
  margin-bottom: 4px;
}
.title {
  font-size: 23px;
  font-weight: bold;
  text-align: center;
  margin-bottom: 14px;
  color: var(--color-text-primary, #222);
}
.desc {
  font-size: 15px;
  color: var(--color-text-secondary, #666);
  margin-bottom: 24px;
  text-align: center;
}
.roles {
  display: flex;
  gap: 22px;
  margin-bottom: 24px;
  flex-wrap: wrap;
  justify-content: center;
}
.role-btn {
  padding: 18px 36px;
  font-size: 18px;
  font-weight: 600;
  border: none;
  border-radius: 18px;
  background: var(--color-surface, #fff);
  color: var(--color-primary, #007bff);
  box-shadow: 0 2px 10px rgba(0,0,0,0.09);
  cursor: pointer;
  transition: background 0.16s;
}
.role-btn.driver {
  background: #f1f8ff;
}
.role-btn.passenger {
  background: #f9f4ff;
}
.role-btn:hover {
  background: #e3eeff;
}
.loading {
  font-size: 15px;
  color: #666;
  margin-top: 14px;
}
</style>
