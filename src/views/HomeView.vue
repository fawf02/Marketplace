<template>
  <div class="w-full bg-white">
    <!-- Hero Section -->
    <section class="w-full px-6 sm:px-8 lg:px-16 xl:px-20 py-20 lg:py-32 bg-white">
      <div class="max-w-7xl mx-auto">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <!-- Content -->
          <div class="space-y-8">
            <div>
              <div class="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-full mb-6">
                <span class="w-2 h-2 bg-emerald-500 rounded-full"></span>
                <span class="text-sm font-semibold text-emerald-700">Добро пожаловать на StudentsHub</span>
              </div>
              
              <h1 class="text-slate-950 mb-6">
                Маркетплейс для студентов
              </h1>
              
              <p class="text-lg text-slate-600 leading-relaxed max-w-xl">
                Покупайте и продавайте товары среди единомышленников. Надежная платформа с защитой покупателей, выгодными ценами и быстрой доставкой.
              </p>
            </div>
            
            <!-- CTA Buttons -->
            <div class="flex flex-col sm:flex-row gap-4">
              <router-link
                to="/catalog"
                class="group inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-md hover:shadow-lg hover:shadow-blue-600/30 text-base"
              >
                Начать покупать
                <svg class="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </router-link>
              <a
                href="#features"
                class="inline-flex items-center justify-center px-8 py-3.5 border-2 border-slate-200 text-slate-700 font-semibold rounded-lg hover:border-blue-600 hover:bg-blue-50 transition-all duration-200 text-base"
              >
                Узнать больше
              </a>
            </div>

            <!-- Stats -->
            <div class="grid grid-cols-3 gap-8 pt-8 border-t border-slate-200">
              <div>
                <div class="text-3xl font-bold text-blue-600 mb-1">2000+</div>
                <p class="text-sm text-slate-600">активных пользователей</p>
              </div>
              <div>
                <div class="text-3xl font-bold text-blue-600 mb-1">1000+</div>
                <p class="text-sm text-slate-600">товаров</p>
              </div>
              <div>
                <div class="text-3xl font-bold text-blue-600 mb-1">500+</div>
                <p class="text-sm text-slate-600">продавцов</p>
              </div>
            </div>
          </div>

          <!-- Visual -->
          <div class="hidden lg:flex justify-center">
            <div class="relative w-full max-w-md h-96">
              <div class="absolute inset-0 bg-gradient-to-br from-blue-200 to-emerald-200 rounded-3xl opacity-20 blur-3xl"></div>
              <div class="relative bg-gradient-to-br from-slate-50 to-white rounded-3xl p-8 border border-slate-200 overflow-hidden shadow-xl">
                <div class="absolute top-0 right-0 w-40 h-40 bg-blue-100 rounded-full opacity-20 blur-3xl -mr-20 -mt-20"></div>
                <div class="relative space-y-4">
                  <div class="group p-4 bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all cursor-pointer">
                    <div class="flex items-start gap-3">
                      <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-blue-600 transition-colors">
                        <svg class="w-5 h-5 text-blue-600 group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 6H6.28l-.31-1.243A1 1 0 005 4H3z" />
                        </svg>
                      </div>
                      <div>
                        <div class="font-semibold text-slate-900 text-sm">Простая покупка</div>
                        <div class="text-xs text-slate-500">В несколько кликов</div>
                      </div>
                    </div>
                  </div>
                  
                  <div class="group p-4 bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all cursor-pointer">
                    <div class="flex items-start gap-3">
                      <div class="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-600 transition-colors">
                        <svg class="w-5 h-5 text-emerald-600 group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 20 20">
                          <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                        </svg>
                      </div>
                      <div>
                        <div class="font-semibold text-slate-900 text-sm">Защита платежей</div>
                        <div class="text-xs text-slate-500">100% безопасно</div>
                      </div>
                    </div>
                  </div>
                  
                  <div class="group p-4 bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-md hover:border-violet-200 transition-all cursor-pointer">
                    <div class="flex items-start gap-3">
                      <div class="w-10 h-10 bg-violet-100 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-violet-600 transition-colors">
                        <svg class="w-5 h-5 text-violet-600 group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                        </svg>
                      </div>
                      <div>
                        <div class="font-semibold text-slate-900 text-sm">Быстрая доставка</div>
                        <div class="text-xs text-slate-500">За часы</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    
    <!-- Features Section -->
    <section id="features" class="w-full px-6 sm:px-8 lg:px-16 xl:px-20 py-24 lg:py-32 bg-slate-50">
      <div class="max-w-7xl mx-auto">
        <div class="text-center mb-16 space-y-4">
          <h2 class="text-slate-950">Почему выбирают StudentsHub</h2>
          <p class="text-lg text-slate-600 max-w-2xl mx-auto">Три главных преимущества, которые выделяют нас среди конкурентов</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <!-- Feature 1 -->
          <div class="group card-hover h-full bg-white rounded-2xl p-10 border border-slate-200 hover:border-blue-300 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300">
            <div class="relative mb-8">
              <div class="absolute inset-0 bg-blue-200 rounded-xl opacity-0 group-hover:opacity-20 blur-xl transition-opacity"></div>
              <div class="relative w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-blue-600 transition-all duration-300">
                <svg class="w-6 h-6 text-blue-600 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
            <h3 class="text-lg font-bold text-slate-950 mb-4">Быстро</h3>
            <p class="text-slate-600 leading-relaxed">Получайте товары за несколько часов. Выбирайте удобный способ: доставка или самовывоз.</p>
          </div>

          <!-- Feature 2 -->
          <div class="group card-hover h-full bg-white rounded-2xl p-10 border border-slate-200 hover:border-emerald-300 hover:shadow-lg hover:shadow-emerald-500/10 transition-all duration-300">
            <div class="relative mb-8">
              <div class="absolute inset-0 bg-emerald-200 rounded-xl opacity-0 group-hover:opacity-20 blur-xl transition-opacity"></div>
              <div class="relative w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center group-hover:bg-emerald-600 transition-all duration-300">
                <svg class="w-6 h-6 text-emerald-600 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <h3 class="text-lg font-bold text-slate-950 mb-4">Выгодно</h3>
            <p class="text-slate-600 leading-relaxed">Лучшие цены от студентов для студентов. Без переплат и скрытых комиссий.</p>
          </div>

          <!-- Feature 3 -->
          <div class="group card-hover h-full bg-white rounded-2xl p-10 border border-slate-200 hover:border-violet-300 hover:shadow-lg hover:shadow-violet-500/10 transition-all duration-300">
            <div class="relative mb-8">
              <div class="absolute inset-0 bg-violet-200 rounded-xl opacity-0 group-hover:opacity-20 blur-xl transition-opacity"></div>
              <div class="relative w-12 h-12 bg-violet-100 rounded-xl flex items-center justify-center group-hover:bg-violet-600 transition-all duration-300">
                <svg class="w-6 h-6 text-violet-600 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <h3 class="text-lg font-bold text-slate-950 mb-4">Надежно</h3>
            <p class="text-slate-600 leading-relaxed">Проверенные продавцы, защита покупателя и гарантия безопасности каждой сделки.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Seller Promo Section -->
    <section class="w-full px-6 sm:px-8 lg:px-16 xl:px-20 py-20 lg:py-28 bg-white">
      <div class="max-w-4xl mx-auto">
        <SellerPromo />
      </div>
    </section>

    <!-- Stats Section -->
    <section class="w-full px-6 sm:px-8 lg:px-16 xl:px-20 py-20 lg:py-28 bg-white">
      <div class="max-w-7xl mx-auto">
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-8">
          <div class="group card-hover relative p-8 bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-2xl border border-blue-200 hover:shadow-lg transition-all duration-300 cursor-pointer">
            <div class="relative z-10">
              <div class="text-4xl lg:text-5xl font-bold text-blue-600 mb-2 group-hover:scale-110 transition-transform origin-left">1000+</div>
              <p class="text-blue-700 font-semibold">Товаров в каталоге</p>
            </div>
          </div>
          
          <div class="group card-hover relative p-8 bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-2xl border border-emerald-200 hover:shadow-lg transition-all duration-300 cursor-pointer">
            <div class="relative z-10">
              <div class="text-4xl lg:text-5xl font-bold text-emerald-600 mb-2 group-hover:scale-110 transition-transform origin-left">500+</div>
              <p class="text-emerald-700 font-semibold">Проверенных продавцов</p>
            </div>
          </div>
          
          <div class="group card-hover relative p-8 bg-gradient-to-br from-violet-50 to-violet-100/50 rounded-2xl border border-violet-200 hover:shadow-lg transition-all duration-300 cursor-pointer">
            <div class="relative z-10">
              <div class="text-4xl lg:text-5xl font-bold text-violet-600 mb-2 group-hover:scale-110 transition-transform origin-left">2000+</div>
              <p class="text-violet-700 font-semibold">Студентов на платформе</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="w-full px-6 sm:px-8 lg:px-16 xl:px-20 py-24 lg:py-32 bg-slate-50">
      <div class="max-w-4xl mx-auto">
        <div class="relative overflow-hidden bg-gradient-to-r from-blue-600 to-emerald-600 rounded-3xl p-12 lg:p-20 text-center text-white shadow-2xl shadow-blue-600/20">
          <div class="absolute top-0 right-0 w-80 h-80 bg-white opacity-5 rounded-full -mr-40 -mt-40 blur-3xl"></div>
          <div class="relative z-10">
            <h2 class="text-3xl lg:text-4xl font-bold mb-6">Начните прямо сейчас</h2>
            <p class="text-lg text-blue-50 mb-10 max-w-2xl mx-auto leading-relaxed">
              Присоединяйтесь к сообществу студентов и начните покупать или продавать товары по лучшим ценам. Регистрация занимает всего 2 минуты.
            </p>
            <router-link
              to="/catalog"
              class="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-all duration-200 shadow-lg hover:shadow-xl text-base group"
            >
              Перейти в каталог
              <svg class="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </router-link>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>



<script setup>
import SellerPromo from '@/components/SellerPromo.vue'
// Логика
</script>

<style scoped>
/* Дополнительные стили */
</style>
