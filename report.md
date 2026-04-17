# Технический отчет: Реализация системы профиля пользователя

**Дата:** 20 февраля 2026 г.  
**Версия:** 1.0  
**Статус:** Завершено

---

## Summary

В рамках текущего спринта реализована полнофункциональная система управления профилем пользователя с поддержкой CRUD-операций для объявлений (товаров) и просмотром истории заказов. Основной упор сделан на:

- **Создание и управление объявлениями** — пользователи могут создавать товары через специальное модальное окно (`SellModal.vue`)
- **Просмотр объявлений и заказов** — отдельная страница профиля с табированным интерфейсом для удобства
- **Редактирование и удаление** — полные возможности изменения параметров объявлений с валидацией данных
- **Безопасность доступа** — реализована проверка прав собственности (只 владелец может редактировать/удалять свои объявления)
- **Интеграция с аутентификацией** — все операции требуют валидный JWT токен и защищены middleware

---

## Technical Implementation

### Архитектура данных

**Основная схема:**
- **Коллекция `products`** (MongoDB) — хранит все объявления (товары)
- **Коллекция `Users`** (MongoDB) — хранит данные пользователей
- **Коллекция `orders`** (MongoDB) — хранит заказы с привязкой к покупателю

### Логика забора данных

#### 1. Загрузка объявлений пользователя

**Frontend (ProfileView.vue)**
```javascript
async function fetchAdvertisements() {
  try {
    loading.value.ads = true
    const data = await auth.api('/api/user/advertisements')
    advertisements.value = data || []
  } catch (err) {
    // Обработка ошибки с уведомлением пользователю
  }
}
```

**Backend эндпоинт:** `GET /api/user/advertisements`
- **Требует:** JWT токен в заголовке `Authorization: Bearer <token>`
- **Middleware:** `authMiddleware` — проверяет валидность токена и извлекает `req.user.id`
- **Логика запроса:**
  ```javascript
  const products = await getProductsCollection()
    .find({ sellerId: new ObjectId(req.user.id) })
    .sort({ createdAt: -1 })
    .toArray()
  ```
- **Преобразование данных:** ObjectId текущего пользователя используется для фильтрации товаров по полю `sellerId`
- **Сортировка:** От новых к старым (createdAt: -1)
- **Ответ:** Массив объектов товаров с полями: `_id`, `title`, `price`, `category`, `description`, `image`, `sellerId`, `sellerName`, `sellerEmail`

#### 2. Загрузка заказов пользователя

**Frontend (ProfileView.vue)**
```javascript
async function fetchOrders() {
  try {
    loading.value.orders = true
    const data = await auth.api('/api/user/orders')
    orders.value = data || []
  } catch (err) {
    // Обработка ошибки с уведомлением пользователю
  }
}
```

**Backend эндпоинт:** `GET /api/user/orders`
- **Требует:** JWT токен, authMiddleware
- **Логика запроса:**
  ```javascript
  const user = await users.findOne({ _id: new ObjectId(req.user.id) })
  const orders = await getOrdersCollection()
    .find({ "customer.email": user.email })
    .sort({ createdAt: -1 })
    .toArray()
  ```
- **Фильтрация:** Поиск заказов по email пользователя (field `customer.email`)
- **Сортировка:** От новых к старым
- **Ответ:** Массив заказов с полями: `_id`, `items[]`, `totalPrice`, `customer`, `createdAt`, `status`

#### 3. Инициализация данных

**Хук жизненного цикла (onMounted):**
```javascript
onMounted(async () => {
  if (!auth.isAuthenticated) {
    router.push('/catalog')
    return
  }
  await fetchAdvertisements()
  await fetchOrders()
})
```

**Результат:** При загрузке страницы `/profile` автоматически проверяется аутентификация и загружаются оба списка параллельно.

---

## CRUD Operations

### CREATE — Создание объявления

#### Компонент: `SellModal.vue`

