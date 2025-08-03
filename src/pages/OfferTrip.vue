<template>
  <div class="offer-trip-page">
    <div class="background-img"></div>

    <div class="content-card">
      <h2 class="title">Создать поездку</h2>

      <form class="form" @submit.prevent="save">
        <!-- Откуда -->
        <label>Откуда</label>
        <div class="input-wrapper">
          <input
            v-model="form.from_"
            type="text"
            placeholder="Начните вводить город"
            class="input"
            required
            maxlength="40"
          />
          <div v-if="showFromSuggestions" class="suggestions">
            <div
              v-for="city in filteredFromCities"
              :key="city"
              class="suggestion"
              @click="selectFromCity(city)"
            >
              {{ city }}
            </div>
          </div>
        </div>

        <!-- Куда -->
        <label>Куда</label>
        <div class="input-wrapper">
          <input
            v-model="form.to"
            type="text"
            placeholder="Начните вводить город"
            class="input"
            required
            maxlength="40"
          />
          <div v-if="showToSuggestions" class="suggestions">
            <div
              v-for="city in filteredToCities"
              :key="city"
              class="suggestion"
              @click="selectToCity(city)"
            >
              {{ city }}
            </div>
          </div>
        </div>

        <!-- Остальные поля -->
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
import { reactive, ref, onMounted, onBeforeUnmount, computed } from 'vue';
import { useRouter } from "vue-router";
import { useAuthStore } from "@/store/auth";
import { createTrip } from "@/api/trips";
import { getCities } from "@/api/cities";
import { useSmartBack } from "@/utils/navigation";
import Toast from "@/components/Toast.vue";

const router = useRouter();
const auth = useAuthStore();
const toastRef = ref<InstanceType<typeof Toast> | null>(null);
const loading = ref(false);

const defaultCities = [
  "Бохтар","Бустон","Вахдат","Душанбе","Истаравшан","Истиклол","Исфара",
  "Гиссар","Гулистон","Канибадам","Куляб","Левакант","Нурек","Пенджикент",
  "Рогун","Турсунзаде","Хорог","Худжанд",
  "Мургаб","Фархор","Шахритус","Зафарабад","Балх","Гарм","Гафуров","Яван",
  "Шарора","Абдурахмони Джоми","Дангара","Дусти","Кубодиён","Московский",
  "Муминабад","Пяндж","Ховалинг","Хулбук","20-летия Независимости","Вахш",
  "Кировский","Обикиик","Орзу","Пархар","Хаётинав","Навкат","Мехнатобод",
  "Адрасман","Зарнисор","Зеравшан","Кансай","Варзоб","Чорбог","Такоб",
  "Симиганч","Дехмой","Навобод","Сангтуда","Чилгази","Кухистони Мастчох",
  "Патрук","Поршинев","Ванж","Рушан","Дарвоз","Шахринав","Лахш","Файзабад",
  "Джиликуль","Джайхун","Хуросон","Хамадони","Восе","Дангарин","Темурмалик",
  "Балджуван","Муминобод","Носири Хусрав","Джалолиддин Балхи","Спитамен",
  "Мастчох","Ашт","Бободжон Гафуров","Джаббор Расулов","Деваштич","Шахристан","Айни"
];

const extraCities = ref<string[]>([]);
const allCities = computed(() => {
  const lowerDefaults = defaultCities.map(c => c.toLowerCase());
  const filteredExtra = extraCities.value.filter(
    c => !lowerDefaults.includes(c.toLowerCase())
  );
  return [...defaultCities, ...filteredExtra];
});

// Состояние формы
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

// Подсказки
const filteredFromCities = computed(() => {
  if (!form.from_) return [];
  return allCities.value.filter(c =>
    c.toLowerCase().startsWith(form.from_.toLowerCase())
  );
});
const filteredToCities = computed(() => {
  if (!form.to) return [];
  return allCities.value.filter(c =>
    c.toLowerCase().startsWith(form.to.toLowerCase())
  );
});
const showFromSuggestions = computed(() => form.from_.length > 0 && filteredFromCities.value.length > 0);
const showToSuggestions = computed(() => form.to.length > 0 && filteredToCities.value.length > 0);

function selectFromCity(city: string) {
  form.from_ = city;
}
function selectToCity(city: string) {
  form.to = city;
}

// Загрузка городов
async function loadCities() {
  try {
    extraCities.value = await getCities();
  } catch (e) {
    console.error("Не удалось загрузить города", e);
  }
}

onMounted(() => {
  if (!auth.user?.active_driver) {
    router.replace("/buy-access");
    return;
  }

  loadCities();

  const tg = (window as any).Telegram?.WebApp;
  tg?.BackButton?.show?.();
  tg?.BackButton?.onClick?.(() => {
    useSmartBack(router);
  });
});

onBeforeUnmount(() => {
  const tg = (window as any).Telegram?.WebApp;
  tg?.BackButton?.hide?.();
  tg?.BackButton?.offClick?.();
});

// Создание поездки
async function save() {
  if (!form.from_ || !form.to || !form.date || !form.time) {
    toastRef.value?.show("Заполните все поля!");
    return;
  }

  loading.value = true;
  try {
    const res = await createTrip({ ...form, owner_id: auth.user.id });
    toastRef.value?.show(`Поездка создана: ${res.from_} → ${res.to}`);

    // Добавляем новые города в список
    [res.from_, res.to].forEach(city => {
      if (!allCities.value.some(c => c.toLowerCase() === city.toLowerCase())) {
        extraCities.value.push(city);
      }
    });

    setTimeout(() => router.push("/manage-trips"), 1000);
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
  position: fixed;
  inset: 0;
  overflow-y: auto;
}

.input-wrapper {
  position: relative;
}

.suggestions {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #ccc;
  max-height: 180px;
  overflow-y: auto;
  z-index: 10;
  border-radius: 6px;
}
.suggestion {
  padding: 8px 10px;
  cursor: pointer;
}
.suggestion:hover {
  background: #f5f5f5;
}
.offer-trip-page {
  padding: 16px;
  min-height: 100vh;
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

.input-wrapper {
  position: relative;
}

.input,
.select,
textarea.input {
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

.suggestions {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #ccc;
  max-height: 180px;
  overflow-y: auto;
  z-index: 10;
  border-radius: 6px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.08);
}

.suggestion {
  padding: 8px 10px;
  cursor: pointer;
  font-size: 15px;
}

.suggestion:hover {
  background: #f5f5f5;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

</style>
