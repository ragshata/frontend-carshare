<template>
  <div class="edit-trip-page">
    <div class="background-img"></div>

    <div class="form-card">
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
    </div>
    <Toast ref="toastRef" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watchEffect, onBeforeUnmount } from "vue";
import { useRouter, useRoute } from "vue-router";
import { getTrip, updateTrip } from "@/api/trips";
import { getCities } from "@/api/cities";
import Toast from "@/components/Toast.vue";

const cities = ref<string[]>([]);

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
  const tg = (window as any).Telegram?.WebApp;
  if (tg?.BackButton) {
    tg.BackButton.show();
    tg.BackButton.onClick(() => {
      router.back();
    });
  }

  // Подгружаем список городов с сервера
  try {
    const cityList = await getCities();
    cities.value = cityList;
  } catch (e) {
    console.error("Ошибка загрузки городов:", e);
    toastRef.value?.show("Не удалось загрузить города");
  }

  const tripId = Number(route.params.id);
  if (!tripId) {
    toastRef.value?.show("Ошибка: не найдена поездка!");
    router.back();
    return;
  }
  try {
    const trip = await getTrip(tripId);
    // Автовыбор города в списке
    if (cities.value.includes(trip.from_)) {
      selectedFrom.value = trip.from_;
    } else {
      selectedFrom.value = 'other';
      from_.value = trip.from_;
    }
    if (cities.value.includes(trip.to)) {
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

onBeforeUnmount(() => {
  const tg = (window as any).Telegram?.WebApp;
  tg?.BackButton?.hide();
  tg?.BackButton?.offClick?.();
});

async function save() {
  loading.value = true;
  try {
    await updateTrip(Number(route.params.id), {
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
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  overflow-y: auto;
  background: transparent;
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

.select, .input {
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

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

</style>