**UI форма:**
- **Название товара** (обязательно, строка)
- **Категория** (обязательно, select с опциями: electronics, clothing, furniture, sports, books, toys, other)
- **Цена в ₽** (обязательно, число)
- **Описание** (опционально, textarea)
- **Ссылка на изображение** (опционально, URL)

**Функция отправки:**
```javascript
async function submit() {
  try {
    error.value = ''
    loading.value = true

    if (!title || !price || !category) {
      error.value = 'Заполните обязательные поля'
      return
    }

    const result = await auth.api('/api/products', {
      method: 'POST',
      body: { title, price, category, description, image }
    })

    auth.closeSell()
    // Обновление списка объявлений в профиле
  } catch (err) {
    error.value = err.message
  }
}
```

**Backend эндпоинт:** `POST /api/products`
- **Требует:** JWT токен, authMiddleware
- **Валидация:**
  - Проверка обязательных полей: `title`, `price`, `category`
  - Проверка существования пользователя в БД
- **Автоматическое заполнение полей:**
  ```javascript
  {
    sellerId: new ObjectId(req.user.id),
    sellerName: user.name,
    sellerEmail: user.email,
    rating: 0,
    reviews: [],
    createdAt: new Date(),
    updatedAt: new Date()
  }
  ```
- **Результат:** Вставка документа в коллекцию `products`, возврат ObjectId нового товара

#### Точка входа: `SellerPromo.vue`
```javascript
// Условное открытие модального окна
@click="!auth.isAuthenticated ? auth.openLogin() : auth.openSell()"
```

---

### READ — Чтение объявлений

#### Фронтенд: `ProfileView.vue`

**Отображение списка:**
```vue
<div v-if="advertisements.length === 0" class="...">
  <!-- Пустое состояние -->
</div>

<div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  <div v-for="ad in advertisements" :key="ad._id" class="...">
    <!-- Карточка товара с изображением, названием, ценой, категорией -->
  </div>
</div>
```

**Отображаемые данные:**
- `ad.image` — основное изображение товара
- `ad.title` — название (2 строки max, line-clamp-2)
- `ad.description` — описание (2 строки max)
- `ad.price` — цена в ₽
- `ad.category` — категория в бэджевом формате

#### Состояние загрузки:
```javascript
<div v-if="loading.ads" class="...">
  <p>Загрузка...</p>
</div>
```

#### Backend эндпоинт: `GET /api/products` (публичный)
- **Опубликованный каталог** — доступен без аутентификации
- **Параметры фильтрации:**
  - `category` — фильтр по категории
  - `minPrice`, `maxPrice` — фильтр по цене
  - `rating` — фильтр по рейтингу
  - `q` — полнотекстовый поиск
  - `sort` — сортировка (price_asc, price_desc, newest, rating_desc)
  - `page`, `limit` — пагинация

---

### UPDATE — Редактирование объявления

#### Frontend: `ProfileView.vue`

**Открытие модального окна редактирования:**
```javascript
function editAdvertisement(ad) {
  editForm.value = {
    id: ad._id,
    title: ad.title,
    description: ad.description,
    price: ad.price,
    category: ad.category,
    image: ad.image
  }
  showEditModal.value = true
}
```

**Форма редактирования:**
- Все те же поля, что и при создании (title, category, price, description, image)
- Валидация обязательных полей перед сохранением

**Функция сохранения:**
```javascript
async function saveEdit() {
  try {
    editError.value = ''
    editLoading.value = true

    if (!editForm.value.title || !editForm.value.price || !editForm.value.category) {
      editError.value = 'Заполните обязательные поля'
      return
    }

    await auth.api(`/api/advertisements/${editForm.value.id}`, {
      method: 'PUT',
      body: editForm.value
    })

    showEditModal.value = false
    await fetchAdvertisements() // Обновление списка
  } catch (err) {
    editError.value = err.message
  }
}
```

