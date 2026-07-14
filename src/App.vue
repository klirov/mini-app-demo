<template>
    <div class="min-h-screen bg-[#05070a] text-slate-100 p-4 pb-8 selection:bg-indigo-500/30">
        <header class="flex items-center justify-between border border-slate-800 bg-[#090d16]/60 backdrop-blur-md p-4 rounded-xl mb-4">
            <div class="flex items-center gap-3">
                <img
                    :src="user.photo_url"
                    class="w-10 h-10 rounded-full border border-indigo-500/40 object-cover"
                    alt="User Avatar"
                />
                <div>
                    <h1 class="text-[11px] text-slate-400 font-medium">Приветствуем,</h1>
                    <p class="text-xs font-bold text-white">
                        @{{ user.username || user.first_name }}
                    </p>
                </div>
            </div>
            <div class="bg-indigo-500/10 border border-indigo-500/30 px-2 py-0.5 rounded text-[10px] font-mono text-indigo-400 uppercase tracking-wider">
                Demo
            </div>
        </header>

        <div class="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 mb-4 flex items-start gap-3">
            <span class="text-emerald-400 text-lg leading-none mt-0.5">🛡️</span>
            <div>
                <h3 class="text-sm font-bold text-emerald-400 mb-0.5">Смело нажимайте на всё!</h3>
                <p class="text-xs text-emerald-500/80 leading-relaxed">
                    Это тестовая витрина для демонстрации. Вы можете оформлять заказы, <b>никаких реальных списаний средств не будет</b>.
                </p>
            </div>
        </div>

        <div class="mb-4 flex justify-between items-end">
            <div>
                <h2 class="text-xl font-bold tracking-tight text-white">Меню заведения</h2>
                <p class="text-xs text-slate-400 mt-0.5">Выберите товары для теста</p>
            </div>
        </div>

        <div class="sticky top-0 z-40 bg-[#05070a]/95 backdrop-blur-md pt-2 pb-4 -mx-4 px-4 mb-2">
            <div class="flex overflow-x-auto gap-2 no-scrollbar pb-1">
                <button
                    v-for="cat in categories"
                    :key="cat.id"
                    @click="setCategory(cat.id)"
                    class="whitespace-nowrap px-4 py-2 rounded-full text-xs font-medium transition-all active:scale-95 flex items-center gap-1.5"
                    :class="activeCategory === cat.id
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                        : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800 border border-slate-700/50'"
                >
                    <span>{{ cat.icon }}</span>
                    {{ cat.name }}
                </button>
            </div>
        </div>

        <TransitionGroup name="list" tag="main" class="flex flex-col gap-3">
            <div
                v-for="product in filteredProducts"
                :key="product.id"
                class="border border-slate-800/60 bg-[#090d16]/30 p-4 rounded-xl flex items-start gap-4 transition-colors hover:border-slate-700"
            >
                <span class="text-3xl bg-slate-800/40 p-2.5 rounded-lg border border-slate-800/40 flex-shrink-0">
                    {{ product.icon }}
                </span>
                <div class="flex-1 min-w-0">
                    <div class="flex justify-between items-baseline mb-1">
                        <h3 class="text-sm font-semibold text-white truncate">{{ product.name }}</h3>
                        <span class="text-sm font-mono font-bold text-indigo-400 ml-2">
                            {{ product.price }}₽
                        </span>
                    </div>
                    <p class="text-xs text-slate-400 line-clamp-2 mb-3 leading-relaxed">
                        {{ product.desc }}
                    </p>

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
                            <span class="text-xs font-mono font-bold w-4 text-center text-white">
                                {{ cart[product.id] }}
                            </span>
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
        </TransitionGroup>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from "vue";
import { useTelegram } from "./composables/useTelegram";

const { user, initApp, triggerHaptic, showConfirmPopup, sendOrderToBot, mainButton } = useTelegram();

const categories = [
    { id: "coffee", name: "Кофе", icon: "☕" },
    { id: "tea", name: "Чаи и Матча", icon: "🍵" },
    { id: "bakery", name: "Выпечка", icon: "🥐" },
    { id: "desserts", name: "Десерты", icon: "🍰" },
    { id: "merch", name: "Мерч", icon: "🛍️" },
];

const activeCategory = ref("coffee");

const setCategory = (id: string) => {
    if (activeCategory.value !== id) {
        triggerHaptic("light");
        activeCategory.value = id;
    }
};

