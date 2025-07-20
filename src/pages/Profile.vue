<template>
  <div class="profile-page">
    <div class="profile-card">
      <div class="avatar-block">
        <img
          v-if="auth.user.photo_url"
          class="avatar"
          :src="auth.user.photo_url"
          alt="avatar"
        />
        <div v-else class="avatar avatar-placeholder">
          {{ getInitials(auth.user) }}
        </div>
      </div>
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
        <!-- Блок с рейтингом -->
        <div class="rating-box">
          <span v-if="avgRating > 0">{{ avgRating.toFixed(1) }}</span>
          <span v-else>—</span>
          <span class="star">⭐️</span>
          <span class="reviews-count">({{ reviews.length }} отзыв{{ reviews.length === 1 ? '' : reviews.length < 5 ? 'а' : 'ов' }})</span>
        </div>
        <button class="btn btn-outline" @click="router.push('/edit-profile')">
          ✏️ Редактировать профиль
        </button>
        <button class="btn btn-outline" @click="changeRole" :disabled="roleLoading">
          🔄 {{ user.is_driver ? 'Стать пассажиром' : 'Стать водителем' }}
        </button>
      </div>
    </div>
    <Toast ref="toastRef" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/store/auth";
import { getDriverReviews } from "@/api/reviews";
import { updateProfileById } from "@/api/auth";
import Toast from "@/components/Toast.vue";

const router = useRouter();
const auth = useAuthStore();
const user = auth.user;
const toastRef = ref<InstanceType<typeof Toast> | null>(null);

const reviews = ref<any[]>([]);
const avgRating = ref(0);
const roleLoading = ref(false);

function getInitials(user: any) {
  let initials = user.first_name?.charAt(0) || "";
  if (user.last_name) initials += user.last_name.charAt(0);
  return initials || "?";
}

async function changeRole() {
  if (!user || !user.id) return;
  roleLoading.value = true;
  try {
    const updated = await updateProfileById({
      id: user.id,
      is_driver: !user.is_driver,
    });
    auth.setUser(updated);
    toastRef.value?.show("Роль успешно изменена!");

    setTimeout(() => {
      if (updated.is_driver) router.replace("/driver");
      else router.replace("/passenger");
    }, 500);
  } catch (e) {
    toastRef.value?.show("Ошибка при смене роли");
  }
  roleLoading.value = false;
}

// Загрузка отзывов и рейтинга
onMounted(async () => {
  const tg = (window as any).Telegram?.WebApp;
  if (tg?.BackButton) {
    tg.BackButton.show();
    tg.BackButton.onClick(() => {
      if (user.is_driver) {
        router.replace('/driver');
      } else {
        router.replace('/passenger');
      }
    });
  }

  // Загружаем отзывы только для водителя
  if (user && user.id && user.is_driver) {
    try {
      console.log("🔍 Загружаем отзывы для водителя с ID:", user.id);
      const res = await getDriverReviews(user.id);
      console.log("✅ Полученные отзывы:", res);

      reviews.value = res;
      if (reviews.value.length) {
        avgRating.value =
          reviews.value.reduce((sum: number, r: any) => sum + (r.rating || 0), 0) /
          reviews.value.length;
      } else {
        avgRating.value = 0;
      }
    } catch (err) {
      console.error("❌ Ошибка при загрузке отзывов:", err);
      reviews.value = [];
      avgRating.value = 0;
    }
  } else {
    console.warn("⚠️ Пользователь не является водителем или не авторизован.");
    reviews.value = [];
    avgRating.value = 0;
  }
});

onBeforeUnmount(() => {
  const tg = (window as any).Telegram?.WebApp;
  tg?.BackButton?.hide();
  tg?.BackButton?.offClick?.();
});
</script>

<style scoped>
/* ... Твои стили без изменений ... */
.profile-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: var(--color-surface);
  border-radius: 18px;
  padding: 22px 16px 18px 16px;
  margin-bottom: 28px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  max-width: 320px;
  margin-left: auto;
  margin-right: auto;
}
.avatar-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 25px;
}
.avatar {
  width: 180px;
  height: 180px;
  border-radius: 20px;
  object-fit: cover;
  background: #eaeaea;
  margin-bottom: 0;
}
.avatar-placeholder {
  background: #eee;
  color: #888;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 34px;
  width: 80px;
  height: 80px;
  border-radius: 20px;
}
.profile-info {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 7px;
  text-align: center;
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
</style>