#### Backend эндпоинт: `PUT /api/advertisements/:id`
- **Требует:** JWT токен, authMiddleware
- **Параметр маршрута:** ID документа (`:id`)
- **Валидация:**
  - Проверка формата ObjectId
  - Проверка существования объявления
  - **Проверка прав собственности:**
    ```javascript
    if (product.sellerId.toString() !== req.user.id) {
      return res.status(403).json({ error: "У вас нет прав для редактирования" })
    }
    ```
- **Обновление документа:**
  ```javascript
  await productsCollection.updateOne(
    { _id: new ObjectId(id) },
    { $set: { title, description, price, category, image, updatedAt: new Date() } }
  )
  ```

---

### DELETE — Удаление объявления

#### Frontend: `ProfileView.vue`

**Кнопка удаления:**
```javascript
async function deleteAdvertisement(id) {
  // (Implicit confirmation through browser)
  await auth.api(`/api/advertisements/${id}`, {
    method: 'DELETE'
  })
  await fetchAdvertisements() // Обновление списка
}
```

#### Backend эндпоинт: `DELETE /api/advertisements/:id`
- **Требует:** JWT токен, authMiddleware
- **Валидация:**
  - Проверка формата ObjectId
  - Проверка существования объявления
  - **Проверка прав собственности** (аналогично UPDATE)
- **Удаление документа:**
  ```javascript
  await productsCollection.deleteOne({ _id: new ObjectId(id) })
  ```

---

## UI/UX Refactoring

### 1. Архитектура страницы профиля

**Компонент:** `ProfileView.vue` (src/views/ProfileView.vue)

#### Структура:
```
╔════════════════════════════════════════╗
║  Header (Имя пользователя, Email)      ║
║  └─ Кнопка "Выход"                     ║
╠════════════════════════════════════════╣
║  Tab Navigation                        ║
║  ├─ Мои объявления (selected)          ║
║  ├─ Мои заказы                         ║
║  └─ Информация                         ║
╠════════════════════════════════════════╣
║  Tab Content (динамическое)            ║
║  ├─ Сетка товаров 1/2/3 колонок        ║
║  ├─ Список заказов                     ║
║  └─ Информация профиля                 ║
╚════════════════════════════════════════╝
```

#### Header:
- **Типография:** Заголовок 4xl, bold
- **Информация пользователя:** Email в подтексте
- **Кнопка выхода:** Red-600, hover:red-700

### 2. System Tab Navigation

**Вкладки:**
| ID | Название | Иконография |
|----|----------|------------|
| `ads` | Мои объявления | (товары) |
| `orders` | Мои заказы | (покупки) |
| `info` | Информация | (профиль) |

**Стилизация:**
- Активная вкладка: `border-b-2 border-blue-600 text-blue-600`
- Неактивная: `border-transparent text-slate-600 hover:text-slate-900`
- Переход между вкладками: `hover:*`

### 3. Вкладка "Мои объявления"

#### Верхняя панель:
- **Заголовок:** "Мои объявления" (2xl, bold)
- **Кнопка действия:** "+ Создать объявление" (Orange-500, hover:orange-600)

#### Состояния:
1. **Загрузка:**
   ```vue
   <p class="text-center py-8">Загрузка...</p>
   ```

2. **Пусто:**
   ```vue
   <div class="bg-white rounded-lg p-8 text-center">
     <p class="text-slate-600 mb-4">У вас еще нет объявлений</p>
     <button>Создать первое объявление</button>
   </div>
   ```

3. **Заполнено:**
   ```vue
   <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
     <!-- Карточка товара -->
   </div>
   ```

#### Карточка товара:
**Структура:**
```
┌─────────────────────────┐
│  [Изображение товара]   │ (h-40 object-cover)
├─────────────────────────┤
│ Название товара         │ (line-clamp-2)
│ Описание товара         │ (line-clamp-2, text-sm)
│                         │
│ 45000₽  [Категория]     │
│                         │
│ [Редактировать] [Удал]  │
└─────────────────────────┘
```

