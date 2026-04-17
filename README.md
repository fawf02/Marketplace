# 📱 StudentHub - Маркетплейс для студентов

**StudentHub** - это современный маркетплейс для студентов, созданный с использованием Vue 3, Vite и Tailwind CSS. Проект демонстрирует профессиональный подход к разработке frontend-приложений с применением лучших практик UI/UX дизайна.



### Требования
- Node.js 16.x или выше
- npm 8.x или выше

### Установка и запуск

```bash
# Клонировать репозиторий
cd VueProject

# Установить зависимости
npm install

# Запустить dev-сервер
npm run dev
# Доступно на http://localhost:5174

# Собрать для production
npm run build

# Превью production-сборки
npm run preview
```

## 📁 Структура проекта

```
src/
├── assets/
│   ├── styles/
│   │   ├── globals.css         # Глобальные стили, типографика
│   │   ├── animations.css      # Анимации и эффекты
│   │   └── main.css            # Tailwind импорты
│   ├── base.css
│   └── main.css
├── components/
│   └── NavBar.vue              # Профессиональная навигация
├── views/
│   ├── HomeView.vue            # Главная страница
│   └── CatalogView.vue         # Каталог товаров
├── router/
│   └── index.js                # Vue Router конфигурация
├── App.vue                     # Корневой компонент
└── main.js                     # Точка входа
```

## 🎯 Основные страницы

### Главная страница (/)
- **Hero-раздел** с вызовом к действию
- **Features** - 3 основных преимущества
- **Stats** - статистика платформы
- **CTA** - финальный вызов к действию

### Каталог (/catalog)
- **Фильтры** - категория, цена, рейтинг
- **Сортировка** - по популярности, цене, рейтингу
- **Пустое состояние** - привлекательный дизайн

## 🛠️ Технологический стек

- **Vue.js 3.5.27** - Progressive JavaScript Framework
- **Vite 7.3.1** - Lightning-fast frontend build tool
- **Vue Router 4** - Official router for Vue.js
- **Tailwind CSS v4** - Utility-first CSS framework
- **PostCSS** - JavaScript tool for transforming CSS
- **Autoprefixer** - Parse CSS and add vendor prefixes

## 📦 Зависимости

```json
{
  "dependencies": {
    "vue": "^3.5.27",
    "vue-router": "^4.4.5"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4.0.0-alpha.45",
    "autoprefixer": "^10.4.20",
    "postcss": "^8.4.47",
    "vite": "^7.3.1"
  }
}
```

## 💡 Советы для разработчиков

1. **Используйте `card-hover` класс** для карточек с эффектом
2. **Все кнопки должны иметь иконки** с правой стороны
3. **Проверяйте адаптивность** с помощью браузерного DevTools
4. **Используйте slate цвета** вместо gray для консистентности
5. **Применяйте hover-эффекты** ко всем интерактивным элементам
6. **Используйте Vue DevTools** для отладки (Alt+Shift+D)



## 👨‍💻 Разработано

Проект создан с ❤️ для студентов, которые хотят научиться создавать современные веб-приложения.

---

**Версия**: 1.0.0  
**Последнее обновление**: 2024  
**Статус**: ✅ **PRODUCTION READY**
components/ReviewList.vue: Список текстовых отзывов.


Итоговая структура проекта (примерная)
Plaintext
src/
├── assets/          # Шрифты, картинки
├── components/      # Переиспользуемые компоненты (ProductCard, NavBar, Rating)
├── layouts/         # Шаблоны страниц
├── router/          # Настройки маршрутизации
├── stores/          # Pinia сторы (cart, auth, products)
├── views/           # Страницы (Home, Catalog, Product, Cart, Profile)
├── App.vue
└── main.js
