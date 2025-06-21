<template>
  <div class="offer-trip-page">
    <h2 class="title">Создать поездку</h2>
    <form class="form" @submit.prevent="save">
      <label>Откуда</label>
      <input v-model="form.from_" type="text" required maxlength="40" />

      <label>Куда</label>
      <input v-model="form.to" type="text" required maxlength="40" />

      <label>Дата</label>
      <input v-model="form.date" type="date" required />

      <label>Время</label>
      <input v-model="form.time" type="time" required />

      <label>Свободных мест</label>
      <input v-model.number="form.seats" type="number" min="1" required />

      <label>Цена</label>
      <input v-model.number="form.price" type="number" min="0" required />

      <button class="btn" type="submit" :disabled="loading">Создать</button>
    </form>
    <Toast ref="toastRef" />
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted, onBeforeUnmount } from 'vue';
import { useRouter } from "vue-router";
import { useAuthStore } from "@/store/auth";
import { createTrip } from "@/api/trips";
import Toast from "@/components/Toast.vue";

const router = useRouter();
const auth = useAuthStore();
const toastRef = ref<InstanceType<typeof Toast> | null>(null);
const loading = ref(false);

// Универсальная реактивная форма для новой поездки
const form = reactive({
  from_: "",
  to: "",
  date: "",
  time: "",
  seats: 1,
  price: 0,
  status: "active", // Если вдруг понадобится
});

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

async function save() {
  if (!form.from_ || !form.to || !form.date || !form.time) {
    toastRef.value?.show("Заполните все поля!");
    return;
  }
  loading.value = true;
  try {
    await createTrip({
      ...form,
      owner_id: auth.user.id, // id текущего пользователя-водителя
      // status: form.status, // Если нужно передавать статус явно
    });
    toastRef.value?.show("Поездка создана!");
    setTimeout(() => router.push("/manage-trips"), 700);
  } catch (e) {
    toastRef.value?.show("Ошибка создания поездки!");
  }
  loading.value = false;
}
</script>

<style scoped>
.offer-trip-page {
  padding: 16px;
  min-height: 100vh;
  background: var(--color-background, #fafbfc);
}
.title {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 18px;
  color: var(--color-text-primary, #232323);
  text-align: center;
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
</style>
