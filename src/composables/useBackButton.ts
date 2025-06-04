import { onMounted, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';

export function useBackButton(destination: string = '/main') {
  const router = useRouter();

  onMounted(() => {
    const WebApp = (window as any).Telegram?.WebApp;
    const BackButton = WebApp?.BackButton;

    if (BackButton) {
      BackButton.show();
      BackButton.onClick(() => {
        router.push(destination);
        BackButton.hide(); // можно оставить или убрать
      });

      // альтернативный способ (опционально):
      WebApp.onEvent?.('backButtonClicked', () => {
        router.push(destination);
      });
    }
  });

  onBeforeUnmount(() => {
    const WebApp = (window as any).Telegram?.WebApp;
    const BackButton = WebApp?.BackButton;
    BackButton?.hide();
    BackButton?.offClick?.();
  });
}
