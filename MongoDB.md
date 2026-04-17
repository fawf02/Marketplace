Технологии
MongoDB — NoSQL база


🧠 Как это вообще работает (кратко)
Vue (frontend)
   ↓ HTTP (fetch / axios)
Node.js (backend / API)
   ↓
MongoDB (NoSQL база)


Vue 👉 НЕ общается с БД напрямую
Vue 👉 общается с API
API 👉 работает с MongoDB

🗂️ Технологии (рекомендую)

MongoDB — NoSQL база

Node.js + Express — сервер

Mongoose — удобная работа с MongoDB

Axios — запросы из Vue

🔥 ПЛАН ПО ШАГАМ
1️⃣ Создаём backend (отдельная папка)

В корне проекта:

mkdir backend
cd backend
npm init -y
npm install express mongoose cors dotenv
npm install nodemon --save-dev


Структура:

backend/
 ├─ models/
 │   └─ Product.js
 ├─ routes/
 │   └─ products.js
 ├─ index.js
 └─ .env

2️⃣ Подключение MongoDB

.env

PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/marketplace


index.js

import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import productRoutes from "./routes/products.js";

const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB подключена"))
  .catch(err => console.error(err));

app.use("/api/products", productRoutes);

app.listen(5000, () => {
  console.log("Server запущен на http://localhost:5000");
});

3️⃣ Модель NoSQL (пример: товары)

models/Product.js

import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema({
  title: String,
  price: Number,
  rating: Number,
  category: String,
  image: String,
}, { timestamps: true });

export default mongoose.model("Product", ProductSchema);

4️⃣ API маршруты

routes/products.js

import express from "express";
import Product from "../models/Product.js";

const router = express.Router();

// получить все товары
router.get("/", async (req, res) => {
  const products = await Product.find();
  res.json(products);
});

// добавить товар
router.post("/", async (req, res) => {
  const product = new Product(req.body);
  await product.save();
  res.json(product);
});

export default router;

5️⃣ Подключение Vue к API

Установи axios:

npm install axios


src/services/api.js

import axios from "axios";

export default axios.create({
  baseURL: "http://localhost:5000/api",
});

6️⃣ Использование в CatalogView.vue
<script setup>
import { ref, onMounted } from "vue";
import api from "../services/api";

const products = ref([]);

onMounted(async () => {
  const res = await api.get("/products");
  products.value = res.data;
});
</script>

<template>
  <div>
    <div v-for="p in products" :key="p._id">
      <h3>{{ p.title }}</h3>
      <p>{{ p.price }} ₸</p>
    </div>
  </div>
</template>