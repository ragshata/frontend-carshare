<template>
  <div class="main-screen-root">
    <!-- Фиксированный фон -->
    <div class="background-img"></div>
    <!-- Всё содержимое с блюром -->
    <div :class="['blur-container', { 'blur-active': showCarModal }]">
      <div class="main-screen-content">
        <h1 class="title">Добро пожаловать в <span class="brand">SafarBar</span>!</h1>
        <p class="desc">
          Это мини-приложение для поиска попутчиков и совместных поездок. Выберите, кто вы:
        </p>
        <div class="roles">
          <button class="role-btn driver" @click="chooseDriver">
            🚗 Я водитель
          </button>
          <button class="role-btn passenger" @click="selectRole(false)">
            🙋 Я попутчик
          </button>
        </div>
        <div v-if="loading" class="loading">Сохраняем выбор...</div>
      </div>
    </div>
    <!-- Модалка для машины -->
    <div v-if="showCarModal" class="modal-overlay">
      <div class="modal">
        <h3>Введите данные автомобиля</h3>
        <input
          v-model="carBrand"
          maxlength="30"
          class="car-input"
          placeholder="Марка машины (например, Toyota Mark II)"
        />
        <input
          v-model="carNumber"
          maxlength="15"
          class="car-input"
          placeholder="Номер машины (например, 1234АБ-1)"
        />
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
.main-screen-root {
  min-height: 100vh;
  width: 100vw;
  position: relative;
  overflow: hidden;
}

/* Фиксированный фон */
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


.blur-container {
  min-height: 100vh;
  width: 100vw;
  position: relative;
  transition: filter 0.18s, background 0.18s;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
}
.blur-active {
  filter: blur(7px) brightness(0.7);
  pointer-events: none;
  user-select: none;
}
.main-screen-content {
  z-index: 3;
  position: relative;
  background: rgba(255,255,255,0.93);
  border-radius: 24px;
  padding: 38px 22px 28px 22px;
  box-shadow: 0 2px 24px rgba(0,0,0,0.10);
  max-width: 410px;
  width: 100%;
  margin: 44px auto;
  text-align: center;
}
.title {
  font-size: 26px;
  font-weight: bold;
  margin-bottom: 14px;
  color: #232323;
}
.brand {
  color: #007bff;
  font-weight: 800;
  letter-spacing: 1px;
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

.car-input {
  width: 90%;
  margin: 14px auto;
  padding: 11px 13px;
  font-size: 18px;
  border: 1.5px solid #b7cbf6;
  border-radius: 10px;
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
  background: rgba(20,20,30,0.12);
}
.modal {
  background: #fff;
  border-radius: 24px;
  padding: 30px 26px 18px 26px;
  box-shadow: 0 4px 32px rgba(0,0,0,0.15);
  min-width: 280px;
  max-width: 92vw;
  text-align: center;
  animation: pop-in 0.18s;
  z-index: 13;
}
@keyframes pop-in {
  0% { transform: scale(0.95); opacity: 0.7; }
  100% { transform: scale(1); opacity: 1; }
}
.modal-actions {
  display: flex;
  gap: 14px;
  justify-content: center;
}
.btn {
  background: var(--color-primary, #007bff);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  transition: background 0.18s;
}
.btn-outline {
  background: transparent;
  color: var(--color-primary, #007bff);
  border: 1.5px solid var(--color-primary, #007bff);
}
</style>
