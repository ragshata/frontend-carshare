<template>
  <div class="edit-trip-page">
    <!-- Фоновое изображение -->
    <div class="background-img"></div>

    <!-- Полупрозрачная карточка -->
    <div class="content-card">
      <h2 class="title">Редактировать поездку</h2>
      <form class="form" @submit.prevent="save">
        <label>Откуда</label>
        <input v-model="trip.from_" type="text" required maxlength="40" />

        <label>Куда</label>
        <input v-model="trip.to" type="text" required maxlength="40" />

        <label>Дата</label>
        <input v-model="trip.date" type="date" required />

        <label>Время</label>
        <input v-model="trip.time" type="time" required />

        <label>Свободных мест</label>
        <input v-model.number="trip.seats" type="number" min="1" required />

        <label>Цена (сомони, TJS)</label>
        <input v-model.number="trip.price" type="number" min="0" required />

        <button class="btn" type="submit" :disabled="loading">Сохранить</button>
        <button class="btn btn-danger" @click.prevent="deleteTrip" :disabled="loading">Удалить</button>
      </form>
      <Toast ref="toastRef" />
    </div>
  </div>
</template>


<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { getTripById, updateTrip, deleteTrip as apiDeleteTrip } from "@/api/trips";
import Toast from "@/components/Toast.vue";

const router = useRouter();
const route = useRoute();
const toastRef = ref<InstanceType<typeof Toast> | null>(null);
const loading = ref(false);

const trip = reactive({
  id: 0,
  from_: "",
  to: "",
  date: "",
  time: "",
  seats: 1,
  price: 0,
  status: ""
});

onMounted(async () => {
  const id = Number(route.query.id || route.params.id);
  if (!id) return router.back();
  loading.value = true;
  try {
    const data = await getTripById(id);
    Object.assign(trip, data);
  } catch {
    toastRef.value?.show("Ошибка загрузки поездки");
    router.back();
  }
  loading.value = false;
});

async function save() {
  loading.value = true;
  try {
    await updateTrip(trip.id, trip);
    toastRef.value?.show("Поездка обновлена!");
    setTimeout(() => router.push("/manage-trips"), 700);
  } catch {
    toastRef.value?.show("Ошибка сохранения");
  }
  loading.value = false;
}

async function deleteTrip() {
  if (!confirm("Удалить поездку?")) return;
  loading.value = true;
  try {
    await apiDeleteTrip(trip.id);
    toastRef.value?.show("Поездка удалена");
    setTimeout(() => router.push("/manage-trips"), 700);
  } catch {
    toastRef.value?.show("Ошибка удаления");
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

.content-card {
  position: relative;
  z-index: 2;
  max-width: 480px;
  margin: 36px auto;
  padding: 24px 18px 32px;
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
  color: var(--color-text-primary);
  text-align: center;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 13px;
}

input {
  padding: 9px 12px;
  border-radius: 7px;
  border: 1px solid var(--color-border, #bbb);
  font-size: 16px;
  outline: none;
  width: 100%;
  box-sizing: border-box;
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

.btn-danger {
  background: #e53935;
  color: white;
  margin-top: 8px;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

</style>
