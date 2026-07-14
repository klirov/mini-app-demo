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
            tg.setHeaderColor("secondary_bg_color");
        }
    };

    const triggerHaptic = (
        type: "light" | "medium" | "heavy" | "success" | "error" = "light",
    ) => {
        if (tg?.HapticFeedback) {
            if (type === "success" || type === "error") {
                tg.HapticFeedback.notificationOccurred(type);
            } else {
                tg.HapticFeedback.impactOccurred(type);
            }
        }
    };

    const showConfirmPopup = (
        message: string,
        buttonText: string = "Понятно",
    ): Promise<boolean> => {
        return new Promise((resolve) => {
            if (tg?.showPopup) {
                tg.showPopup(
                    {
                        title: "🛡 Безопасное демо",
                        message: message,
                        buttons: [
                            { id: "ok", type: "ok", text: buttonText },
                            { type: "cancel", text: "Отмена" },
                        ],
                    },
                    (buttonId: string) => {
                        resolve(buttonId === "ok");
                    },
                );
            } else {
                resolve(confirm(message));
            }
        });
    };

    // useTelegram.ts
    const sendOrderToBot = async (data: any) => {
        if (tg) {
            try {
                const response = await fetch("https://telegram-bot-seven-ecru.vercel.app/api/order", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(data),
                });

                if (!response.ok) throw new Error("Server error");

                triggerHaptic("success");
                return true;
            } catch (error) {
                console.error(error);
                triggerHaptic("error");
                tg.showAlert("Сбой сети. Не удалось оформить заказ.");
                return false;
            }
        } else {
            alert("Вне ТГ: " + JSON.stringify(data));
            return true;
        }
    };

    return {
        tg,
        user,
        mainButton: tg?.MainButton,
        initApp,
        triggerHaptic,
        showConfirmPopup,
        sendOrderToBot,
    };
}
