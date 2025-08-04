<template>
  <div class="find-trip-page">
    <div class="background-img"></div>

    <div class="form-card">
      <h2 class="title">Поиск поездок</h2>
      <form class="form" @submit.prevent="goToResults">
        <label>Откуда</label>
        <input
          v-model="fromQuery"
          @input="onFromInput"
          type="text"
          placeholder="Начните вводить город"
          class="input"
          maxlength="40"
          @focus="showSuggestionsFrom = true"
          autocomplete="off"
        />
        <div
          v-if="showSuggestionsFrom && filteredCitiesFrom.length"
          class="suggestions"
          :style="{ bottom: kbOpenOffset ? kbOpenOffset + 8 + 'px' : 'auto' }"
        >
          <div
            v-for="city in filteredCitiesFrom"
            :key="city"
            class="suggestion"
            @click.prevent="selectFromCity(city)"
          >
            {{ city }}
          </div>
        </div>

        <label>Куда</label>
        <input
          v-model="toQuery"
          @input="onToInput"
          type="text"
          placeholder="Начните вводить город"
          class="input"
          maxlength="40"
          @focus="showSuggestionsTo = true"
          autocomplete="off"
        />
        <div
          v-if="showSuggestionsTo && filteredCitiesTo.length"
          class="suggestions"
          :style="{ bottom: kbOpenOffset ? kbOpenOffset + 8 + 'px' : 'auto' }"
        >
          <div
            v-for="city in filteredCitiesTo"
            :key="city"
            class="suggestion"
            @click.prevent="selectToCity(city)"
          >
            {{ city }}
          </div>
        </div>

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
import { reactive, ref, computed, watch, onMounted, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import { getCities } from '@/api/cities';

const router = useRouter();

const defaultCities = [
  'Бохтар','Бустон','Вахдат','Душанбе','Истаравшан','Истиклол','Исфара',
  'Гиссар','Гулистон','Канибадам','Куляб','Левакант','Нурек','Пенджикент',
  'Рогун','Турсунзаде','Хорог','Худжанд','Мургаб','Фархор','Шахритус','Зафарабад',
  'Балх','Гарм','Гафуров','Яван','Шарора','Абдурахмони Джоми','Дангара','Дусти',
  'Кубодиён','Московский','Муминабад','Пяндж','Ховалинг','Хулбук',
  '20-летия Независимости','Вахш','Кировский','Обикиик','Орзу','Пархар','Хаётинав',
  'Навкат','Мехнатобод','Адрасман','Зарнисор','Зеравшан','Кансай','Варзоб',
  'Чорбог','Такоб','Симиганч','Дехмой','Навобод','Сангтуда','Чилгази','Кухистони Мастчох',
  'Патрук','Поршинев','Ванж','Рушан','Дарвоз','Шахринав','Лахш','Файзабад',
  'Джиликуль','Джайхун','Хуросон','Хамадони','Восе','Дангарин','Темурмалик',
  'Балджуван','Муминобод','Носири Хусрав','Джалолиддин Балхи','Спитамен',
  'Мастчох','Ашт','Бободжон Гафуров','Джаббор Расулов','Деваштич','Шахристан','Айни'
];
const extraCities = ref<string[]>([]);
const allCities = computed(() => {
  const low = defaultCities.map(c => c.toLowerCase());
  return [...defaultCities, ...extraCities.value.filter(c => !low.includes(c.toLowerCase()))];
});

const form = reactive({
  from_: '',
  to: '',
  date: ''
});
const fromQuery = ref('');
const toQuery = ref('');
const showSuggestionsFrom = ref(false);
const showSuggestionsTo = ref(false);
const kbOpenOffset = ref(0);

const latinToCyr: Record<string, string> = { a:'а',b:'б',c:'с',d:'д',e:'е',f:'ф',g:'г',h:'х',i:'и',j:'й',k:'к',l:'л',m:'м',n:'н',o:'о',p:'п',q:'к',r:'р',s:'с',t:'т',u:'у',v:'в',w:'в',x:'кс',y:'ы',z:'з' };
const toCyr = (t: string) => t.split('').map(ch => {
  const l = ch.toLowerCase(); const r = latinToCyr[l] ?? ch;
  return ch === l ? r : r.toUpperCase();
}).join('');
const filter = (q: string) => {
  if (!q) return [];
  const raw = q.toLowerCase(), cyr = toCyr(q).toLowerCase();
  return allCities.value.filter(c => {
    const l = c.toLowerCase();
    return l.startsWith(raw) || l.startsWith(cyr);
  }).slice(0, 15);
};
const filteredCitiesFrom = computed(() => filter(fromQuery.value));
const filteredCitiesTo = computed(() => filter(toQuery.value));

watch(fromQuery, v => form.from_ = v);
watch(toQuery, v => form.to = v);

function onFromInput(e: Event) {
  const el = e.target as HTMLInputElement;
  fromQuery.value = el.value;
  showSuggestionsFrom.value = fromQuery.value.trim().length > 0;
}
function onToInput(e: Event) {
  const el = e.target as HTMLInputElement;
  toQuery.value = el.value;
  showSuggestionsTo.value = toQuery.value.trim().length > 0;
}
function selectFromCity(city: string) {
  form.from_ = fromQuery.value = city;
  showSuggestionsFrom.value = false;
}
function selectToCity(city: string) {
  form.to = toQuery.value = city;
  showSuggestionsTo.value = false;
}

onMounted(async () => {
  const tg = (window as any).Telegram?.WebApp;
  tg?.BackButton?.show?.();
  tg?.BackButton?.onClick?.(() => useSmartBack(router));

  try {
    extraCities.value = await getCities();
  } catch (e) {
    console.error("Ошибка загрузки городов:", e);
  }
  if ('visualViewport' in window) {
    window.visualViewport!.addEventListener('resize', () => {
      const diff = window.innerHeight - window.visualViewport!.height;
      kbOpenOffset.value = diff > 80 ? diff : 0;
    });
  }
});

onBeforeUnmount(() => {
  const tg = (window as any).Telegram?.WebApp;
  tg?.BackButton?.hide();
  tg?.BackButton?.offClick?.();
});

function resetFilters() {
  Object.assign(form, { from_: '', to: '', date: '' });
  fromQuery.value = '';
  toQuery.value = '';
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
.suggestions{
  position:fixed;
  left:12px; right:12px;
  top:calc(50vh - 10px);
  max-height:200px;
  overflow-y:auto;
  background:#fff;
  border:1px solid #ccc;
  border-radius:12px 12px 8px 8px;
  box-shadow:0 4px 18px rgba(0,0,0,.08);
  z-index:10000;
}
.suggestion{
  padding:10px 14px;
  font-size:16px;
  cursor:pointer;
}
.suggestion:active{ background:#f0f4ff; }
.suggestion:hover { background: #f0f0f0; }
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