**Компоненты:**
- **Изображение:** `<img :src="ad.image" h-40 object-cover>`
- **Название:** Синтаксис Vue, line-clamp-2 (max 2 строки)
- **Описание:** Серый текст (text-slate-600), line-clamp-2
- **Цена:** 2xl, bold, Blue-600
- **Категория:** Бэдж (bg-slate-200, text-slate-700, px-2 py-1 rounded)
- **Кнопки:**
  - Редактировать: Blue-100 bg, Blue-600 text, hover:blue-200
  - Удалить: Red-100 bg, Red-600 text, hover:red-200

**Интерактивность:**
- На карточке: `hover:shadow-lg transition-shadow`
- На кнопках: `transition-colors`

### 4. Вкладка "Мои заказы"

**Отображение:**
```vue
<div v-for="order in orders" :key="order._id" class="bg-white rounded-lg p-6 mb-4">
  <div class="flex justify-between items-center mb-4">
    <div>
      <p class="text-sm text-slate-600">Заказ #{{ order._id.substring(order._id.length - 6) }}</p>
      <p class="text-slate-900">{{ formatDate(order.createdAt) }}</p>
    </div>
    <p class="text-2xl font-bold text-blue-600">{{ order.totalPrice }}₽</p>
  </div>
  <div class="space-y-2">
    <p v-for="item in order.items" :key="item._id" class="text-slate-700">
      {{ item.title }} × {{ item.quantity }} = {{ item.price * item.quantity }}₽
    </p>
  </div>
</div>
```

**Пустое состояние:**
```vue
<div class="bg-white rounded-lg p-8 text-center">
  <p class="text-slate-600">У вас еще нет заказов</p>
  <router-link to="/catalog" class="text-blue-600 hover:underline">
    Начать покупки
  </router-link>
</div>
```

**Утилиты:**
```javascript
const formatDate = (date) => {
  return new Date(date).toLocaleDateString('ru-RU')
}

const calculateTotal = (items) => {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0)
}
```

### 5. Вкладка "Информация"

**Содержание:**
- ID пользователя (копируется по клику)
- Email
- Дата регистрации (форматирована)
- Количество объявлений
- Количество заказов
- Рейтинг продавца (если есть)

### 6. Модальное окно редактирования

**Структура:**
```
┌──────────────────────────────┐
│ Редактировать объявление     │ (h3 text-2xl bold)
├──────────────────────────────┤
│ [Название товара]            │
│ [Категория select]           │
│ [Цена в ₽]                   │
│ [Описание textarea]          │
│ [Ссылка на изображение]      │
│                              │
│ [Сохранить] [Отмена]         │
└──────────────────────────────┘
```

**Состояния:**
- **Сохранение:** Кнопка отключена (disabled:opacity-50), текст меняется на "Сохранение..."
- **Ошибка:** Красный текст ошибки (text-red-600, text-sm)

### 7. Интеграция с маршрутизацией

**Маршрут:** `/profile`
- **Компонент:** `ProfileView.vue`
- **Защита:** `meta: { requiresAuth: true }`
- **Редирект:** Если не аутентифицирован → `/catalog`

**NavBar обновление:**
```javascript
// Вместо @click="auth.openProfile"
<router-link to="/profile" class="...">Профиль</router-link>
```

### 8. Состояния загрузки

**Data структура:**
```javascript
const loading = ref({ 
  ads: false,      // Для списка объявлений
  orders: false    // Для списка заказов
})

const editLoading = ref(false)  // Для формы редактирования
```

**Индикаторы:**
- **Карточки товаров:** Спинер вместо контента (v-if="loading.ads")
- **Кнопка сохранения:** Отключена и с текстом "Сохранение..." (disabled=editLoading)

### 9. Валидация форм

**SellModal.vue:**
```javascript
if (!title || !price || !category) {
  error.value = 'Заполните обязательные поля'
  return
}
```

