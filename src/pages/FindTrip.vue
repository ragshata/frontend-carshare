<template>
  <div class="find-trip-page">
    <div class="background-img"></div>

    <div class="form-card">
      <h2 class="title">Поиск поездок</h2>
      <form class="form" @submit.prevent="goToResults">
        <label for="from_">Откуда</label>
        <select v-model="selectedFrom" id="from_" class="select">
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
        />
        <input
          v-else
          type="hidden"
          v-model="form.from_"
        />

        <label for="to">Куда</label>
        <select v-model="selectedTo" id="to" class="select">
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
        />
        <input
          v-else
          type="hidden"
          v-model="form.to"
        />

        <label for="date">Дата</label>
        <input v-model="form.date" id="date" type="date" class="input" />

        <div class="buttons">
          <button type="submit" class="btn">Найти поездки</button>
          <button type="button" class="btn btn-outline" @click="resetFilters">
            Сбросить фильтры
          </button>
        </div>
      </form>
    </div>
  </div>
</template>


<script setup lang="ts">
import { useSmartBack } from '@/utils/navigation';
import { reactive, ref, watch, onMounted, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';

const cities = [
  "Бохтар", "Бустон", "Вахдат", "Душанбе", "Истаравшан", "Истиклол", "Исфара",
  "Гиссар", "Гулистон", "Канибадам", "Куляб", "Левакант", "Нурек", "Пенджикент",
  "Рогун", "Турсунзаде", "Хорог", "Худжанд",
  "Мургаб", "Фархор", "Шахритус", "Зафарабад", "Балх", "Гарм", "Гафуров", "Яван",
  "Шарора", "Абдурахмони Джоми", "Дангара", "Дусти", "Кубодиён", "Московский",
  "Муминабад", "Пяндж", "Ховалинг", "Хулбук", "20-летия Независимости", "Вахш",
  "Кировский", "Обикиик", "Орзу", "Пархар", "Хаётинав", "Навкат", "Мехнатобод",
  "Адрасман", "Зарнисор", "Зеравшан", "Кансай", "Варзоб", "Чорбог", "Такоб",
  "Симиганч", "Дехмой", "Навобод", "Сангтуда", "Чилгази", "Кухистони Мастчох",
  "Патрук", "Поршинев", "Ванж", "Рушан", "Дарвоз", "Шахринав", "Лахш", "Файзабад",
  "Джиликуль", "Джайхун", "Хуросон", "Хамадони", "Восе", "Дангарин", "Темурмалик",
  "Балджуван", "Муминобод", "Носири Хусрав", "Джалолиддин Балхи", "Спитамен",
  "Мастчох", "Ашт", "Бободжон Гафуров", "Джаббор Расулов", "Деваштич", "Шахристан", "Айни"
];


const router = useRouter();

const form = reactive({
  from_: '',
  to: '',
  date: ''
});
const selectedFrom = ref('');
const selectedTo = ref('');

// Следим за выбором и синхронизируем input/select
watch(selectedFrom, (val) => {
  form.from_ = val === 'other' ? '' : val;
});
watch(selectedTo, (val) => {
  form.to = val === 'other' ? '' : val;
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

function resetFilters() {
  selectedFrom.value = '';
  selectedTo.value = '';
  Object.assign(form, { from_: '', to: '', date: '' });
}

function goToResults() {
  const allEmpty = !form.from_ && !form.to && !form.date;
  if (allEmpty) {
    router.push({ path: '/search-results' });
    return;
  }
  const query: Record<string, string> = {};
  Object.entries(form).forEach(([key, value]) => {
    if (value) query[key] = value;
  });
  router.push({ path: '/search-results', query });
}
</script>

<style scoped>
.find-trip-page {
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
  margin-bottom: 24px;
  color: #232323;
  text-align: center;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.select, .input {
  padding: 9px 12px;
  border-radius: 7px;
  border: 1px solid var(--color-border, #bbb);
  font-size: 16px;
  outline: none;
  margin-bottom: 6px;
}

.buttons {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 12px;
}

.btn {
  background: var(--color-primary);
  color: white;
  padding: 12px;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}
.btn:hover {
  background-color: #0069d9;
}
.btn-outline {
  background: transparent;
  color: var(--color-primary);
  border: 1px solid var(--color-primary);
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

</style>
