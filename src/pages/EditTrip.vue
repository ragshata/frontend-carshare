<template>
  <div class="edit-trip-page">
    <button class="back-button" @click="router.back()">← Назад</button>
    <h2 class="title">Редактировать поездку</h2>
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

      <button class="btn" type="submit" :disabled="loading">Сохранить</button>
    </form>
    <Toast ref="toastRef" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { getTrip, updateTrip } from "@/api/trips";
import Toast from "@/components/Toast.vue";

const router = useRouter();
const route = useRoute();
const toastRef = ref<InstanceType<typeof Toast> | null>(null);

const loading = ref(false);

// Все поля поездки
const from_ = ref("");
const to = ref("");
const date = ref("");
const time = ref("");
const seats = ref(1);
const price = ref(0);

onMounted(async () => {
  const tripId = Number(route.params.id);
  if (!tripId) {
    toastRef.value?.show("Ошибка: не найдена поездка!");
    router.back();
    return;
  }
  try {
    const trip = await getTrip(tripId);
    from_.value = trip.from_ || "";
    to.value = trip.to || "";
    date.value = trip.date || "";
    time.value = trip.time || "";
    seats.value = trip.seats || 1;
    price.value = trip.price || 0;
  } catch {
    toastRef.value?.show("Ошибка загрузки поездки");
    router.back();
  }
});

async function save() {
  loading.value = true;
  try {
    await updateTrip({
      id: Number(route.params.id),
      from_: from_.value,
      to: to.value,
      date: date.value,
      time: time.value,
      seats: seats.value,
      price: price.value,
    });
    toastRef.value?.show("Поездка обновлена!");
    setTimeout(() => router.push("/manage-trips"), 700);
  } catch {
    toastRef.value?.show("Ошибка сохранения!");
  }
  loading.value = false;
}
</script>

<style scoped>
.edit-trip-page {
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
