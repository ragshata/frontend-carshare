<template>
  <div class="offer-trip-page">
    <h2 class="title">Создать поездку</h2>
    <form class="form" @submit.prevent="save">
      <label>Откуда</label>
      <input v-model="from_" type="text" required maxlength="40" />

      <label>Куда</label>
      <input v-model="to" type="text" required maxlength="40" />

      <label>Дата</label>
      <input v-model="date" type="date" required />

      <label>Время</label>
      <input v-model="time" type="time" required />

      <label>Свободных мест</label>
      <input v-model.number="seats" type="number" min="1" required />

      <label>Цена</label>
      <input v-model.number="price" type="number" min="0" required />

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

// Все поля новой поездки
const from_ = ref("");
const to = ref("");
const date = ref("");
const time = ref("");
const seats = ref(1);
const price = ref(0);

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

async function save() {
  if (!from_.value || !to.value || !date.value || !time.value) {
    toastRef.value?.show("Заполните все поля!");
    return;
  }
  loading.value = true;
  try {
    await createTrip({
      from_: from_.value,
      to: to.value,
      date: date.value,
      time: time.value,
      seats: seats.value,
      price: price.value,
      owner_id: auth.user.id, // или ownerId, если поле называется иначе в бэке
    });
    toastRef.value?.show("Поездка создана!");
    setTimeout(() => router.push("/manage-trips"), 700);
  } catch {
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
.back-button {
  background: transparent;
  border: 1px solid var(--color-primary, #007bff);
  color: var(--color-primary, #007bff);
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
