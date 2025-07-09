<template>
  <div class="edit-trip-page">
    <button class="back-button" @click="router.back()">← Назад</button>
    <h2 class="title">Редактировать поездку</h2>
    <form class="form" @submit.prevent="save">
      <label>Откуда</label>
      <select v-model="selectedFrom" class="select">
        <option value="">Выберите город</option>
        <option v-for="city in cities" :key="city" :value="city">{{ city }}</option>
        <option value="other">Другое…</option>
      </select>
      <input
        v-if="selectedFrom === 'other'"
        v-model="from_"
        type="text"
        placeholder="Введите город"
        class="input"
        required
        maxlength="40"
      />
      <input v-else type="hidden" v-model="from_" />

      <label>Куда</label>
      <select v-model="selectedTo" class="select">
        <option value="">Выберите город</option>
        <option v-for="city in cities" :key="city" :value="city">{{ city }}</option>
        <option value="other">Другое…</option>
      </select>
      <input
        v-if="selectedTo === 'other'"
        v-model="to"
        type="text"
        placeholder="Введите город"
        class="input"
        required
        maxlength="40"
      />
      <input v-else type="hidden" v-model="to" />

      <label>Дата</label>
      <input v-model="date" type="date" required class="input" />

      <label>Время</label>
      <input v-model="time" type="time" required class="input" />

      <label>Свободных мест</label>
      <input v-model.number="seats" type="number" min="1" required class="input" />

      <label>Цена (сомони, TJS)</label>
      <input v-model.number="price" type="number" min="0" required class="input" />

      <button class="btn" type="submit" :disabled="loading">Сохранить</button>
    </form>
    <Toast ref="toastRef" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watchEffect } from "vue";
import { useRouter, useRoute } from "vue-router";
import { getTrip, updateTrip } from "@/api/trips";
import Toast from "@/components/Toast.vue";

const cities = [
  "Бохтар", "Бустон", "Вахдат", "Душанбе", "Истаравшан", "Истиклол", "Исфара",
  "Гиссар", "Гулистон", "Канибадам", "Куляб", "Левакант", "Нурек", "Пенджикент",
  "Рогун", "Турсунзаде", "Хорог", "Худжанд"
];

const router = useRouter();
const route = useRoute();
const toastRef = ref<InstanceType<typeof Toast> | null>(null);

const loading = ref(false);

const selectedFrom = ref('');
const selectedTo = ref('');
const from_ = ref('');
const to = ref('');
const date = ref('');
const time = ref('');
const seats = ref(1);
const price = ref(0);

// Синхронизируем select/input
watchEffect(() => {
  from_.value = selectedFrom.value === 'other' ? from_.value : selectedFrom.value;
});
watchEffect(() => {
  to.value = selectedTo.value === 'other' ? to.value : selectedTo.value;
});

onMounted(async () => {
  const tripId = Number(route.params.id);
  if (!tripId) {
    toastRef.value?.show("Ошибка: не найдена поездка!");
    router.back();
    return;
  }
  try {
    const trip = await getTrip(tripId);
    // Автовыбор города в списке
    if (cities.includes(trip.from_)) {
      selectedFrom.value = trip.from_;
    } else {
      selectedFrom.value = 'other';
      from_.value = trip.from_;
    }
    if (cities.includes(trip.to)) {
      selectedTo.value = trip.to;
    } else {
      selectedTo.value = 'other';
      to.value = trip.to;
    }
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
.select, .input {
  padding: 9px 12px;
  border-radius: 7px;
  border: 1px solid var(--color-border, #bbb);
  font-size: 16px;
  outline: none;
  margin-bottom: 6px;
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
