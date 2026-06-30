<template>
    <div
        class="min-h-screen bg-[#05070a] text-slate-100 p-4 pb-28 selection:bg-indigo-500/30"
    >
        <!-- Юзер-бар в стиле Shadcn Card -->
        <header
            class="flex items-center justify-between border border-slate-800 bg-[#090d16]/60 backdrop-blur-md p-4 rounded-xl mb-6"
        >
            <div class="flex items-center gap-3">
                <img
                    :src="user.photo_url"
                    class="w-10 h-10 rounded-full border border-indigo-500/40 object-cover"
                    alt="User Avatar"
                />
                <div>
                    <h1 class="text-[11px] text-slate-400 font-medium">
                        Приветствуем,
                    </h1>
                    <p class="text-xs font-bold text-white">
                        @{{ user.username || user.first_name }}
                    </p>
                </div>
            </div>
            <div
                class="bg-indigo-500/10 border border-indigo-500/30 px-2 py-0.5 rounded text-[10px] font-mono text-indigo-400 uppercase tracking-wider"
            >
                Demo WebApp
            </div>
        </header>

        <!-- Заголовок каталога -->
        <div class="mb-5">
            <h2 class="text-xl font-bold tracking-tight text-white">Кофейня</h2>
            <p class="text-xs text-slate-400 mt-0.5">
                Пример интерактивной витрины для вашего бизнеса
            </p>
        </div>

        <!-- Сетка товаров -->
        <main class="flex flex-col gap-3">
            <div
                v-for="product in products"
                :key="product.id"
                class="border border-slate-800/60 bg-[#090d16]/30 p-4 rounded-xl flex items-start gap-4 transition-colors hover:border-slate-700"
            >
                <span
                    class="text-3xl bg-slate-800/40 p-2.5 rounded-lg border border-slate-800/40"
                    >{{ product.icon }}</span
                >
                <div class="flex-1 min-w-0">
                    <div class="flex justify-between items-baseline mb-1">
                        <h3 class="text-sm font-semibold text-white truncate">
                            {{ product.name }}
                        </h3>
                        <span
                            class="text-sm font-mono font-bold text-indigo-400 ml-2"
                            >{{ product.price }}₽</span
                        >
                    </div>
                    <p
                        class="text-xs text-slate-400 line-clamp-2 mb-3 leading-relaxed"
                    >
                        {{ product.desc }}
                    </p>

                    <!-- Кнопки управления корзиной -->
                    <div class="flex justify-end">
                        <button
                            v-if="!cart[product.id]"
                            @click="addToCart(product.id)"
                            class="text-xs font-medium bg-white text-black px-4 py-1.5 rounded-md active:scale-95 transition-transform"
                        >
                            В корзину
                        </button>
                        <div
                            v-else
                            class="flex items-center gap-3 bg-slate-900 border border-slate-800 rounded-md px-1.5 py-1"
                        >
                            <button
                                @click="removeFromCart(product.id)"
                                class="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-white active:scale-90"
                            >
                                -
                            </button>
                            <span
                                class="text-xs font-mono font-bold w-4 text-center text-white"
                                >{{ cart[product.id] }}</span
                            >
                            <button
                                @click="addToCart(product.id)"
                                class="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-white active:scale-90"
                            >
                                +
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </main>

        <!-- Нижняя плашка корзины (Shadcn Sticky Sheet) -->
        <transition name="slide-up">
            <div
                v-if="totalItems > 0"
                class="fixed bottom-0 left-0 right-0 border-t border-slate-800 bg-[#090d16]/90 backdrop-blur-lg p-4 px-6 flex items-center justify-between z-50 pb-6"
            >
                <div>
                    <p class="text-[11px] text-slate-400">Сумма заказа:</p>
                    <p class="text-base font-mono font-bold text-white">
                        {{ totalPrice }} ₽
                        <span class="text-xs text-slate-500 font-normal"
                            >({{ totalItems }} шт)</span
                        >
                    </p>
                </div>
                <button
                    @click="handleCheckout"
                    :disabled="isCheckingOut"
                    class="bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs px-5 py-2.5 rounded-lg flex items-center gap-2 shadow-lg shadow-indigo-600/10 active:scale-95 transition-all disabled:opacity-50"
                >
                    <span v-if="isCheckingOut" class="animate-spin text-xs"
                        >⏳</span
                    >
                    {{
                        isCheckingOut
                            ? "Оформление..."
                            : "Отправить заказ в чат"
                    }}
                </button>
            </div>
        </transition>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useTelegram } from "./composables/useTelegram";

const { user, initApp, triggerHaptic, sendOrderToBot } = useTelegram();

onMounted(() => {
    initApp();
});

// Меню нашей демо-кофейни
const products = ref([
    {
        id: 1,
        name: "Cyber Espresso",
        price: 180,
        desc: "Заряд энергии для жесткого код-ревью. Плотный, с кислинкой.",
        icon: "☕",
    },
    {
        id: 2,
        name: "Koltsovo Latte",
        price: 240,
        desc: "Мягкий молочный вкус с секретным сиропом из сибирских ягод.",
        icon: "🥤",
    },
    {
        id: 3,
        name: "Bento Grid Cookie",
        price: 150,
        desc: "Печенье с шоколадной крошкой, идеально структурированное.",
        icon: "🍪",
    },
    {
        id: 4,
        name: "Vue Croissant",
        price: 190,
        desc: "Слоеный, воздушный, максимально реактивный.",
        icon: "🥐",
    },
]);

// Стейт корзины: { id_товара: количество }
const cart = ref<Record<number, number>>({});

const addToCart = (id: number) => {
    triggerHaptic("light");
    cart.value[id] = (cart.value[id] || 0) + 1;
};

const removeFromCart = (id: number) => {
    triggerHaptic("light");
    if (cart.value[id] > 1) {
        cart.value[id]--;
    } else {
        delete cart.value[id];
    }
};

// Считаем общее количество и сумму
const totalItems = computed(() =>
    Object.values(cart.value).reduce((a, b) => a + b, 0),
);
const totalPrice = computed(() => {
    return Object.entries(cart.value).reduce((sum, [id, qty]) => {
        const prod = products.value.find((p) => p.id === Number(id));
        return sum + (prod ? prod.price * qty : 0);
    }, 0);
});

// Имитация оформления заказа
const isCheckingOut = ref(false);
const handleCheckout = () => {
    isCheckingOut.value = true;

    const orderData = {
        app: "cyber_cafe_demo",
        customer: user.value.username || user.value.first_name,
        items: Object.entries(cart.value).map(([id, qty]) => {
            const p = products.value.find((prod) => prod.id === Number(id));
            return { name: p?.name, qty };
        }),
        total: totalPrice.value,
    };

    // Небольшая задержка для солидности (показать спиннер) и отправка в ТГ
    setTimeout(() => {
        sendOrderToBot(orderData);
    }, 1000);
};
</script>

<style>
.slide-up-enter-active,
.slide-up-leave-active {
    transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}
.slide-up-enter-from,
.slide-up-leave-to {
    transform: translateY(100%);
}
</style>
