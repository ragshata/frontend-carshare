<template>
  <div class="edit-profile-page">
    <h2 class="title">Редактировать профиль</h2>
    <form @submit.prevent="submit">
      <div class="input-group">
        <label>Имя</label>
        <input v-model="form.first_name" required />
      </div>
      <div class="input-group">
        <label>Фамилия</label>
        <input v-model="form.last_name" />
      </div>
      <div class="input-group">
        <label>Телефон</label>
        <input v-model="form.phone" />
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
          <div v-if="carPhotoUrl" class="car-photo-preview">
            <img :src="carPhotoUrl" alt="Фото машины" />
          </div>
        </div>
      </template>
      <button class="btn" type="submit">Сохранить</button>
      <button class="btn btn-outline" type="button" @click="router.push('/profile')">Отмена</button>
    </form>
    <Toast ref="toastRef" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/store/auth';
import { patchProfile, uploadCarPhoto } from '@/api/auth'; // <- добавь uploadCarPhoto в api/auth.ts
import Toast from '@/components/Toast.vue';

const router = useRouter();
const auth = useAuthStore();
const toastRef = ref();

const form = ref({
  first_name: auth.user.first_name,
  last_name: auth.user.last_name || '',
  phone: auth.user.phone || '',
  car_number: auth.user.car_number || '',
  car_brand: auth.user.car_brand || '',
});

const carPhotoUrl = ref(auth.user.car_photo_url || '');
const carPhotoFile = ref<File | null>(null);

function onFileChange(e: Event) {
  const target = e.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    carPhotoFile.value = target.files[0];
    carPhotoUrl.value = URL.createObjectURL(target.files[0]);
  }
}

onMounted(() => {
  const tg = (window as any).Telegram?.WebApp;
  if (tg?.BackButton) {
    tg.BackButton.show();
    tg.BackButton.onClick(() => {
      router.back();
    });
  }
});
onBeforeUnmount(() => {
  const tg = (window as any).Telegram?.WebApp;
  tg?.BackButton?.hide();
  tg?.BackButton?.offClick?.();
});

async function submit() {
  try {
    const payload: any = {
      ...form.value,
      telegram_id: auth.user.telegram_id,
    };
    // Если юзер НЕ водитель — удаляем из запроса машину
    if (!auth.user.is_driver) {
      delete payload.car_number;
      delete payload.car_brand;
    }
    const updated = await patchProfile(payload);

    // Загружаем фото машины если выбрано
    if (auth.user.is_driver && carPhotoFile.value) {
      const formData = new FormData();
      formData.append('file', carPhotoFile.value);
      await uploadCarPhoto(auth.user.id, formData);
    }

    auth.setUser(updated);
    toastRef.value?.show('✅ Профиль обновлен!');
    router.push('/profile');
  } catch (err) {
    toastRef.value?.show('❌ Ошибка обновления профиля');
  }
}
</script>

<style scoped>
.edit-profile-page {
  max-width: 420px;
  margin: 38px auto 0 auto;
  padding: 18px 8px 28px 8px;
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 2px 12px rgba(60,80,120,0.06);
}
.title {
  font-size: 23px;
  font-weight: bold;
  margin-bottom: 16px;
  color: #232323;
  text-align: center;
}
.input-group {
  margin-bottom: 18px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
label {
  font-size: 15px;
  font-weight: 500;
  color: #111;
  margin-bottom: 2px;
}
input {
  padding: 8px 12px;
  border-radius: 8px;
  border: 1.2px solid #bcd7fb;
  font-size: 15px;
  outline: none;
  transition: border 0.14s;
}
input:focus {
  border-color: #007bff;
}
.car-photo-preview img {
  max-width: 240px;
  border-radius: 13px;
  margin-top: 7px;
}
.btn {
  background: var(--color-primary, #007bff);
  color: white;
  border: none;
  padding: 10px 18px;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  margin-top: 5px;
  transition: background 0.2s;
}
.btn-outline {
  background: transparent;
  color: var(--color-primary, #007bff);
  border: 1.5px solid var(--color-primary, #007bff);
  margin-left: 12px;
}
</style>