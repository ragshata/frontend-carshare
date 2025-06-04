<template>
  <div class="profile-page">
    <h2 class="title">Профиль</h2>
    <div class="profile-card">
      <img
        v-if="user.photo_url"
        class="avatar"
        :src="user.photo_url"
        alt="avatar"
      />
      <div class="profile-info">
        <div class="profile-name">
          {{ user.first_name }}
          <template v-if="user.last_name"> {{ user.last_name }}</template>
        </div>
        <div class="profile-username" v-if="user.username">
          @{{ user.username }}
        </div>
        <div class="profile-phone" v-if="user.phone">
          Телефон: {{ user.phone }}
        </div>
        <!-- Рейтинг в рамке -->
        <div class="rating-box">
          <span v-if="avgRating > 0">{{ avgRating.toFixed(1) }}</span>
          <span v-else>—</span>
          <span class="star">⭐</span>
          <span class="reviews-count">({{ reviews.length }} отзыв{{ reviews.length === 1 ? '' : reviews.length < 5 ? 'а' : 'ов' }})</span>
        </div>
        <!-- Кнопка редактирования на месте рейтинга -->
        <button class="btn btn-outline" @click="router.push('/edit-profile')">
          ✏️ Редактировать профиль
        </button>
      </div>
    </div>

    <div class="profile-reviews">
      <h3>Отзывы</h3>
      <div v-if="reviews.length === 0" class="empty-text">Нет отзывов</div>
      <div v-for="review in reviews" :key="review.id" class="review-card">
        <div class="review-rating">{{ review.rating }} ⭐</div>
        <div class="review-text" v-if="review.text">{{ review.text }}</div>
        <div class="review-meta">
          Поездка: #{{ review.trip_id }}
          <span class="review-date">{{ formatDate(review.created_at) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/store/auth";
import { getDriverReviews } from "@/api/reviews";

const router = useRouter();
const auth = useAuthStore();
const user = auth.user;

const reviews = ref<any[]>([]);
const avgRating = ref(0);

// Загрузка отзывов — добавь свою логику если нужно!
onMounted(() => {
  const tg = (window as any).Telegram?.WebApp;
  if (tg?.BackButton) {
    tg.BackButton.show();
    tg.BackButton.onClick(() => {
      router.back();
    });
  }
  // Подгрузи отзывы/рейтинг (пример):
  // getDriverReviews(user.id).then(res => { reviews.value = res; avgRating.value = ... });
});
onBeforeUnmount(() => {
  const tg = (window as any).Telegram?.WebApp;
  tg?.BackButton?.hide();
  tg?.BackButton?.offClick?.();
});

function formatDate(dt: string | null) {
  if (!dt) return '';
  return new Date(dt).toLocaleDateString('ru-RU');
}
</script>

<style scoped>
.profile-page {
  padding: 16px;
  min-height: 100vh;
  background: var(--color-background);
}
.title {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 18px;
  color: var(--color-text-primary);
  text-align: center;
}
.profile-card {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  background: var(--color-surface);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  justify-content: center; /* Центрируем весь блок */
}
.avatar {
  width: 80px;
  height: 80px;
  border-radius: 16px;
  object-fit: cover;
  margin-right: 8px;
}
.profile-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;    /* Вот это добавь! */
  gap: 7px;
  text-align: center;     /* Центрируем текст */
}

.profile-name {
  font-size: 20px;
  font-weight: bold;
  color: var(--color-text-primary);
}
.profile-username {
  font-size: 14px;
  color: var(--color-text-secondary);
}
.profile-phone {
  font-size: 15px;
  color: var(--color-text-secondary);
}
.rating-box {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin: 8px 0 4px 0;
  padding: 6px 16px;
  border: 1.5px solid var(--color-primary, #007bff);
  border-radius: 13px;
  font-size: 18px;
  font-weight: 500;
  background: #f6f9ff;
  width: fit-content;
}
.rating-box .star {
  color: #FFD600;
  font-size: 20px;
  margin-left: 3px;
}
.rating-box .reviews-count {
  font-size: 14px;
  color: #888;
  margin-left: 4px;
  font-weight: 400;
}
.btn {
  background: var(--color-primary);
  color: white;
  border: none;
  padding: 8px 14px;
  border-radius: 8px;
  font-size: 15px;
  cursor: pointer;
  margin-top: 6px;
  margin-right: 6px;
  transition: background 0.2s;
}
.btn-outline {
  background: transparent;
  color: var(--color-primary);
  border: 1px solid var(--color-primary);
}
.profile-reviews {
  margin-top: 30px;
}
.profile-reviews h3 {
  margin-bottom: 14px;
  font-size: 18px;
  color: var(--color-text-primary);
  text-align: center;
}
.empty-text {
  color: var(--color-text-secondary);
  font-size: 15px;
  text-align: center;
  margin-top: 20px;
}
.review-card {
  background: var(--color-surface);
  border-radius: 8px;
  padding: 10px 14px;
  margin-bottom: 10px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.03);
}
.review-rating {
  font-size: 16px;
  font-weight: bold;
  color: #FFD600;
  margin-bottom: 2px;
}
.review-text {
  font-size: 15px;
  color: var(--color-text-primary);
  margin-bottom: 2px;
}
.review-meta {
  font-size: 13px;
  color: var(--color-text-secondary);
}
.review-date {
  margin-left: 8px;
}
</style>
