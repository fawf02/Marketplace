// server.js
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();
const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/marketplace";
const port = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || "dev_secret";

// ===== Диагностика переменных окружения =====
console.log("╔════════════════════════════════════════╗");
console.log("║      ИНИЦИАЛИЗАЦИЯ ПРИЛОЖЕНИЯ          ║");
console.log("╚════════════════════════════════════════╝");
console.log("🔧 Переменные окружения:");
console.log(`   📍 PORT:      ${port}`);
console.log(`   🗄️  MONGO_URI: ${mongoUri}`);
console.log(`   🔐 JWT_SECRET: ${JWT_SECRET.substring(0, 5)}***${JWT_SECRET.substring(Math.max(0, JWT_SECRET.length - 5))}`);
console.log("╚════════════════════════════════════════╝");

// ===== Middleware =====
app.use(cors());
app.use(express.json());

// ===== MongoDB Connection =====
let isDbConnected = false;
let db = null;

const connectDatabase = async () => {
  try {
    console.log("🔄 Подключаемся к MongoDB:", mongoUri);

    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
      // Старые опции убраны (useNewUrlParser и useUnifiedTopology включены по умолчанию в Mongoose 7+)
    });

    console.log("✅ MongoDB успешно подключена");
    isDbConnected = true;
    db = mongoose.connection.db;

    // Проверка подключения
    const admin = mongoose.connection.db.admin();
    const status = await admin.ping();
    console.log("✅ MongoDB ping успешен:", status);

  } catch (err) {
    console.error("❌ Ошибка подключения к MongoDB:", err.message);
    console.error("⚠️  Проверьте MONGO_URI в .env файле:", mongoUri);
    isDbConnected = false;

    // Повторная попытка через 5 секунд
    setTimeout(connectDatabase, 5000);
  }
};

// Инициализируем подключение
connectDatabase();

// ===== JWT Helpers =====
console.log("🔐 JWT_SECRET загружен (первые 10 символов):", JWT_SECRET.substring(0, 10) + "***");

const signToken = (payload) => {
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
  console.log("✅ Токен создан для пользователя:", payload.id);
  return token;
};

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    console.error('[AUTH] ❌ Отсутствует Authorization заголовок');
    return res.status(401).json({ error: "Нет токена" });
  }

  const [scheme, token] = authHeader.split(" ");
  if (scheme !== "Bearer" || !token) {
    console.error('[AUTH] ❌ Неверный формат токена. Схема:', scheme);
    return res.status(401).json({ error: "Неверный формат токена. Используйте: Bearer <token>" });
  }

  if (!token || token.length < 20) {
    console.error('[AUTH] ❌ Токен слишком короткий или пустой');
    return res.status(401).json({ error: "Неверный токен формат" });
  }

  try {
    console.log("[AUTH] 🔍 Проверяем токен...");
    req.user = jwt.verify(token, JWT_SECRET);
    console.log('[AUTH] ✅ Токен успешно проверен. User ID:', req.user.id);
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      console.error('[AUTH] ❌ Токен истёк:', err.message);
      return res.status(401).json({ error: "Токен истёк. Пожалуйста, войдите заново" });
    } else if (err.name === 'JsonWebTokenError') {
      console.error('[AUTH] ❌ Неверная подпись токена. Проверьте JWT_SECRET:', err.message);
      return res.status(401).json({ error: "Токен поддельный или повреждён" });
    } else {
      console.error('[AUTH] ❌ Ошибка проверки токена:', err.message);
      return res.status(401).json({ error: "Неверный или просроченный токен" });
    }
  }
};

