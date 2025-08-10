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
        <button
          class="role-btn"
          @click="onRoleClick('passenger', $event)"
        >
          🙋 Попутчик (Найти поездку)
        </button>

        <button
          class="role-btn"
          @click="onRoleClick('driver', $event)"
        >
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

    router.replace(role === 'driver' ? '/driver' : '/passenger');
  } catch (e) {
    toastRef.value?.show('Ошибка при выборе роли');
  } finally {
    loading.value = false;
  }
}

/** Клик с «вспышкой» */
function onRoleClick(role: 'driver' | 'passenger', e: MouseEvent | TouchEvent) {
  const el = e.currentTarget as HTMLElement;
  if (!el) return;
  // позиция клика для центра вспышки
  let clientX = 0, clientY = 0;
  if (e instanceof TouchEvent && e.touches[0]) {
    clientX = e.touches[0].clientX;
    clientY = e.touches[0].clientY;
  } else if (e instanceof MouseEvent) {
    clientX = e.clientX;
    clientY = e.clientY;
  }
  const rect = el.getBoundingClientRect();
  const x = clientX - rect.left;
  const y = clientY - rect.top;

  // прокидываем координаты и запускаем анимацию
  el.style.setProperty('--fx-x', `${x}px`);
  el.style.setProperty('--fx-y', `${y}px`);
  el.classList.remove('flash'); // если спам-клики
  // рефлоу, чтобы перезапустить анимацию
  // eslint-disable-next-line @typescript-eslint/no-unused-expressions
  el.offsetWidth;
  el.classList.add('flash');

  // маленькая задержка, чтобы эффект успел сыграть
  setTimeout(() => chooseRole(role), 160);
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
@keyframes bg-fade-in { from {opacity:0} to {opacity:1} }

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
  .main-screen-content { padding: 20px 3vw 16px 3vw; font-size: 15px; border-radius: 16px; }
}
@media (max-width: 340px) {
  .main-screen-content { padding: 12px 1vw 10px 1vw; font-size: 14px; border-radius: 12px; }
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

/* Кнопки одинакового стиля, более тёмные + эффект вспышки */
.role-btn {
  position: relative;
  display: inline-block;
  width: 100%;
  padding: 16px 14px;
  font-size: 18px;
  font-weight: 700;
  border: 1.5px solid rgba(0, 60, 130, 0.45);
  border-radius: 14px;
  background: linear-gradient(180deg, #d1daea 0%, #bcc9df 100%);
  color: #0b5ed7;
  box-shadow: 0 6px 16px rgba(0,0,0,0.08), inset 0 -2px 0 rgba(0,0,0,0.03);
  cursor: pointer;
  transition: transform .08s ease, box-shadow .18s ease, border-color .18s ease, background .18s ease;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
  line-height: 1.2;
  overflow: hidden; /* прячем вспышку за границы */
}

.role-btn:hover {
  box-shadow: 0 8px 22px rgba(0,0,0,0.12), inset 0 -2px 0 rgba(0,0,0,0.05);
  background: linear-gradient(180deg, #c6d2e6 0%, #b3c2da 100%);
}
.role-btn:active { transform: translateY(1px) scale(0.995); }

/* Псевдоэлемент для вспышки/риппла */
.role-btn::after {
  content: "";
  position: absolute;
  left: var(--fx-x, 50%);
  top: var(--fx-y, 50%);
  width: 10px;
  height: 10px;
  border-radius: 999px;
  transform: translate(-50%, -50%) scale(1);
  background: radial-gradient(circle, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.4) 45%, rgba(255,255,255,0) 65%);
  pointer-events: none;
  opacity: 0;
}

.role-btn.flash::after {
  animation: btn-flash 420ms ease-out;
}

@keyframes btn-flash {
  0%   { opacity: .85; transform: translate(-50%, -50%) scale(1); }
  60%  { opacity: .35; transform: translate(-50%, -50%) scale(26); }
  100% { opacity: 0;   transform: translate(-50%, -50%) scale(34); }
}

.loading {
  font-size: 15px;
  color: #666;
  margin-top: 14px;
}
</style>
