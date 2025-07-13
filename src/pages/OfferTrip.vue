<template>
  <div class="offer-trip-page">
    <h2 class="title">Создать поездку</h2>

    <!-- 🚫 Модалка с тарифами/триалом для водителей -->
    <div v-if="showTrialModal" class="modal-overlay">
      <div class="modal">
        <h3>Доступ к размещению поездок</h3>
        <ul class="tariff-list">
          <li>За 1 день: <b>10 сомони</b></li>
          <li>За 1 неделю: <b>50 сомони</b></li>
          <li>За 1 месяц: <b>150 сомони</b></li>
        </ul>
        <div class="trial-info">
          <b>Первые 3 дня бесплатно — для теста!</b>
        </div>
        <button class="btn" @click="activateTrial" :disabled="loadingTrial">
          Начать пробный период 3 дня
        </button>
        <div v-if="trialEnd" class="trial-end">
          Пробный период активен до: {{ trialEnd }}
        </div>
        <button class="btn btn-outline" style="margin-top:10px" @click="router.back()">Назад</button>
      </div>
    </div>

    <!-- 🚫 Плашка для неактивных водителей (триал и платные опции) -->
    <div v-else-if="!canCreate" class="locked-block">
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
import axios from 'axios';
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

// ===== Новая логика триала и тарифов =====
const showTrialModal = ref(false);
const loadingTrial = ref(false);
const trialEnd = ref<string | null>(null);

// Проверяем, можно ли создавать поездки
const canCreate = ref(true);

onMounted(() => {
  const user = auth.user;
  // Нет триала или триал истёк
  if (
    user.is_driver &&
    (!user.active_driver ||
      !user.driver_trial_end ||
      new Date(user.driver_trial_end) < new Date())
  ) {
    showTrialModal.value = true;
    canCreate.value = false;
    trialEnd.value = user.driver_trial_end
      ? new Date(user.driver_trial_end).toLocaleString('ru-RU')
      : null;
  } else {
    showTrialModal.value = false;
    canCreate.value = true;
  }

  // ТГ кнопка назад
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

// ===== Активация триального периода =====
async function activateTrial() {
  loadingTrial.value = true;
  try {
    const res = await axios.post('/api/start_driver_trial', { user_id: auth.user.id });
    // После успешного актива триала
    auth.user.active_driver = true;
    auth.user.driver_trial_end = res.data.trial_end;
    trialEnd.value = new Date(res.data.trial_end).toLocaleString('ru-RU');
    showTrialModal.value = false;
    canCreate.value = true;
    toastRef.value?.show('Пробный период активирован!');
  } catch (e: any) {
    toastRef.value?.show(e.response?.data?.detail || 'Ошибка!');
  }
  loadingTrial.value = false;
}

// ====== Форма ======
const selectedFrom = ref('');
const selectedTo = ref('');

const form = reactive({
  from_: "",
  to: "",
  date: "",
  time: "",
  seats: 1,
  price: 0,
  status: "active",
  description: "",
});

watchEffect(() => {
  form.from_ = selectedFrom.value === 'other' ? form.from_ : selectedFrom.value;
});
watchEffect(() => {
  form.to = selectedTo.value === 'other' ? form.to : selectedTo.value;
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

/* Модалка */
.modal-overlay {
  position: fixed; inset: 0; z-index: 100;
  background: rgba(0,0,0,0.22);
  display: flex; align-items: center; justify-content: center;
}
.modal {
  background: #fff;
  border-radius: 16px;
  padding: 30px 26px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.10);
  min-width: 260px; max-width: 97vw; text-align: center;
}
.tariff-list {
  padding-left: 0;
  margin: 0 0 10px 0;
  list-style: none;
}
.tariff-list li { margin-bottom: 3px; }
.trial-info { margin: 13px 0 4px 0; color: #198754; font-weight: 500; }
.trial-end { color: #555; font-size: 14px; margin-top: 10px; }
.btn-outline {
  background: transparent;
  color: var(--color-primary, #007bff);
  border: 1.5px solid var(--color-primary, #007bff);
}
</style>