const products = ref([
    // КОФЕ
    { id: 1, categoryId: "coffee", name: "Espresso", price: 180, desc: "Заряд энергии для жесткого код-ревью. Плотный, с кислинкой.", icon: "☕" },
    { id: 2, categoryId: "coffee", name: "Latte", price: 240, desc: "Мягкий молочный вкус с секретным сиропом из сибирских ягод.", icon: "🥤" },
    { id: 3, categoryId: "coffee", name: "Flat White", price: 260, desc: "Идеальный баланс кофе и молока. Любимый напиток сеньоров.", icon: "☕" },
    { id: 4, categoryId: "coffee", name: "Americano", price: 190, desc: "Классический черный кофе. Спасает горящие дедлайны.", icon: "☕" },

    // ЧАЙ
    { id: 5, categoryId: "tea", name: "Matcha Latte", price: 320, desc: "Матча на кокосовом. Зеленый, как успешно пройденные тесты.", icon: "🍵" },
    { id: 6, categoryId: "tea", name: "Авторский чай", price: 280, desc: "Сбор трав и ягод. Отлично успокаивает после падения продакшена.", icon: "🫖" },

    // ВЫПЕЧКА
    { id: 7, categoryId: "bakery", name: "Croissant", price: 190, desc: "Слоеный, воздушный, классический французский круассан.", icon: "🥐" },
    { id: 8, categoryId: "bakery", name: "Bento Grid Cookie", price: 150, desc: "Печенье с шоколадной крошкой, идеально структурированное.", icon: "🍪" },
    { id: 9, categoryId: "bakery", name: "Синнабон", price: 250, desc: "Мощная булочка с корицей и щедрой порцией сливочного крема.", icon: "🧁" },

    // ДЕСЕРТЫ
    { id: 10, categoryId: "desserts", name: "Tiramisu", price: 350, desc: "Воздушный десерт, который собирает всю архитектуру вкуса воедино.", icon: "🍰" },
    { id: 11, categoryId: "desserts", name: "Cheesecake", price: 310, desc: "Нью-Йорк, строгий и понятный, как хорошая документация.", icon: "🧀" },

    // МЕРЧ
    { id: 12, categoryId: "merch", name: "Кружка Developer", price: 850, desc: "Черная матовая кружка с надписью «У меня локально всё работает».", icon: "☕" },
    { id: 13, categoryId: "merch", name: "Стикерпак", price: 300, desc: "Набор виниловых наклеек для крышки твоего ноутбука.", icon: "🧩" },
]);

const filteredProducts = computed(() => {
    return products.value.filter((p) => p.categoryId === activeCategory.value);
});

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

const totalItems = computed(() => Object.values(cart.value).reduce((a, b) => a + b, 0));
const totalPrice = computed(() => {
    return Object.entries(cart.value).reduce((sum, [id, qty]) => {
        const prod = products.value.find((p) => p.id === Number(id));
        return sum + (prod ? prod.price * qty : 0);
    }, 0);
});

watch(totalItems, (newTotal) => {
    if (!mainButton) return;

    if (newTotal > 0) {
        mainButton.text = `Тестовый заказ на ${totalPrice.value} ₽`;
        mainButton.color = "#4f46e5";
        mainButton.textColor = "#ffffff";
        mainButton.show();
    } else {
        mainButton.hide();
    }
});

const handleCheckout = async () => {
    triggerHaptic("medium");

    const isConfirmed = await showConfirmPopup(
        "Сейчас мы отправим заказ в чат. Это демо-режим, вам не придется ничего оплачивать по-настоящему. Отправляем?",
        "Отправить в чат"
    );

    if (!isConfirmed) return;

    if (mainButton) mainButton.showProgress();

    const orderData = {
        app: "cafe_demo",
        userId: user.value.id,
        customer: user.value.username || user.value.first_name,
        items: Object.entries(cart.value).map(([id, qty]) => {
            const p = products.value.find((prod) => prod.id === Number(id));
            return { name: p?.name, qty };
        }),
        total: totalPrice.value,
    };

    await sendOrderToBot(orderData);

    if (mainButton) mainButton.hideProgress();
};

onMounted(() => {
    initApp();
    if (mainButton) {
        mainButton.onClick(handleCheckout);
    }
});

onUnmounted(() => {
    if (mainButton) {
        mainButton.offClick(handleCheckout);
    }
});
</script>

<style>
button {
    touch-action: manipulation;
}

.no-scrollbar::-webkit-scrollbar {
    display: none;
    overflow: hidden;
}
.no-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
}

.list-enter-active,
.list-leave-active {
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}
.list-enter-from {
    opacity: 0;
    transform: translateY(15px) scale(0.98);
}
.list-leave-to {
    opacity: 0;
    transform: translateY(-15px) scale(0.98);
    position: absolute;
    width: calc(100% - 2rem);
}
</style>
