import { ref } from "vue";

export function useTelegram() {
    const tg = (window as any).Telegram?.WebApp;

    const user = ref(
        tg?.initDataUnsafe?.user || {
            id: 12345678,
            first_name: "Тестовый",
            last_name: "Пользователь",
            username: "test_user",
            photo_url:
                "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTVntI8W66S4tpgqvs7Hap-E5_hdgwEzn_EtkT8HnIRwh6x-s4RwUMnwWA&s=10",
        },
    );

    const initApp = () => {
        if (tg) {
            tg.ready();
            tg.expand();
        }
    };

    const triggerHaptic = (
        type: "light" | "medium" | "success" | "error" = "light",
    ) => {
        if (tg?.HapticFeedback) {
            if (type === "success" || type === "error") {
                tg.HapticFeedback.notificationOccurred(type);
            } else {
                tg.HapticFeedback.impactOccurred(type);
            }
        }
    };

    const sendOrderToBot = async (data: any) => {
        if (tg) {
            triggerHaptic("success");
            try {
                const response = await fetch(
                    "https://telegram-bot-seven-ecru.vercel.app/api/order",
                    {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(data),
                    },
                );

                if (response.ok) {
                    tg.close();
                } else {
                    alert("Ошибка сервера при создании заказа");
                }
            } catch (error) {
                console.error(error);
                alert("Сбой сети. Не удалось связаться с сервером.");
            }
        } else {
            alert("Вне ТГ (Имитация API-запроса): " + JSON.stringify(data));
        }
    };

    return {
        tg,
        user,
        initApp,
        triggerHaptic,
        sendOrderToBot,
    };
}
