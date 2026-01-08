const express = require("express");
const cors = require("cors");
const session = require("express-session");
const path = require("path");
const multer = require("multer");
require("dotenv").config();
const fs = require("fs");
const axios = require("axios");

const app = express();
const PORT = 5000;

// OpenWeatherMap API 키 설정
const API_KEY = "1034b2f3c15c7889f413fbc5bd6e73b5";

// uploads 디렉토리 생성 확인
const uploadDir = path.join(__dirname, "upload");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// 파일 업로드를 위한 multer 설정
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "upload/"));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

// 세션 설정
app.use(
  session({
    secret: "your-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 1000 * 60 * 60 * 24 * 5,
    },
  })
);

// CORS 설정
const corsOptions = {
  origin: "http://localhost:3000",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Accept",
  ],
  exposedHeaders: ["Content-Range", "X-Content-Range"],
  maxAge: 3600,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// OpenWeatherMap API를 사용하여 날씨 데이터 가져오는 라우터 추가
app.get("/weather", async (req, res) => {
  const { city } = req.query;
  try {
    const response = await axios.get(
      `http://api.openweathermap.org/data/2.5/weather`,
      {
        params: {
          q: city,
          appid: API_KEY,
          units: "metric",
        },
      }
    );
    res.json(response.data);
  } catch (error) {
    console.error("Error fetching weather data:", error);
    res.status(500).send("Error fetching weather data");
  }
});

// 기존의 라우터 설정들
const authRouter = require("./router/auth");
const categoryRouter = require("./router/category");
const productRouter = require("./router/product");
const trackRouter = require("./router/track");
const communityRouter = require("./router/communitys");
const purchaseRouter = require("./router/purchase");
const userManageRouter = require("./router/manageClients");
const chatRouter = require("./router/chat");
const evidenceRouter = require("./router/evidence");
const reductionPointsRouter = require("./router/reductionPointsRouter");

app.use("/userManage", userManageRouter);
app.use("/purchase", purchaseRouter);
app.use("/auth", authRouter);
app.use("/category", categoryRouter);
app.use("/product", productRouter);
app.use("/track", trackRouter);
app.use("/api/community", communityRouter);
app.use("/chat", chatRouter);
app.use("/api/evidence", evidenceRouter);
app.use("/api/reduction-points", reductionPointsRouter);

// 서버 실행
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
