<template>
    <div class="results-page">
      <h2 class="title">Найденные поездки</h2>
  
      <button class="btn-outline" @click="goBack">Изменить поиск</button>
  
      <div v-if="trips.length > 0" class="trip-list">
        <div class="trip-card" v-for="trip in trips" :key="trip.id">
          <div class="row between bold">
            {{ trip.from }} — {{ trip.to }}
            <span>{{ trip.price }}₽</span>
          </div>
  
          <div class="row">
            <span>🗓 {{ trip.date }} &nbsp;&nbsp; ⏰ {{ trip.time }}</span>
          </div>
          <div class="row">
            👤 {{ trip.driver }} &nbsp; ⭐ {{ trip.rating }} &nbsp; 👥 {{ trip.seats }} мест
          </div>
  
          <button class="btn-small">Подробнее</button>
        </div>
      </div>
  
      <div v-else class="no-results">Ничего не найдено</div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref } from 'vue';
  import { useRouter } from 'vue-router';
  
  const router = useRouter();
  
  // Пример списка найденных поездок
  const trips = ref([
    {
      id: 1,
      from: 'Душанбе',
      to: 'Худжанд',
      date: '2024-05-15',
      time: '08:00',
      price: 300,
      driver: 'Ахмад',
      rating: 4.9,
      seats: 3,
    },
    {
      id: 2,
      from: 'Душанбе',
      to: 'Турсунзаде',
      date: '2024-05-15',
      time: '10:00',
      price: 200,
      driver: 'Фируз',
      rating: 4.7,
      seats: 1,
    },
  ]);
  
  function goBack() {
    router.push('/find-trip');
  }
  </script>
  
  <style scoped>
  .results-page {
    padding: 16px;
    background: var(--color-background);
    min-height: 100vh;
  }
  
  .title {
    font-size: 20px;
    font-weight: bold;
    margin-bottom: 16px;
    color: var(--color-text-primary);
    text-align: center;
  }
  
  .trip-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  
  .trip-card {
    background: var(--color-surface);
    border-radius: 12px;
    padding: 16px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.05);
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  
  .row {
    display: flex;
    flex-wrap: wrap;
    font-size: 14px;
    color: var(--color-text-secondary);
  }
  
  .row.between {
    justify-content: space-between;
  }
  
  .bold {
    font-weight: bold;
    font-size: 16px;
    color: var(--color-text-primary);
  }
  
  .btn-small {
    margin-top: 8px;
    align-self: flex-start;
    padding: 8px 14px;
    font-size: 14px;
    background: var(--color-primary);
    color: #fff;
    border: none;
    border-radius: 8px;
    cursor: pointer;
  }
  
  .btn-outline {
    background: transparent;
    color: var(--color-primary);
    border: 1px solid var(--color-primary);
    padding: 10px;
    border-radius: 8px;
    margin-bottom: 20px;
    cursor: pointer;
    font-size: 15px;
  }
  
  .no-results {
    text-align: center;
    color: var(--color-text-secondary);
    margin-top: 40px;
    font-size: 16px;
  }
  </style>
  