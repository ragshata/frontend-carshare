<template>
  <div class="main-screen-root">
    <!-- Фиксированный SVG-фон -->
    <div class="background-img"></div>
    <!-- Весь основной контент -->
    <div :class="['blur-container', { 'blur-active': showCarModal }]">
      <div class="main-screen-content">
        <h1 class="title">Добро пожаловать!</h1>
        <p class="desc">
          Это мини-приложение для поиска попутчиков и совместных поездок. Выберите, кто вы:
        </p>
        <div class="roles">
          <button class="role-btn driver" @click="chooseDriver">🚗 Я водитель</button>
          <button class="role-btn passenger" @click="selectRole(false)">🙋 Я попутчик</button>
        </div>
        <div v-if="loading" class="loading">Сохраняем выбор...</div>
      </div>
    </div>
    <!-- Модалка для машины -->
    <div v-if="showCarModal" class="modal-overlay">
      <div class="modal">
        <h3>Введите данные автомобиля</h3>
        <input v-model="carBrand" maxlength="30" class="car-input" placeholder="Марка машины (например, Toyota Mark II)" />
        <input v-model="carNumber" maxlength="15" class="car-input" placeholder="Номер машины (например, 1234АБ-1)" />
        <div class="modal-actions">
          <button class="btn" @click="confirmDriver">Сохранить</button>
          <button class="btn btn-outline" @click="showCarModal = false">Отмена</button>
        </div>
      </div>
    </div>
    <Toast ref="toastRef" />
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
const showCarModal = ref(false);
const carNumber = ref('');
const carBrand = ref('');
const toastRef = ref<InstanceType<typeof Toast> | null>(null);

function chooseDriver() {
  showCarModal.value = true;
  carNumber.value = '';
  carBrand.value = '';
}
async function confirmDriver() {
  if (!carBrand.value.trim()) {
    toastRef.value?.show('Введите марку машины!');
    return;
  }
  if (!carNumber.value.trim()) {
    toastRef.value?.show('Введите номер машины!');
    return;
  }
  await selectRole(true, carNumber.value.trim(), carBrand.value.trim());
  showCarModal.value = false;
}
async function selectRole(isDriver: boolean, car_number?: string, car_brand?: string) {
  if (!auth.user) return;
  loading.value = true;
  try {
    const updated = await patchUserRole(auth.user.id, isDriver, car_number, car_brand);
    auth.setUser(updated);
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
html, body {
  width: 100vw;
  height: 100vh;
  margin: 0;
  padding: 0;
  overflow: hidden !important;   /* ВАЖНО */
  touch-action: manipulation;
  -webkit-overflow-scrolling: auto;
  background: #222;
}
  

* { box-sizing: border-box; }

/* Фон SVG всегда по всему экрану */
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

/* Центрируем плашку с текстом всегда по центру */
.main-screen-root,
.blur-container {
  position: fixed; /* или absolute, если нужно поверх фона */
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
  /* Без flex-direction: column — для одного блока достаточно */
}


.blur-active {
  filter: blur(7px) brightness(0.7);
  pointer-events: none;
  user-select: none;
}

/* Плашка-контент — аккуратно под мобильный */
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

/* Адаптация размеров для телефонов */
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
.brand {
  color: #007bff;
  font-weight: 800;
  letter-spacing: 1px;
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

.car-input {
  width: 95%;
  margin: 12px auto;
  padding: 10px 11px;
  font-size: 17px;
  border: 1.2px solid #b7cbf6;
  border-radius: 9px;
  outline: none;
  background: #f6f9ff;
  text-align: center;
  display: block;
}

/* ===== Модалка ===== */
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 12;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(20,20,30,0.16);
}
.modal {
  background: #fff;
  border-radius: 20px;
  padding: 22px 8vw 16px 8vw;
  box-shadow: 0 4px 32px rgba(0,0,0,0.14);
  min-width: 0;
  max-width: 96vw;
  text-align: center;
  animation: pop-in 0.18s;
  z-index: 13;
}
@media (max-width: 430px) {
  .modal {
    padding: 12px 3vw 10px 3vw;
    border-radius: 12px;
  }
}
@keyframes pop-in {
  0% { transform: scale(0.95); opacity: 0.7; }
  100% { transform: scale(1); opacity: 1; }
}
.modal-actions {
  display: flex;
  gap: 10px;
  justify-content: center;
}
.btn {
  background: var(--color-primary, #007bff);
  color: white;
  border: none;
  padding: 11px 18px;
  border-radius: 7px;
  font-size: 16px;
  cursor: pointer;
  transition: background 0.18s;
}
.btn-outline {
  background: transparent;
  color: var(--color-primary, #007bff);
  border: 1.2px solid var(--color-primary, #007bff);
}
</style>
