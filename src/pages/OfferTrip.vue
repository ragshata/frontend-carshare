<template>
  <div class="offer-trip-page">
    <div class="background-img"></div>

    <div class="content-card">
      <h2 class="title">Создать поездку</h2>

      <form class="form" @submit.prevent="save">
        <!-- Откуда -->
        <input
          v-model="fromQuery"
          @input="onFromInput"
          type="text"
          placeholder="Начните вводить город"
          class="input"
          required
          maxlength="40"
          @focus="showSuggestionsFrom = true"
          autocomplete="off"
        />

        <!-- Список подсказок «Откуда» -->
        <div
          v-if="showSuggestionsFrom && filteredCitiesFrom.length"
          class="suggestions"
          :style="{ bottom: kbOpenOffset ? kbOpenOffset + 8 + 'px' : 'auto' }"
        >
          <div
            v-for="city in filteredCitiesFrom"
            :key="city"
            class="suggestion"
            @mousedown.prevent="selectFromCity(city)"
            @touchstart.prevent="selectFromCity(city)"
          >
            {{ city }}
          </div>
        </div>

        <!-- Куда -->
        <input
          v-model="toQuery"
          @input="onToInput"
          type="text"
          placeholder="Начните вводить город"
          class="input"
          required
          maxlength="40"
          @focus="showSuggestionsTo = true"
          autocomplete="off"
        />

        <!-- Список подсказок «Куда» -->
        <div
          v-if="showSuggestionsTo && filteredCitiesTo.length"
          class="suggestions"
          :style="{ bottom: kbOpenOffset ? kbOpenOffset + 8 + 'px' : 'auto' }"
        >
          <div
            v-for="city in filteredCitiesTo"
            :key="city"
            class="suggestion"
            @mousedown.prevent="selectToCity(city)"
            @touchstart.prevent="selectToCity(city)"
          >
            {{ city }}
          </div>
        </div>

        <!-- Остальные поля формы -->
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
import { ref, reactive, computed, watch, onMounted, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/store/auth';
import { createTrip } from '@/api/trips';
import { getCities } from '@/api/cities';
import { useSmartBack } from '@/utils/navigation';
import Toast from '@/components/Toast.vue';

const router   = useRouter();
const auth     = useAuthStore();
const toastRef = ref<InstanceType<typeof Toast>>();

const loading  = ref(false);
const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
const kbOpenOffset = ref(0);

/* ---------- списки городов ---------- */
const defaultCities = [
  'Бохтар','Бустон','Вахдат','Душанбе','Истаравшан','Истиклол','Исфара',
  'Гиссар','Гулистон','Канибадам','Куляб','Левакант','Нурек','Пенджикент',
  'Рогун','Турсунзаде','Хорог','Худжанд',
  'Мургаб','Фархор','Шахритус','Зафарабад','Балх','Гарм','Гафуров','Яван',
  'Шарора','Абдурахмони Джоми','Дангара','Дусти','Кубодиён','Московский',
  'Муминабад','Пяндж','Ховалинг','Хулбук','20-летия Независимости','Вахш',
  'Кировский','Обикиик','Орзу','Пархар','Хаётинав','Навкат','Мехнатобод',
  'Адрасман','Зарнисор','Зеравшан','Кансай','Варзоб','Чорбог','Такоб',
  'Симиганч','Дехмой','Навобод','Сангтуда','Чилгази','Кухистони Мастчох',
  'Патрук','Поршинев','Ванж','Рушан','Дарвоз','Шахринав','Лахш','Файзабад',
  'Джиликуль','Джайхун','Хуросон','Хамадони','Восе','Дангарин','Темурмалик',
  'Балджуван','Муминобод','Носири Хусрав','Джалолиддин Балхи','Спитамен',
  'Мастчох','Ашт','Бободжон Гафуров','Джаббор Расулов','Деваштич','Шахристан','Айни'
];
const extraCities   = ref<string[]>([]);
const allCities     = computed(() => {
  const low = defaultCities.map(c => c.toLowerCase());
  return [...defaultCities, ...extraCities.value.filter(c => !low.includes(c.toLowerCase()))];
});

/* ---------- форма ---------- */
const form = reactive({
  from_: '', to: '', date: '', time: '', seats: 1,
  price: 0, status: 'active', description: ''
});

/* ---------- подсказки ---------- */
const fromQuery = ref(''), toQuery = ref('');
const showSuggestionsFrom = ref(false), showSuggestionsTo = ref(false);

const latinToCyr: Record<string,string> = { a:'а',b:'б',c:'с',d:'д',e:'е',f:'ф',g:'г',h:'х',i:'и',j:'й',k:'к',l:'л',m:'м',n:'н',o:'о',p:'п',q:'к',r:'р',s:'с',t:'т',u:'у',v:'в',w:'в',x:'кс',y:'ы',z:'з' };
const toCyr = (t:string)=>t.split('').map(ch=>{const l=ch.toLowerCase();const r=latinToCyr[l]??ch;return ch===l?r:r.toUpperCase();}).join('');

const filter = (q:string)=>{
  if(!q) return [];
  const raw=q.toLowerCase(), cyr=toCyr(q).toLowerCase();
  return allCities.value.filter(c=>{const l=c.toLowerCase();return l.startsWith(raw)||l.startsWith(cyr);}).slice(0,15);
};
const filteredCitiesFrom = computed(()=>filter(fromQuery.value));
const filteredCitiesTo   = computed(()=>filter(toQuery.value));

watch(fromQuery,v=>form.from_=v);
watch(toQuery,  v=>form.to  =v);

function onFromInput(e: Event){
  const el=e.target as HTMLInputElement;
  fromQuery.value=el.value;
  showSuggestionsFrom.value=fromQuery.value.trim().length>0;
}
function onToInput(e: Event){
  const el=e.target as HTMLInputElement;
  toQuery.value=el.value;
  showSuggestionsTo.value=toQuery.value.trim().length>0;
}

function selectFromCity(c:string){ form.from_=fromQuery.value=c; showSuggestionsFrom.value=false; }
function selectToCity(c:string){   form.to  =toQuery.value  =c; showSuggestionsTo.value  =false; }

/* ---------- города + клавиатура ---------- */
async function loadCities(){ try{ extraCities.value=await getCities(); }catch{} }

onMounted(()=>{
  if(!auth.user?.active_driver){ router.replace('/buy-access'); return; }
  loadCities();
  if(isMobile && 'visualViewport' in window){
    window.visualViewport!.addEventListener('resize',()=>{
      const diff=window.innerHeight-window.visualViewport!.height;
      kbOpenOffset.value = diff>80 ? diff : 0;
    });
  }
  const tg=(window as any).Telegram?.WebApp;
  tg?.BackButton?.show?.();
  tg?.BackButton?.onClick?.(()=>useSmartBack(router));
});
onBeforeUnmount(()=>{
  const tg=(window as any).Telegram?.WebApp;
  tg?.BackButton?.hide?.();
  tg?.BackButton?.offClick?.();
});

/* ---------- сохранить ---------- */
async function save(){
  if(!form.from_||!form.to||!form.date||!form.time){ toastRef.value?.show('Заполните все поля');return; }
  loading.value=true;
  try{
    await createTrip({ ...form, owner_id:auth.user.id });
    toastRef.value?.show('Поездка создана');
    await loadCities();
    setTimeout(()=>router.push('/manage-trips'),800);
  }catch{ toastRef.value?.show('Ошибка создания'); }
  finally{ loading.value=false; }
}
</script>




<style scoped>
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

.suggestions{
  position:fixed;                 /* фиксируем к экрану, а не к input */
  left:12px; right:12px;
  top:calc(50vh - 10px);          /* по умолчанию – под полем (≈середина) */
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
.suggestion:hover {
  background: #f0f0f0;
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

@keyframes fadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}
</style>
