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
      <button class="btn" type="submit">Сохранить</button>
      <button class="btn btn-outline" type="button" @click="router.push('/profile')">Отмена</button>
    </form>
    <Toast ref="toastRef" />
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/store/auth';
import { patchProfile } from '@/api/auth'; // функция запроса PATCH /me
import Toast from '@/components/Toast.vue';

const router = useRouter();
const auth = useAuthStore();
const toastRef = ref();

const form = ref({
  first_name: auth.user.first_name,
  last_name: auth.user.last_name || '',
  phone: auth.user.phone || '',
});

onMounted(() => {
  const tg = (window as any).Telegram?.WebApp;
  if (tg?.BackButton) {
    tg.BackButton.show();
    tg.BackButton.onClick(() => {
      router.back(); // или router.back()
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
    // Добавь telegram_id в объект для запроса!
    const updated = await patchProfile({
      ...form.value,
      telegram_id: auth.user.telegram_id, // или auth.user.id если у тебя именно telegram_id
    });
    auth.setUser(updated); // обнови пользователя в сторе
    toastRef.value?.show('✅ Профиль обновлен!');
    router.push('/profile');
  } catch (err) {
    toastRef.value?.show('❌ Ошибка обновления профиля');
  }
}

</script>

<style scoped>
.edit-profile-page { padding: 16px; min-height: 100vh; }
.title { text-align: center; margin-bottom: 18px; }
.input-group { margin-bottom: 14px; }
label { font-size: 14px; color: var(--color-text-secondary); margin-bottom: 4px; display: block; }
input, textarea { width: 100%; padding: 10px; border-radius: 8px; border: 1px solid var(--color-border); }
.btn { background: var(--color-primary); color: white; border: none; padding: 10px; border-radius: 8px; font-size: 15px; margin-right: 8px; cursor: pointer; }
.btn-outline { background: transparent; color: var(--color-primary); border: 1px solid var(--color-primary); }
</style>
