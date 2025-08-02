<template>
  <div class="edit-profile-page">
    <div class="background-img"></div>

    <div class="form-card">
      <h2 class="title">Редактировать профиль</h2>
      <form @submit.prevent="submit">
        <div class="input-group">
          <label>Имя</label>
          <input
            v-model="form.first_name"
            required
            @input="onNameInput('first_name')"
            pattern="[A-Za-zА-Яа-яЁё\s\-]+"
            maxlength="30"
          />
        </div>
        <div class="input-group">
          <label>Фамилия</label>
          <input
            v-model="form.last_name"
            @input="onNameInput('last_name')"
            pattern="[A-Za-zА-Яа-яЁё\s\-]+"
            maxlength="40"
          />
        </div>
        <div class="input-group">
          <label>Телефон</label>
          <input
            v-model="form.phone"
            @input="onPhoneInput"
            inputmode="numeric"
            pattern="[0-9]+"
            maxlength="15"
          />
        </div>

        <!-- Новое поле: Пол -->
        <div class="input-group">
          <label>Пол</label>
          <select v-model="form.gender" class="select">
            <option value="">Не указан</option>
            <option value="male">Мужской</option>
            <option value="female">Женский</option>
          </select>
        </div>


        <template v-if="auth.user.is_driver">
          <div class="input-group">
            <label>Номер машины</label>
            <input v-model="form.car_number" placeholder="Например, 1234АБ-1" />
          </div>
          <div class="input-group">
            <label>Марка машины</label>
            <input v-model="form.car_brand" placeholder="Например, Toyota Prius" />
          </div>
          <div class="input-group">
            <label>Фото машины</label>
            <input type="file" accept="image/*" @change="onFileChange" />
            <div v-if="showCarPhoto" class="car-photo-preview">
              <img :src="showCarPhoto" alt="Фото машины" />
            </div>
          </div>
        </template>
        <button class="btn" type="submit">Сохранить</button>
        <button class="btn btn-outline" type="button" @click="router.push('/profile')">Отмена</button>
      </form>
    </div>
    <Toast ref="toastRef" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/store/auth';
import { patchProfile, uploadCarPhoto } from '@/api/auth';
import Toast from '@/components/Toast.vue';
import axios from 'axios';

const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const router = useRouter();
const auth = useAuthStore();
const toastRef = ref();

const form = ref({
  first_name: auth.user.first_name || '',
  last_name: auth.user.last_name || '',
  phone: auth.user.phone || '',
  gender: auth.user.gender || '',
  car_number: auth.user.car_number || '',
  car_brand: auth.user.car_brand || '',
});

const carPhotoUrl = ref(auth.user.car_photo_url || '');
const carPhotoFile = ref<File | null>(null);
const localPreview = ref<string>('');
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

// Показывать превью для фото машины
const showCarPhoto = computed(() => {
  if (localPreview.value) return localPreview.value;
  if (carPhotoUrl.value) {
    return carPhotoUrl.value.startsWith('http')
      ? carPhotoUrl.value
      : BACKEND_URL + carPhotoUrl.value;
  }
  return '';
});

// Только буквы
function onNameInput(field: 'first_name' | 'last_name') {
  form.value[field] = form.value[field].replace(/[^A-Za-zА-Яа-яЁё\s\-]/g, "");
}

// Только цифры в телефоне
function onPhoneInput(e: Event) {
  let val = (e.target as HTMLInputElement).value.replace(/\D/g, "");
  form.value.phone = val;
}

function onFileChange(e: Event) {
  const target = e.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    carPhotoFile.value = target.files[0];
    localPreview.value = URL.createObjectURL(target.files[0]);
  }
}

onMounted(() => {
  const tg = (window as any).Telegram?.WebApp;
  tg?.BackButton?.show?.();
  tg?.BackButton?.onClick?.(() => {
    router.back();
  });
});
onBeforeUnmount(() => {
  const tg = (window as any).Telegram?.WebApp;
  tg?.BackButton?.hide?.();
  tg?.BackButton?.offClick?.();
});

async function submit() {
  try {
    const payload: any = {
      ...form.value,
    };

    if (!auth.user.is_driver) {
      delete payload.car_number;
      delete payload.car_brand;
    }

    const updated = await axios.patch(`${API_BASE}/users/${auth.user.id}`, payload);

    // Если выбрано новое фото — загружаем
    if (auth.user.is_driver && carPhotoFile.value) {
      const formData = new FormData();
      formData.append('file', carPhotoFile.value);
      await uploadCarPhoto(auth.user.id, formData);
    }

    auth.setUser({
      ...updated.data,
      car_photo_url: updated.data.car_photo_url || carPhotoUrl.value
    });

    toastRef.value?.show('✅ Профиль обновлен!');
    router.push('/profile');
  } catch (err) {
    toastRef.value?.show('❌ Ошибка обновления профиля');
  }
}
</script>
<style scoped>
.edit-trip-page {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  overflow-y: auto;
  background: transparent;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 14px;
}

.select {
  padding: 9px 12px;
  border-radius: 7px;
  border: 1px solid var(--color-border, #bbb);
  font-size: 16px;
  outline: none;
  background: white;
  appearance: none;
  cursor: pointer;
}

.input {
  padding: 9px 12px;
  border-radius: 7px;
  border: 1px solid var(--color-border, #bbb);
  font-size: 16px;
  outline: none;
}

.background-img {
  position: fixed;
  inset: 0;
  width: 100%;
  height: 100%;
  background: url('@/assets/secondary.webp') center center / cover no-repeat;
  z-index: 0;
  pointer-events: none;
  user-select: none;
  animation: fadeIn 1s ease-in-out;
}

.form-card {
  position: relative;
  z-index: 2;
  max-width: 420px;
  margin: 40px auto;
  padding: 24px 18px 28px 18px;
  background: rgba(255, 255, 255, 0.45);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border-radius: 18px;
  box-shadow: 0 6px 14px rgba(0, 0, 0, 0.1);
}

.title {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 18px;
  color: #232323;
  text-align: center;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 13px;
}

.btn {
  background: var(--color-primary, #007bff);
  color: white;
  border: none;
  padding: 11px 18px;
  border-radius: 8px;
  font-size: 17px;
  cursor: pointer;
  margin-top: 8px;
  transition: background 0.2s;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
</style>
