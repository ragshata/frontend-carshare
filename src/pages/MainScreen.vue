<template>
  <div class="main-screen-bg">
    <div class="main-screen-content">
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
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/store/auth';
import { patchUserRole } from '@/api/auth';
import Toast from '@/components/Toast.vue';

const router = useRouter();
const auth = useAuthStore();
const loading = ref(false);
const toastRef = ref<InstanceType<typeof Toast> | null>(null);

async function selectRole(isDriver: boolean) {
  if (!auth.user) return;
  loading.value = true;
  try {
    const updated = await patchUserRole(auth.user.id, isDriver);
    auth.setUser(updated); // обновить в store
    toastRef.value?.show('✅ Роль успешно выбрана!');
    setTimeout(() => {
      if (isDriver) router.replace('/driver');
      else router.replace('/passenger');
    }, 600);
  } catch (err) {
    toastRef.value?.show('❌ Ошибка выбора роли');
  }
  loading.value = false;
}
</script>

<style scoped>
.main-screen-bg {
  min-height: 100vh;
  width: 100vw;
  background: url('@/assets/main-bg.jpg') center center/cover no-repeat;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}
.main-screen-bg::before {
  content: '';
  position: absolute;
  inset: 0;
  background: rgba(25, 29, 32, 0.32); /* легкий затемняющий фильтр */
  z-index: 1;
}
.main-screen-content {
  z-index: 2;
  position: relative;
  background: rgba(255,255,255,0.85);
  border-radius: 24px;
  padding: 38px 22px 28px 22px;
  box-shadow: 0 2px 24px rgba(0,0,0,0.07);
  max-width: 400px;
  width: 100%;
  margin: 24px;
  text-align: center;
}

.title {
  font-size: 23px;
  font-weight: bold;
  margin-bottom: 14px;
  color: #232323;
}
.desc {
  font-size: 15px;
  color: #666;
  margin-bottom: 24px;
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
  background: #fff;
  color: #007bff;
  box-shadow: 0 2px 10px rgba(0,0,0,0.09);
  cursor: pointer;
  transition: background 0.16s;
}
.role-btn.driver { background: #f1f8ff; }
.role-btn.passenger { background: #f9f4ff; }
.role-btn:hover { background: #e3eeff; }
.loading {
  font-size: 15px;
  color: #666;
  margin-top: 14px;
}
</style>
