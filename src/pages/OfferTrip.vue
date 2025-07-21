<template>
  <div class="offer-trip-page">
    <!-- Фон -->
    <div class="background-img"></div>

    <!-- Карточка -->
    <div class="content-card">
      <h2 class="title">Создать поездку</h2>

      <!-- Модалка с тарифами и триалом -->
      <div v-if="showTrialModal" class="modal-overlay">
        <div class="modal">
          <h3 class="modal-title">Доступ к созданию поездок</h3>
          <p class="tariff-desc">
            Публикация поездок платная:<br>
            <b>1 день — 10 сомони</b><br>
            <b>1 неделя — 50 сомони</b><br>
            <b>1 месяц — 150 сомони</b>
          </p>
          <div class="trial-desc">
            <b>Первые 3 дня — бесплатно</b><br>
            Протестируйте функционал без оплаты.<br>
          </div>
          <button class="btn" @click="activateTrial" :disabled="loadingTrial">
            {{ loadingTrial ? "..." : "Начать пробный период" }}
          </button>
          <button class="btn btn-outline" @click="router.back()" style="margin-top:8px;">Назад</button>
        </div>
      </div>

      <!-- 🚫 Блок при отсутствии доступа -->
      <div v-if="!canCreate && !showTrialModal" class="locked-block">
        <div class="locked-msg">
          🚫 У вас нет доступа к созданию поездок.<br>
          Для публикации активируйте триал или тариф.<br>
          <span v-if="trialEnd">Пробный период истёк: {{ trialEnd }}</span>
        </div>
        <button class="btn" @click="showTrialModal = true">Открыть тарифы</button>
        <button class="btn btn-outline" @click="router.back()" style="margin-left:7px;">Назад</button>
      </div>

      <!-- Основная форма -->
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

        <label>Особенности поездки</label>
        <textarea
          v-model="form.description"
          class="input"
          rows="2"
          maxlength="300"
          placeholder="Например: заезд в город N, можно с животными, кондиционер и т.д."
        ></textarea>

        <button class="btn" type="submit" :disabled="loading">Создать</button>
      </form>
    </div>

    <Toast ref="toastRef" />
  </div>
</template>


<script setup lang="ts">
import { reactive, ref, computed, onMounted, onBeforeUnmount, watchEffect } from 'vue';
import { useRouter } from "vue-router";
import { useAuthStore } from "@/store/auth";
import { createTrip } from "@/api/trips";
import { startDriverTrial } from "@/api/trial"; // <-- добавь эту функцию в api/trial.ts
import { useSmartBack } from "@/utils/navigation";
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
const loadingTrial = ref(false);

const showTrialModal = ref(false);

const canCreate = computed(() => !!auth.user?.active_driver);

const trialEnd = ref(auth.user?.driver_trial_end
  ? new Date(auth.user.driver_trial_end).toLocaleString('ru-RU')
  : "");

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



onMounted(() => {
  const tg = (window as any).Telegram?.WebApp;
  if (tg?.BackButton) {
    tg.BackButton.show();
    tg.BackButton.onClick(() => {
      useSmartBack(router); // передай свой router
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
    const res = await startDriverTrial(auth.user.id);
    auth.user.active_driver = true;
    auth.user.driver_trial_end = res.trial_end;
    trialEnd.value = new Date(res.trial_end).toLocaleString('ru-RU');
    showTrialModal.value = false;
    toastRef.value?.show('Пробный период активирован!');
  } catch (e: any) {
    toastRef.value?.show(e.response?.data?.detail || 'Ошибка!');
  }
  loadingTrial.value = false;
}

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
/* ========== Модалка для тарифа/триала ========== */
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 1002;
  background: rgba(20, 20, 24, 0.22);
  display: flex;
  align-items: center;
  justify-content: center;
}
.modal {
  background: #fff;
  border-radius: 19px;
  padding: 30px 20px 20px 20px;
  min-width: 260px;
  max-width: 94vw;
  text-align: center;
  box-shadow: 0 6px 24px rgba(0,0,0,0.11);
}
.modal-title {
  font-size: 21px;
  font-weight: bold;
  margin-bottom: 12px;
}
.tariff-desc {
  font-size: 17px;
  color: #111;
  margin-bottom: 13px;
  font-weight: 500;
}
.trial-desc {
  background: #f4f8ff;
  border-radius: 10px;
  color: #217;
  font-size: 15px;
  padding: 10px 7px 8px 7px;
  margin-bottom: 14px;
}
.btn {
  background: var(--color-primary, #007bff);
  color: white;
  border: none;
  padding: 11px 18px;
  border-radius: 8px;
  font-size: 17px;
  cursor: pointer;
  margin-top: 4px;
  transition: background 0.2s;
}
.btn-outline {
  background: transparent;
  color: var(--color-primary, #007bff);
  border: 1.5px solid var(--color-primary, #007bff);
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
.input, .select, textarea.input {
  padding: 9px 12px;
  border-radius: 7px;
  border: 1px solid var(--color-border, #bbb);
  font-size: 16px;
  outline: none;
  box-sizing: border-box;
  resize: none;
  margin-bottom: 8px;
  width: 100%;
}
textarea.input {
  min-height: 44px;
  max-height: 130px;
}
.offer-trip-page {
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
  margin: 38px auto;
  padding: 24px 18px 32px;
  background: rgba(255, 255, 255, 0.45);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border-radius: 18px;
  box-shadow: 0 6px 14px rgba(0, 0, 0, 0.1);
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

</style>
