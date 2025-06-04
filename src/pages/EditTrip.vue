<template>
  <div class="edit-profile-page">
    <button class="back-button" @click="router.back()">← Назад</button>
    <h2 class="title">Редактировать профиль</h2>
    <form class="form" @submit.prevent="save">
      <label>Имя</label>
      <input v-model="first_name" type="text" required maxlength="40" />

      <label>Фамилия</label>
      <input v-model="last_name" type="text" maxlength="40" />

      <label>Телефон</label>
      <input v-model="phone" type="tel" maxlength="20" />

      <label>Город проживания</label>
      <input v-model="city" type="text" required maxlength="40" placeholder="Ваш город" />

      <button class="btn" type="submit" :disabled="loading">Сохранить</button>
    </form>
    <Toast ref="toastRef" />
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/store/auth";
import { updateProfileById } from "@/api/users";
import Toast from "@/components/Toast.vue";

const router = useRouter();
const auth = useAuthStore();
const toastRef = ref<InstanceType<typeof Toast> | null>(null);

const first_name = ref(auth.user.first_name || "");
const last_name = ref(auth.user.last_name || "");
const phone = ref(auth.user.phone || "");
const city = ref(auth.user.city || "");
const loading = ref(false);

async function save() {
  if (!first_name.value || !city.value) {
    toastRef.value?.show("Заполните все обязательные поля");
    return;
  }
  loading.value = true;
  try {
    await updateProfileById({
      id: auth.user.id,
      first_name: first_name.value,
      last_name: last_name.value,
      phone: phone.value,
      city: city.value
    });
    toastRef.value?.show("Профиль обновлён!");
    // Локально обновляем пользователя:
    auth.user.first_name = first_name.value;
    auth.user.last_name = last_name.value;
    auth.user.phone = phone.value;
    auth.user.city = city.value;
    setTimeout(() => router.push("/profile"), 700);
  } catch (e) {
    toastRef.value?.show("Ошибка сохранения!");
  }
  loading.value = false;
}
</script>

<style scoped>
.edit-profile-page {
  padding: 16px;
  min-height: 100vh;
  background: var(--color-background);
}
.title {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 18px;
  color: var(--color-text-primary);
  text-align: center;
}
.back-button {
  background: transparent;
  border: 1px solid var(--color-primary);
  color: var(--color-primary);
  border-radius: 6px;
  padding: 6px 12px;
  font-size: 14px;
  cursor: pointer;
  margin-bottom: 12px;
  transition: background 0.2s ease;
}
.form {
  display: flex;
  flex-direction: column;
  gap: 13px;
  max-width: 380px;
  margin: 0 auto;
}
input {
  padding: 9px 12px;
  border-radius: 7px;
  border: 1px solid var(--color-border, #bbb);
  font-size: 16px;
  outline: none;
}
.btn {
  background: var(--color-primary);
  color: white;
  border: none;
  padding: 11px 18px;
  border-radius: 8px;
  font-size: 17px;
  cursor: pointer;
  margin-top: 8px;
  transition: background 0.2s;
}
</style>
