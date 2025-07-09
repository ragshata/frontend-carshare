<template>
  <div class="offer-trip-page">
    <h2 class="title">Создать поездку</h2>

    <!-- 🚫 Плашка для неактивных водителей -->
    <div v-if="!canCreate" class="locked-block">
      <div class="locked-msg">
        🚫 У вас нет доступа к созданию поездок.<br>
        Попросите администратора активировать возможность публикации поездок.
      </div>
      <button class="btn" @click="router.back()">Назад</button>
    </div>

    <!-- Основная форма — только если есть доступ -->
    <form v-else class="form" @submit.prevent="save">
      <label>Откуда</label>
      <select v-model="selectedFrom" class="select">
        <option value="">Выберите город</option>
        <option v-for="city in cities" :key="city" :value="city">{{ city }}</option>
        <option value="other">Другое…</option>
      </select>
      <input
        v-if="selectedFrom === 'other'"
        v-model="form.from_"
        type="text"
        placeholder="Введите город"
        class="input"
        required
        maxlength="40"
      />
      <input v-else type="hidden" v-model="form.from_" />

      <label>Куда</label>
      <select v-model="selectedTo" class="select">
        <option value="">Выберите город</option>
        <option v-for="city in cities" :key="city" :value="city">{{ city }}</option>
        <option value="other">Другое…</option>
      </select>
      <input
        v-if="selectedTo === 'other'"
        v-model="form.to"
        type="text"
        placeholder="Введите город"
        class="input"
        required
        maxlength="40"
      />
      <input v-else type="hidden" v-model="form.to" />

      <label>Дата</label>
      <input v-model="form.date" type="date" required class="input" />

      <label>Время</label>
      <input v-model="form.time" type="time" required class="input" />

      <label>Свободных мест</label>
      <input v-model.number="form.seats" type="number" min="1" required class="input" />

      <label>Цена (сомони, TJS)</label>
      <input v-model.number="form.price" type="number" min="0" required class="input" />

      <!-- Новая плашка: Особенности поездки -->
      <label>Особенности поездки</label>
      <textarea
        v-model="form.description"
        class="input"
        rows="2"
        maxlength="300"
        placeholder="Например: заезд в город N, можно с животными, кондиционер, тихая музыка, без остановок и т.д."
      ></textarea>

      <button class="btn" type="submit" :disabled="loading">Создать</button>
    </form>
    <Toast ref="toastRef" />
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted, onBeforeUnmount, watchEffect } from 'vue';
import { useRouter } from "vue-router";
import { useAuthStore } from "@/store/auth";
import { createTrip } from "@/api/trips";
import Toast from "@/components/Toast.vue";

const cities = [
  "Бохтар", "Бустон", "Вахдат", "Душанбе", "Истаравшан", "Истиклол", "Исфара",
  "Гиссар", "Гулистон", "Канибадам", "Куляб", "Левакант", "Нурек", "Пенджикент",
  "Рогун", "Турсунзаде", "Хорог", "Худжанд"
];

const router = useRouter();
const auth = useAuthStore();
const toastRef = ref<InstanceType<typeof Toast> | null>(null);
const loading = ref(false);

const selectedFrom = ref('');
const selectedTo = ref('');
const canCreate = auth.user?.active_driver !== false;

const form = reactive({
  from_: "",
  to: "",
  date: "",
  time: "",
  seats: 1,
  price: 0,
  status: "active",
  description: "", // Новое поле
});

watchEffect(() => {
  form.from_ = selectedFrom.value === 'other' ? form.from_ : selectedFrom.value;
});
watchEffect(() => {
  form.to = selectedTo.value === 'other' ? form.to : selectedTo.value;
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
      owner_id: auth.user.id,
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
.input, textarea.input {
  padding: 9px 12px;
  border-radius: 7px;
  border: 1px solid var(--color-border, #bbb);
  font-size: 16px;
  outline: none;
  width: 100%;
  box-sizing: border-box;
  resize: none;
  margin-bottom: 8px;
}
textarea.input {
  min-height: 44px;
  max-height: 130px;
}

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
.locked-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: 50px 0 36px 0;
}
.locked-msg {
  background: #ffeaea;
  color: #c00;
  padding: 22px 28px;
  border-radius: 16px;
  font-size: 18px;
  text-align: center;
  margin-bottom: 18px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.07);
}
.form {
  display: flex;
  flex-direction: column;
  gap: 13px;
  max-width: 380px;
  margin: 0 auto;
}
.input, .select {
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