**ProfileView.vue (редактирование):**
```javascript
if (!editForm.value.title || !editForm.value.price || !editForm.value.category) {
  editError.value = 'Заполните обязательные поля'
  return
}
```

### 10. Обработка ошибок

**Frontend:**
- **Уведомления:** `alert()` для критических ошибок
- **Встроенные сообщения:** Красный текст (text-red-600) в формах
- **Console логирование:** `console.log()` и `console.error()` для отладки

**Backend:**
- **Статус коды:**
  - `201` — успешное создание (POST)
  - `200` — успешное получение/обновление (GET, PUT)
  - `400` — невалидные данные
  - `401` — отсутствует/невалидный токен
  - `403` — отсутствуют права на редактирование
  - `404` — объявление/пользователь не найден
  - `503` — БД недоступна

---

## Точка входа в систему продаж

### Маршрут пользователя (User Journey)

```
[Главная страница]
    ↓
[SellerPromo.vue] ← Кнопка "Есть что продать?"
    ↓
Проверка: isAuthenticated?
    ├─ Нет → [LoginModal] (auth.openLogin())
    └─ Да → [SellModal] (auth.openSell())
        ↓
    [Форма создания товара]
        ↓
    POST /api/products ← отправка данных в БД
        ↓
    [Редирект на профиль?] или просто закрытие модали
        ↓
    [ProfileView.vue] → Таб "Мои объявления"
        ↓
    GET /api/user/advertisements ← загрузка товаров пользователя
        ↓
    [Отображение сетки товаров]
        ↓
    Действия: Редактировать (PUT) / Удалить (DELETE)
```

---

## Технологический стек

| Компонент | Технология | Версия |
|-----------|-----------|---------|
| **Frontend** | Vue 3 (Composition API) | 3.0+ |
| **Состояние** | Pinia | 2.0+ |
| **Маршрутизация** | Vue Router | 4.0+ |
| **Стили** | Tailwind CSS | 3.0+ |
| **HTTP клиент** | Native Fetch API | ES2020 |
| **Backend** | Express.js | 4.18+ |
| **База данных** | MongoDB + Mongoose | Latest |
| **Аутентификация** | JWT (jsonwebtoken) | 9.0+ |
| **Хеширование** | bcryptjs | 2.4+ |
| **Среда** | Node.js | 18+ |

---

## Завершённые метрики

| Метрика | Значение |
|---------|---------|
| **Компоненты создано** | 3 (ProfileView, SellModal, SellerPromo) |
| **API эндпоинтов добавлено** | 7 (CRUD + Health Check) |
| **CRUD операций** | 4 (Create, Read, Update, Delete) |
| **Уровни защиты** | 2 (JWT middleware + права собственности) |
| **Таб интерфейсов** | 3 (Объявления, Заказы, Инфо) |
| **Валидаций на фронте** | 2 (SellModal, EditModal) |
| **Состояний загрузки** | 3 (ads, orders, edit) |

---

## Известные ограничения

1. **Изображения:** Загружаются по URL из вне, не через юзер-загрузку файлов
2. **Заказы недописаны** (Orders система требует доработки checkout механизма)
3. **История редактирования** не отслеживается (нет версионирования товаров)
4. **Пагинация** отсутствует в профиле (При большом количестве товаров может быть неудобно)
5. **Поиск в профиле** отсутствует (Нужна локальная фильтрация товаров пользователя)

---

## Результаты и выводы

✅ **Успешно реализовано:**
- Полный CRUD для управления объявлениями
- Безопасная аутентификация и авторизация
- Интуитивный табированный интерфейс
- Обработка ошибок на обоих слоях (frontend + backend)
- Масштабируемая архитектура компонентов

⚠️ **Требует дальнейшей доработки:**
- Система заказов (checkout механизм)
- Загрузка файлов вместо URL
- Поиск и фильтрация в профиле
- Рейтинги и отзывы продавцов

🎯 **Готово к продакшену:**
- Система создания объявлений
- Система управления объявлениями
- Просмотр профиля и заказов

