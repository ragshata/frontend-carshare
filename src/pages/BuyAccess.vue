<template>
  <div class="buy-access-page">
    <div class="background-img"></div>
    <div class="card">
      <h2 class="title">Доступ к созданию поездок</h2>

      <!-- Активная подписка -->
      <div v-if="hasPaidSubscription" class="info-msg">
        ✅ Подписка уже куплена. Приятного использования нашего сервиса!
      </div>

      <!-- Истёкший или отсутствующий триал -->
      <div v-else-if="!canActivateTrial" class="info-msg">
        🚫 Пробный период уже использован.
      </div>

      <!-- Пробный период -->
      <div v-else-if="canActivateTrial">
        <p class="desc">🎁 Протестируйте сервис бесплатно</p>
        <button class="btn" @click="startTrial" :disabled="loadingTrial">
          {{ loadingTrial ? '...' : 'Начать пробный период' }}
        </button>
      </div>

      <!-- Покупка тарифа -->
      <div v-if="!hasPaidSubscription">
        <p class="desc">📦 Выберите подходящий тариф</p>
        <div class="tariff-list">
          <div v-for="tariff in tariffs" :key="tariff.id" class="tariff-card">
            <div class="tariff-name">{{ tariff.title }}</div>
            <div class="tariff-price">{{ tariff.price }} сомони</div>
            <button class="btn buy-btn" @click="buy(tariff)" :disabled="loadingBuy">
              {{ loadingBuy ? '...' : 'Купить' }}
            </button>
          </div>
        </div>
      </div>

      <button class="btn-outline" @click="router.back()" style="margin-top: 20px">Назад</button>
    </div>

    <Toast ref="toastRef" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/store/auth';
import { getTariffs, buyTariff, startDriverTrial } from '@/api/subscription';
import Toast from '@/components/Toast.vue';

const router = useRouter();
const auth = useAuthStore();
const toastRef = ref<InstanceType<typeof Toast> | null>(null);

const tariffs = ref<{ id: number; title: string; price: number }[]>([]);
const loadingTrial = ref(false);
const loadingBuy = ref(false);

// ✅ может ли активировать пробный период
const canActivateTrial = computed(() => !auth.user?.driver_trial_end);
// ✅ есть ли активная подписка (НЕ триал)
const hasPaidSubscription = computed(() => {
  return !!auth.user?.active_driver && !!auth.user?.subscription_end;
});

onMounted(loadTariffs);

async function loadTariffs() {
  try {
    tariffs.value = await getTariffs();
  } catch {
    toastRef.value?.show('Ошибка загрузки тарифов!');
  }
}

async function startTrial() {
  loadingTrial.value = true;
  try {
    const res = await startDriverTrial(auth.user.id);
    auth.user.active_driver = true;
    auth.user.driver_trial_end = res.trial_end;
    toastRef.value?.show('Пробный период активирован!');
    router.replace('/offer-trip');
  } catch (e: any) {
    toastRef.value?.show(e.response?.data?.detail || 'Ошибка!');
  }
  loadingTrial.value = false;
}

async function buy(tariff: { id: number }) {
  loadingBuy.value = true;
  try {
    await buyTariff(auth.user.id, tariff.id);
    auth.user.active_driver = true;
    toastRef.value?.show('Подписка активирована!');
    router.replace('/offer-trip');
  } catch (e: any) {
    toastRef.value?.show(e.response?.data?.detail || 'Ошибка покупки');
  }
  loadingBuy.value = false;
}
</script>

<style scoped>
.buy-access-page {
  position: fixed;
  inset: 0;
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
}
.background-img {
  position: fixed;
  inset: 0;
  background: url('@/assets/secondary.webp') center / cover no-repeat;
  z-index: 0;
}
.card {
  z-index: 2;
  background: rgba(255, 255, 255, 0.45);
  backdrop-filter: blur(14px);
  border-radius: 18px;
  padding: 30px 20px;
  width: 100%;
  max-width: 400px;
  text-align: center;
  box-shadow: 0 6px 14px rgba(0,0,0,0.1);
}
.title {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 16px;
}
.desc {
  margin: 12px 0;
  font-size: 16px;
}
.tariff-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-top: 20px;
}
.tariff-card {
  background: white;
  border-radius: 12px;
  padding: 14px;
  text-align: center;
  box-shadow: 0 2px 6px rgba(0,0,0,0.05);
}
.tariff-name {
  font-size: 17px;
  font-weight: bold;
}
.tariff-price {
  font-size: 15px;
  color: #333;
  margin: 6px 0;
}
.btn {
  background: #007bff;
  color: white;
  border: none;
  padding: 10px 14px;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
}
.btn-outline {
  background: transparent;
  color: #007bff;
  border: 1.5px solid #007bff;
  padding: 9px 12px;
  border-radius: 8px;
  font-size: 15px;
  margin-top: 8px;
}
.info-msg {
  background: #e6f7e6;
  color: #227;
  padding: 20px;
  border-radius: 14px;
  font-size: 16px;
  margin-bottom: 20px;
}
</style>