// ===== Mock Data =====
const mockProducts = [
  {
    _id: new ObjectId("507f1f77bcf86cd799439011"),
    title: "MacBook Pro 14",
    description: "Ноутбук Apple MacBook Pro 14 дюймов, состояние отличное",
    price: 45000,
    category: "electronics",
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500",
    images: [
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500",
      "https://images.unsplash.com/photo-1585079541281-2d17de2879eb?w=500"
    ],
    sellerId: new ObjectId("507f1f77bcf86cd799439001"),
    sellerName: "Иван",
    sellerEmail: "ivan@example.com",
    rating: 4.8,
    reviews: [],
    createdAt: new Date()
  },
  {
    _id: new ObjectId("507f1f77bcf86cd799439012"),
    title: "Кожаная куртка",
    description: "Черная кожаная куртка, размер L, как новая",
    price: 3500,
    category: "clothing",
    image: "https://images.unsplash.com/photo-1551028719-00167b16ebc5?w=500",
    images: [
      "https://images.unsplash.com/photo-1551028719-00167b16ebc5?w=500",
      "https://images.unsplash.com/photo-1521334884684-d80222895322?w=500"
    ],
    sellerId: new ObjectId("507f1f77bcf86cd799439002"),
    sellerName: "Мария",
    sellerEmail: "maria@example.com",
    rating: 4.5,
    reviews: [],
    createdAt: new Date()
  },
  {
    _id: new ObjectId("507f1f77bcf86cd799439013"),
    title: "Офисный стол",
    description: "Деревянный стол 120x60, подойдет для работы или учебы",
    price: 2500,
    category: "furniture",
    image: "https://images.unsplash.com/photo-1592078615290-033ee584e267?w=500",
    images: [
      "https://images.unsplash.com/photo-1592078615290-033ee584e267?w=500"
    ],
    sellerId: new ObjectId("507f1f77bcf86cd799439003"),
    sellerName: "Петр",
    sellerEmail: "petr@example.com",
    rating: 4.2,
    reviews: [],
    createdAt: new Date()
  }
];

const mockUsers = [
  {
    _id: new ObjectId("507f1f77bcf86cd799439001"),
    name: "Иван",
    email: "ivan@example.com",
    passwordHash: "$2a$10$abcdefgh", // dummy hash
    createdAt: new Date()
  }
];

const mockOrders = [];
const mockCarts = [];

// ===== Helpers ====
const getUsersCollection = async () => mongoose.connection.db.collection("Users");
const getProductsCollection = async () => mongoose.connection.db.collection("products");
const getOrdersCollection = async () => mongoose.connection.db.collection("orders");
const getCartCollection = async () => mongoose.connection.db.collection("carts");
const getMessagesCollection = async () => mongoose.connection.db.collection("messages");

// ====== Routes ======

// --- Health Check ---
app.get("/api/health", async (req, res) => {
  try {
    const health = {
      status: "ok",
      server: "running",
      mongodb: isDbConnected ? "connected" : "disconnected",
      timestamp: new Date().toISOString(),
      port: port,
      env: {
        hasJWT_SECRET: !!JWT_SECRET && JWT_SECRET !== "dev_secret",
        hasMONGO_URI: !!mongoUri
      }
    };

    if (isDbConnected) {
      try {
        const admin = mongoose.connection.db.admin();
        const dbStatus = await admin.ping();
        health.mongoDbPing = dbStatus.ok === 1 ? "ok" : "error";

        // Количество документов в каждой коллекции
        health.collections = {
          users: await (await getUsersCollection()).countDocuments(),
          products: await (await getProductsCollection()).countDocuments(),
          orders: await (await getOrdersCollection()).countDocuments(),
          carts: await (await getCartCollection()).countDocuments()
        };
      } catch (err) {
        health.mongoDbPing = "error";
        health.error = err.message;
      }
    }

    res.json(health);
  } catch (err) {
    console.error("[HEALTH CHECK ERROR]", err);
    res.status(500).json({
      status: "error",
      message: err.message,
      timestamp: new Date().toISOString()
    });
  }
});


