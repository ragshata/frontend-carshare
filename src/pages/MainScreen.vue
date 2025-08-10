<template>
  <div class="main-screen-root">
    <div class="background-img"></div>

    <div class="main-screen-content">
      <h1 class="title">Привет!</h1>
      <p class="desc">
        Safarbar помогает быстро найти попутчиков и поездки по Таджикистану и СНГ.
        <br />
        Выберите свою роль (можно поменять в профиле):
      </p>
      <div class="roles">
        <button class="role-btn passenger" @click="chooseRole('passenger')">
          🙋 Попутчик (Найти поездку)
        </button>
        <button class="role-btn driver" @click="chooseRole('driver')">
          🚗 Водитель (Предложить поездку)
        </button>
      </div>
      <div v-if="loading" class="loading">Сохраняем выбор...</div>
    </div>

    <Toast ref="toastRef" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/store/auth';
import { patchUserRole } from '@/api/auth';
import Toast from '@/components/Toast.vue';

const router = useRouter();
const auth = useAuthStore();

const loading = ref(false);
const toastRef = ref<InstanceType<typeof Toast> | null>(null);

onMounted(() => {
  if (auth.user?.is_driver === true) {
    router.replace('/driver');
    return;
  }
  if (auth.user?.is_driver === false) {
    router.replace('/passenger');
    return;
  }
});

async function chooseRole(role: 'driver' | 'passenger') {
  loading.value = true;
  try {
    if (!auth.user?.id) {
      toastRef.value?.show('Ошибка: не авторизован!');
      loading.value = false;
      return;
    }
    await patchUserRole(auth.user.id, role === 'driver');
    auth.user.is_driver = role === 'driver';
    localStorage.setItem('user_role', role);

    if (role === 'passenger') {
      router.replace('/passenger'); // 👈 сюда пассажира
    } else {
      router.replace('/driver');    // 👈 сюда водителя
    }
  } catch (e) {
    toastRef.value?.show('Ошибка при выборе роли');
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
html, body {
  width: 100vw;
  height: 100vh;
  margin: 0;
  padding: 0;
  overflow: hidden !important;
  touch-action: manipulation;
  -webkit-overflow-scrolling: auto;
  background: #222;
}
* { box-sizing: border-box; }

.background-img {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  background: url('@/assets/main.webp') center center / cover no-repeat;
  z-index: 0;
  pointer-events: none;
  user-select: none;
  animation: bg-fade-in 1.1s;
}
@keyframes bg-fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

.main-screen-root {
  position: fixed;
  inset: 0;
  min-height: 100vh;
  width: 100vw;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
  padding-bottom: env(safe-area-inset-bottom, 0);
  padding-top: env(safe-area-inset-top, 0);
}

.main-screen-content {
  z-index: 3;
  position: relative;
  background: rgba(255,255,255,0.96);
  border-radius: 22px;
  padding: 28px 8vw 22px 8vw;
  box-shadow: 0 2px 24px rgba(0,0,0,0.08);
  max-width: 95vw;
  width: 100%;
  text-align: center;
}

@media (max-width: 430px) {
  .main-screen-content {
    padding: 20px 3vw 16px 3vw;
    font-size: 15px;
    border-radius: 16px;
  }
}
@media (max-width: 340px) {
  .main-screen-content {
    padding: 12px 1vw 10px 1vw;
    font-size: 14px;
    border-radius: 12px;
  }
}

.title {
  font-size: 21px;
  font-weight: 700;
  margin-bottom: 12px;
  color: #222;
}
.desc {
  font-size: 15px;
  color: #555;
  margin-bottom: 20px;
}
.roles {
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-bottom: 18px;
}
.role-btn {
  padding: 15px 0;
  font-size: 18px;
  font-weight: 600;
  border: none;
  border-radius: 13px;
  background: #fff;
  color: #007bff;
  box-shadow: 0 2px 10px rgba(0,0,0,0.07);
  cursor: pointer;
  transition: background 0.16s;
  width: 100%;
}
.role-btn.driver { background: #f1f8ff; }
.role-btn.passenger { background: #f9f4ff; }
.role-btn:active { background: #e3eeff; }

.loading {
  font-size: 15px;
  color: #666;
  margin-top: 14px;
}
</style>
