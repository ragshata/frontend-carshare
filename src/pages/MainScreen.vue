<template>
  <div class="main-screen-root">
    <!-- Фиксированный SVG-фон -->
    <div class="background-img"></div>
    <div class="blur-container" :class="{ 'blur-active': showModal }">
      <div class="main-screen-content">
        <h1 class="title">Добро пожаловать!</h1>
        <p class="desc">
          Это мини-приложение для поиска попутчиков и совместных поездок. Выберите, кто вы:
        </p>
        <div class="roles">
          <button class="role-btn driver" @click="openModal('driver')">🚗 Я водитель</button>
          <button class="role-btn passenger" @click="openModal('passenger')">🙋 Я попутчик</button>
        </div>
        <div v-if="loading" class="loading">Сохраняем выбор...</div>
      </div>
    </div>
    <!-- Модалка с подсказкой -->
    <div v-if="showModal" class="modal-overlay">
      <div class="modal">
        <h3 class="modal-title">Завершите регистрацию</h3>
        <div class="modal-desc">
          <div>Пожалуйста, перейдите во вкладку <b>Профиль</b> и заполните:</div>
          <ul>
            <li>Фамилию, имя и телефон</li>
            <li v-if="modalRole==='driver'">Марку, номер и фото машины</li>
          </ul>
        </div>
        <button class="btn" @click="goToProfile">Перейти в профиль</button>
      </div>
    </div>
    <Toast ref="toastRef" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import Toast from '@/components/Toast.vue';

const router = useRouter();
const showModal = ref(false);
const modalRole = ref<'driver' | 'passenger' | null>(null);
const loading = ref(false);
const toastRef = ref<InstanceType<typeof Toast> | null>(null);

function openModal(role: 'driver' | 'passenger') {
  modalRole.value = role;
  showModal.value = true;
}

function goToProfile() {
  showModal.value = false;
  router.replace('/profile');
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
  background: url('@/assets/main-bg.svg') center center / cover no-repeat;
  z-index: 0;
  pointer-events: none;
  user-select: none;
  animation: bg-fade-in 1.1s;
}
@keyframes bg-fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}
.main-screen-root,
.blur-container {
  position: fixed;
  inset: 0;
  min-height: 100vh;
  width: 100vw;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
  transition: filter 0.18s, background 0.18s;
  padding-bottom: env(safe-area-inset-bottom, 0);
  padding-top: env(safe-area-inset-top, 0);
}
.blur-active {
  filter: blur(7px) brightness(0.7);
  pointer-events: none;
  user-select: none;
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
  margin: 0;
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
  justify-content: center;
  align-items: stretch;
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

/* ==== Модалка ==== */
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 20;
  background: rgba(18,24,36,0.16);
  display: flex;
  align-items: center;
  justify-content: center;
}
.modal {
  background: #fff;
  border-radius: 18px;
  padding: 30px 22px 18px 22px;
  min-width: 250px;
  max-width: 90vw;
  text-align: center;
  box-shadow: 0 6px 24px rgba(0,0,0,0.10);
  animation: pop-in 0.16s;
}
@keyframes pop-in {
  0% { transform: scale(0.97); opacity: 0.75; }
  100% { transform: scale(1); opacity: 1; }
}
.modal-title {
  font-size: 20px;
  font-weight: bold;
  color: #232323;
  margin-bottom: 13px;
}
.modal-desc {
  font-size: 15px;
  color: #444;
  margin-bottom: 20px;
}
.modal-desc ul {
  text-align: left;
  margin: 10px 0 0 0;
  padding-left: 20px;
  font-size: 15px;
}
.btn {
  background: var(--color-primary, #007bff);
  color: white;
  border: none;
  padding: 11px 24px;
  border-radius: 9px;
  font-size: 16px;
  cursor: pointer;
  transition: background 0.18s;
  font-weight: 600;
}
.btn:active { background: #1d6de6; }
</style>