app.get("/api/products", async (req, res) => {
  try {
    if (!isDbConnected) {
      return res.status(503).json({ error: "Сервер БД недоступен. Проверьте подключение MongoDB" });
    }

    const { category, minPrice, maxPrice, rating, q, sort, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (category) {
      const cats = category.split(',').map(c => c.trim()).filter(Boolean);
      if (cats.length === 1) {
        filter.category = cats[0];
      } else if (cats.length > 1) {
        filter.category = { $in: cats };
      }
    }
    if (minPrice || maxPrice) filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
    if (rating) filter.rating = { $gte: Number(rating) };
    if (q) filter.$text = { $search: q };

    const skip = (Math.max(Number(page), 1) - 1) * Number(limit);
    const cursor = (await getProductsCollection()).find(filter).skip(skip);

    if (sort) {
      const sortMap = {
        price_asc: { price: 1 },
        price_desc: { price: -1 },
        newest: { createdAt: -1 },
        rating_desc: { rating: -1 },
      };
      cursor.sort(sortMap[sort] || {});
    }

    const products = await cursor.toArray();
    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Ошибка получения продуктов" });
  }
});

app.get("/api/products/:id", async (req, res) => {
  try {
    if (!isDbConnected) {
      return res.status(503).json({ error: "Сервер БД недоступен" });
    }

    const { id } = req.params;
    if (!ObjectId.isValid(id)) return res.status(400).json({ error: "Неверный ID" });

    const product = await (await getProductsCollection()).findOne({ _id: new ObjectId(id) });
    if (!product) return res.status(404).json({ error: "Продукт не найден" });

    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Ошибка получения продукта" });
  }
});

// Создать продукт
app.post("/api/products", authMiddleware, async (req, res) => {
  try {
    if (!isDbConnected) {
      return res.status(503).json({ error: "Сервер БД недоступен" });
    }

    const { title, description, price, category, image, images, address } = req.body;
    if (!title || !price || !category) return res.status(400).json({ error: "Заполните обязательные поля: название, цена, категория" });

    const users = await getUsersCollection();
    const user = await users.findOne({ _id: new ObjectId(req.user.id) });
    if (!user) return res.status(404).json({ error: "Пользователь не найден" });

    const product = {
      title,
      description: description || "",
      price: Number(price),
      category,
      address: address || "",
      image: image || (Array.isArray(images) && images[0]) || "",
      images: Array.isArray(images) ? images : image ? [image] : [],
      sellerId: new ObjectId(req.user.id),
      sellerName: user.name,
      sellerEmail: user.email,
      rating: 0,
      reviews: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await (await getProductsCollection()).insertOne(product);
    res.status(201).json({ id: result.insertedId.toString(), ...product });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Ошибка создания продукта" });
  }
});

// Получить объявления пользователя
app.get("/api/user/advertisements", authMiddleware, async (req, res) => {
  try {
    if (!isDbConnected) {
      return res.status(503).json({ error: "Сервер БД недоступен" });
    }

    const products = await (await getProductsCollection())
      .find({ sellerId: new ObjectId(req.user.id) })
      .sort({ createdAt: -1 })
      .toArray();

    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Ошибка получения объявлений" });
  }
});

// Обновить объявление
app.put("/api/advertisements/:id", authMiddleware, async (req, res) => {
  try {
    if (!isDbConnected) {
      return res.status(503).json({ error: "Сервер БД недоступен" });
    }

    const { id } = req.params;
    const { title, description, price, category, image, images } = req.body;

    if (!ObjectId.isValid(id)) return res.status(400).json({ error: "Неверный ID" });
    if (!title || !price || !category) return res.status(400).json({ error: "Заполните обязательные поля" });

    const productsCollection = await getProductsCollection();
    const product = await productsCollection.findOne({ _id: new ObjectId(id) });

    if (!product) return res.status(404).json({ error: "Объявление не найдено" });
    if (product.sellerId.toString() !== req.user.id) {
      return res.status(403).json({ error: "У вас нет прав для редактирования этого объявления" });
    }

    const updated = {
      title,
      description: description || "",
      price: Number(price),
      category,
      image: image || (Array.isArray(images) && images[0]) || "",
      images: Array.isArray(images) ? images : image ? [image] : [],
      updatedAt: new Date()
    };

    await productsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updated }
    );

    res.json({ message: "Объявление обновлено", ...product, ...updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Ошибка обновления объявления" });
  }
});

// Удалить объявление
app.delete("/api/advertisements/:id", authMiddleware, async (req, res) => {
  try {
    if (!isDbConnected) {
      return res.status(503).json({ error: "Сервер БД недоступен" });
    }

    const { id } = req.params;
    if (!ObjectId.isValid(id)) return res.status(400).json({ error: "Неверный ID" });

    const productsCollection = await getProductsCollection();
    const product = await productsCollection.findOne({ _id: new ObjectId(id) });

    if (!product) return res.status(404).json({ error: "Объявление не найдено" });
    if (product.sellerId.toString() !== req.user.id) {
      return res.status(403).json({ error: "У вас нет прав для удаления этого объявления" });
    }

    await productsCollection.deleteOne({ _id: new ObjectId(id) });
    res.json({ message: "Объявление удалено" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Ошибка удаления объявления" });
  }
});

// Получить заказы пользователя
app.get("/api/user/orders", authMiddleware, async (req, res) => {
  try {
    if (!isDbConnected) {
      return res.status(503).json({ error: "Сервер БД недоступен" });
    }

    const users = await getUsersCollection();
    const user = await users.findOne({ _id: new ObjectId(req.user.id) });
    if (!user) return res.status(404).json({ error: "Пользователь не найден" });

    const orders = await (await getOrdersCollection())
      .find({ "customer.email": user.email })
      .sort({ createdAt: -1 })
      .toArray();

    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Ошибка получения заказов" });
  }
});

// --- Auth ---
app.post("/api/auth/register", async (req, res) => {
  try {
    if (!isDbConnected) {
      return res.status(503).json({ error: "Сервер БД недоступен" });
    }

    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: "Заполните все поля" });
    if (password.length < 6) return res.status(400).json({ error: "Пароль должен быть не менее 6 символов" });

    const users = await getUsersCollection();
    if (await users.findOne({ email })) return res.status(409).json({ error: "Пользователь уже существует" });

    const passwordHash = await bcrypt.hash(password, 10);
    const result = await users.insertOne({ name, email, passwordHash, createdAt: new Date() });

    const user = { id: result.insertedId.toString(), name, email };
    const token = signToken({ id: user.id, email: user.email });

    res.status(201).json({ user, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Ошибка регистрации" });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    if (!isDbConnected) {
      return res.status(503).json({ error: "Сервер БД недоступен" });
    }

    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Заполните все поля" });

    const users = await getUsersCollection();
    const user = await users.findOne({ email });
    if (!user) return res.status(401).json({ error: "Неверные email или пароль" });

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) return res.status(401).json({ error: "Неверные email или пароль" });

    const payload = { id: user._id.toString(), email: user.email };
    const token = signToken(payload);

    res.json({ user: { id: payload.id, name: user.name, email: user.email }, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Ошибка входа" });
  }
});

app.get("/api/auth/me", authMiddleware, async (req, res) => {
  try {
    if (!isDbConnected) {
      return res.status(503).json({ error: "Сервер БД недоступен" });
    }

    const users = await getUsersCollection();
    const user = await users.findOne({ _id: new ObjectId(req.user.id) });
    if (!user) return res.status(404).json({ error: "Пользователь не найден" });

    res.json({ id: user._id.toString(), name: user.name, email: user.email });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Ошибка получения пользователя" });
  }
});

// --- Cart ---
// Получить корзину пользователя
app.get("/api/cart", authMiddleware, async (req, res) => {
  try {
    console.log('[API] GET /api/cart - user:', req.user?.id)

    // Если БД не подключена, используем mock
    if (!isDbConnected) {
      const userId = req.user.id;
      const cart = mockCarts.find(c => c.userId === userId);
      if (!cart) {
        return res.json({ userId: req.user.id, items: [] });
      }
      return res.json(cart);
    }

    const cart = await (await getCartCollection()).findOne({ userId: new ObjectId(req.user.id) });
    if (!cart) {
      return res.json({ userId: req.user.id, items: [] });
    }
    res.json(cart);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Ошибка получения корзины" });
  }
});

// Добавить товар в корзину
app.post("/api/cart/items", authMiddleware, async (req, res) => {
  try {
    console.log('[API] POST /api/cart/items - body:', req.body, 'user:', req.user?.id)
    const { productId, qty, title, price, image, description } = req.body;
    if (!productId) return res.status(400).json({ error: "productId обязателен" });

    // Если БД не подключена, используем mock
    if (!isDbConnected) {
      const userId = req.user.id;
      let cart = mockCarts.find(c => c.userId === userId);
      if (!cart) {
        cart = { userId, items: [], createdAt: new Date(), updatedAt: new Date() };
        mockCarts.push(cart);
      }

      const existingItem = cart.items.find(item => item._id === productId);
      if (existingItem) {
        existingItem.qty = (existingItem.qty || 1) + (qty || 1);
      } else {
        cart.items.push({
          _id: productId,
          qty: qty || 1,
          title,
          price,
          image,
          description
        });
      }

      cart.updatedAt = new Date();
      return res.json({ message: "Товар добавлен в корзину", cart });
    }

    const cartCollection = await getCartCollection();
    const userId = new ObjectId(req.user.id);

    let cart = await cartCollection.findOne({ userId });
    if (!cart) {
      cart = { userId, items: [], createdAt: new Date(), updatedAt: new Date() };
    }

    const existingItem = cart.items.find(item => item._id.toString() === productId);
    if (existingItem) {
      existingItem.qty = (existingItem.qty || 1) + (qty || 1);
    } else {
      cart.items.push({
        _id: new ObjectId(productId),
        qty: qty || 1,
        title,
        price,
        image,
        description
      });
    }

    cart.updatedAt = new Date();
    const result = await cartCollection.updateOne(
      { userId },
      { $set: cart },
      { upsert: true }
    );

    console.log('[API] Cart updated for user', req.user.id)
    res.json({ message: "Товар добавлен в корзину", cart });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Ошибка добавления товара в корзину" });
  }
});

// Обновить количество товара в корзине
app.patch("/api/cart/items/:productId", authMiddleware, async (req, res) => {
  try {
    console.log('[API] PATCH /api/cart/items/', req.params.productId, 'body:', req.body, 'user:', req.user?.id)
    const { productId } = req.params;
    const { qty } = req.body;

    if (!ObjectId.isValid(productId)) return res.status(400).json({ error: "Неверный ID товара" });
    if (qty == null) return res.status(400).json({ error: "qty обязателен" });

    const cartCollection = await getCartCollection();
    const userId = new ObjectId(req.user.id);
    const prodId = new ObjectId(productId);

    if (qty <= 0) {
      // Удалить товар если количество <= 0
      await cartCollection.updateOne(
        { userId },
        { $pull: { items: { _id: prodId } }, $set: { updatedAt: new Date() } }
      );
    } else {
      // Обновить количество
      await cartCollection.updateOne(
        { userId, "items._id": prodId },
        { $set: { "items.$.qty": qty, updatedAt: new Date() } }
      );
    }

    const cart = await cartCollection.findOne({ userId });
    res.json({ message: "Количество обновлено", cart });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Ошибка обновления товара" });
  }
});

// Удалить товар из корзины
app.delete("/api/cart/items/:productId", authMiddleware, async (req, res) => {
  try {
    const { productId } = req.params;
    if (!ObjectId.isValid(productId)) return res.status(400).json({ error: "Неверный ID товара" });

    const cartCollection = await getCartCollection();
    const userId = new ObjectId(req.user.id);
    const prodId = new ObjectId(productId);

    await cartCollection.updateOne(
      { userId },
      { $pull: { items: { _id: prodId } }, $set: { updatedAt: new Date() } }
    );

    const cart = await cartCollection.findOne({ userId });
    res.json({ message: "Товар удален из корзины", cart });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Ошибка удаления товара" });
  }
});

// Очистить корзину
app.delete("/api/cart", authMiddleware, async (req, res) => {
  try {
    const cartCollection = await getCartCollection();
    const userId = new ObjectId(req.user.id);

    await cartCollection.updateOne(
      { userId },
      { $set: { items: [], updatedAt: new Date() } }
    );

    res.json({ message: "Корзина очищена", cart: { userId: req.user.id, items: [] } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Ошибка очистки корзины" });
  }
});

// --- Orders ---
app.post("/api/orders", authMiddleware, async (req, res) => {
  try {
    if (!isDbConnected) {
      return res.status(503).json({ error: "Сервер БД недоступен" });
    }

    const orderData = req.body;
    if (!orderData.customer || !orderData.items || orderData.items.length === 0)
      return res.status(400).json({ error: "Неверные данные заказа" });

    console.log('[API] Creating order for user:', req.user.id);

    // mask payment card info if provided
    const order = {
      ...orderData,
      userId: new ObjectId(req.user.id),
      createdAt: new Date()
    };

    if (orderData.payment && orderData.payment.cardNumber) {
      const card = String(orderData.payment.cardNumber).replace(/\s+/g, '');
      order.payment = {
        cardLast4: card.slice(-4),
        method: orderData.payment.method || 'card'
      };
    }

    const result = await (await getOrdersCollection()).insertOne(order);
    console.log('[API] Order created:', result.insertedId);

    res.status(201).json({ id: result.insertedId.toString(), ...order });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Ошибка создания заказа" });
  }
});

app.get("/api/orders", async (req, res) => {
  try {
    if (!isDbConnected) {
      return res.status(503).json({ error: "Сервер БД недоступен" });
    }

    const { email } = req.query;
    if (!email) return res.status(400).json({ error: "Email обязателен" });

    const orders = await (await getOrdersCollection())
      .find({ "customer.email": email })
      .sort({ createdAt: -1 })
      .toArray();

    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Ошибка получения заказов" });
  }
});

// --- User Profile ---
// Получить объявления пользователя
app.get("/api/user/advertisements", authMiddleware, async (req, res) => {
  try {
    console.log('=== /api/user/advertisements GET REQUEST ===');
    console.log('User ID:', req.user?.id);

    if (!isDbConnected) {
      console.log('DB NOT CONNECTED');
      return res.status(503).json({ error: "Сервер БД недоступен" });
    }

    const productsCollection = await getProductsCollection();
    const filter = { sellerId: new ObjectId(req.user.id) };
    console.log('Filter:', filter);

    const products = await productsCollection
      .find(filter)
      .sort({ createdAt: -1 })
      .toArray();

    console.log('[API] Found advertisements:', products.length);
    res.json(products);
  } catch (err) {
    console.error('[ERROR]', err);
    res.status(500).json({ error: "Ошибка получения объявлений" });
  }
});

// Обновить объявление
app.put("/api/advertisements/:id", authMiddleware, async (req, res) => {
  try {
    if (!isDbConnected) {
      return res.status(503).json({ error: "Сервер БД недоступен" });
    }

    const { id } = req.params;
    const { title, description, price, category, image, images, address } = req.body;

    if (!ObjectId.isValid(id)) return res.status(400).json({ error: "Неверный ID" });
    if (!title || !price || !category) return res.status(400).json({ error: "Заполните обязательные поля" });

    const productsCollection = await getProductsCollection();
    const product = await productsCollection.findOne({ _id: new ObjectId(id) });

    if (!product) return res.status(404).json({ error: "Объявление не найдено" });
    if (product.sellerId.toString() !== req.user.id) {
      return res.status(403).json({ error: "У вас нет прав для редактирования этого объявления" });
    }

    const updated = {
      title,
      description: description || "",
      price: Number(price),
      category,
      address: address || "",
      image: image || (Array.isArray(images) && images[0]) || "",
      images: Array.isArray(images) ? images : image ? [image] : [],
      updatedAt: new Date()
    };

    await productsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updated }
    );

    res.json({ message: "Объявление обновлено", ...product, ...updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Ошибка обновления объявления" });
  }
});

// Удалить объявление
app.delete("/api/advertisements/:id", authMiddleware, async (req, res) => {
  try {
    if (!isDbConnected) {
      return res.status(503).json({ error: "Сервер БД недоступен" });
    }

    const { id } = req.params;
    if (!ObjectId.isValid(id)) return res.status(400).json({ error: "Неверный ID" });

    const productsCollection = await getProductsCollection();
    const product = await productsCollection.findOne({ _id: new ObjectId(id) });

    if (!product) return res.status(404).json({ error: "Объявление не найдено" });
    if (product.sellerId.toString() !== req.user.id) {
      return res.status(403).json({ error: "У вас нет прав для удаления этого объявления" });
    }

    await productsCollection.deleteOne({ _id: new ObjectId(id) });
    res.json({ message: "Объявление удалено" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Ошибка удаления объявления" });
  }
});

// Получить заказы пользователя
app.get("/api/user/orders", authMiddleware, async (req, res) => {
  try {
    console.log('=== /api/user/orders GET REQUEST ===');
    console.log('User ID:', req.user?.id);

    if (!isDbConnected) {
      console.log('DB NOT CONNECTED');
      return res.status(503).json({ error: "Сервер БД недоступен" });
    }

    const users = await getUsersCollection();
    const user = await users.findOne({ _id: new ObjectId(req.user.id) });

    if (!user) {
      console.log('User not found in collection');
      return res.status(404).json({ error: "Пользователь не найден" });
    }

    console.log('User found, email:', user.email);

    const orders = await (await getOrdersCollection())
      .find({ "customer.email": user.email })
      .sort({ createdAt: -1 })
      .toArray();

    console.log('[API] Found orders:', orders.length);
    res.json(orders);
  } catch (err) {
    console.error('[ERROR]', err);
    res.status(500).json({ error: "Ошибка получения заказов" });
  }
});

// --- Messages (Chat) ---
// Получить историю сообщений по объявлению между текущим пользователем и продавцом
app.get("/api/messages/:adId", authMiddleware, async (req, res) => {
  try {
    if (!isDbConnected) {
      return res.status(503).json({ error: "Сервер БД недоступен" });
    }

    const { adId } = req.params;
    const { sellerId } = req.query;
    if (!adId || !sellerId) return res.status(400).json({ error: "adId и sellerId обязательны" });
    if (!ObjectId.isValid(adId) || !ObjectId.isValid(sellerId)) {
      return res.status(400).json({ error: "Неверный ID" });
    }

    const userId = req.user.id;
    const messagesCollection = await getMessagesCollection();

    const messages = await messagesCollection
      .find({
        adId: new ObjectId(adId),
        $or: [
          { senderId: new ObjectId(userId), receiverId: new ObjectId(sellerId) },
          { senderId: new ObjectId(sellerId), receiverId: new ObjectId(userId) }
        ]
      })
      .sort({ createdAt: 1 })
      .toArray();

    res.json(messages);
  } catch (err) {
    console.error("[MESSAGES GET ERROR]", err);
    res.status(500).json({ error: "Ошибка получения сообщений" });
  }
});

// Отправить сообщение
app.post("/api/messages", authMiddleware, async (req, res) => {
  try {
    if (!isDbConnected) {
      return res.status(503).json({ error: "Сервер БД недоступен" });
    }

    const { adId, sellerId, text } = req.body;
    if (!adId || !sellerId || !text || !text.trim()) {
      return res.status(400).json({ error: "adId, sellerId и text обязательны" });
    }
    if (!ObjectId.isValid(adId) || !ObjectId.isValid(sellerId)) {
      return res.status(400).json({ error: "Неверный ID" });
    }

    const message = {
      adId: new ObjectId(adId),
      senderId: new ObjectId(req.user.id),
      receiverId: new ObjectId(sellerId),
      text: text.trim(),
      createdAt: new Date()
    };

    const messagesCollection = await getMessagesCollection();
    const result = await messagesCollection.insertOne(message);

    res.status(201).json({ _id: result.insertedId, ...message });
  } catch (err) {
    console.error("[MESSAGES POST ERROR]", err);
    res.status(500).json({ error: "Ошибка отправки сообщения" });
  }
});

// Получить все диалоги текущего пользователя (сгруппированные по объявлению + собеседник)
app.get("/api/conversations", authMiddleware, async (req, res) => {
  try {
    if (!isDbConnected) {
      return res.status(503).json({ error: "Сервер БД недоступен" });
    }

    const userId = new ObjectId(req.user.id);
    const messagesCollection = await getMessagesCollection();

    // Получаем все сообщения где пользователь участник
    const allMessages = await messagesCollection
      .find({
        $or: [{ senderId: userId }, { receiverId: userId }]
      })
      .sort({ createdAt: -1 })
      .toArray();

    // Группируем по adId + собеседник
    const convMap = {};
    for (const msg of allMessages) {
      const otherId = msg.senderId.toString() === req.user.id
        ? msg.receiverId.toString()
        : msg.senderId.toString();
      const key = `${msg.adId.toString()}_${otherId}`;

      if (!convMap[key]) {
        convMap[key] = {
          adId: msg.adId.toString(),
          otherUserId: otherId,
          lastMessage: msg.text,
          lastMessageAt: msg.createdAt,
          messageCount: 0
        };
      }
      convMap[key].messageCount++;
    }

    const conversations = Object.values(convMap);

    // Обогащаем данными: название объявления + имя собеседника
    const productsCollection = await getProductsCollection();
    const usersCollection = await getUsersCollection();

    for (const conv of conversations) {
      try {
        const product = await productsCollection.findOne({ _id: new ObjectId(conv.adId) });
        conv.adTitle = product ? (product.title || "Объявление") : "Удалённое объявление";
        conv.adImage = product ? (product.image || (product.images && product.images[0]) || "") : "";
      } catch {
        conv.adTitle = "Объявление";
        conv.adImage = "";
      }
      try {
        const otherUser = await usersCollection.findOne({ _id: new ObjectId(conv.otherUserId) });
        conv.otherUserName = otherUser ? otherUser.name : "Пользователь";
      } catch {
        conv.otherUserName = "Пользователь";
      }
    }

    // Сортируем по последнему сообщению
    conversations.sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt));

    res.json(conversations);
  } catch (err) {
    console.error("[CONVERSATIONS ERROR]", err);
    res.status(500).json({ error: "Ошибка получения диалогов" });
  }
});

// Если запрос пошёл на /api/*, но не попал ни в один роут — вернуть JSON 404 вместо index.html
app.use('/api', (req, res) => {
  console.log('[404] Route not found:', req.method, req.path);
  res.status(404).json({ error: 'API route not found: ' + req.method + ' ' + req.path })
})

// ===== Serve Frontend (после всех API роутов) =====
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.resolve(__dirname, "../dist")));
app.get(/.*/, (req, res) => {
  res.sendFile(path.resolve(__dirname, "../dist/index.html"));
});

// ===== Start Server =====
app.listen(port, () => {
  console.log("\n╔════════════════════════════════════════╗");
  console.log("║    🚀 СЕРВЕР УСПЕШНО ЗАПУЩЕН          ║");
  console.log("╚════════════════════════════════════════╝");
  console.log(`📍 URL:           http://localhost:${port}`);
  console.log(`🗄️  MongoDB:       ${isDbConnected ? "✅ ПОДКЛЮЧЕНА" : "❌ ОТКЛЮЧЕНА"}`);
  console.log(`🔐 JWT_SECRET:    ${JWT_SECRET === "dev_secret" ? "⚠️  ИСПОЛЬЗУЕТСЯ ДЕФОЛТ (СМЕНИТЕ!)" : "✅ УСТАНОВЛЕН"}`);
  console.log("╚════════════════════════════════════════╝\n");
});
