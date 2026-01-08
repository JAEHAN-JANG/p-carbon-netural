const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const db = require("../lib/db");

const router = express.Router();

// Multer 설정 (이미지 업로드 경로와 파일 이름 처리)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../uploads")); // 업로드 경로
  },
  filename: (req, file, cb) => {
    const sanitizedFilename = file.originalname.replace(
      /[^a-zA-Z0-9가-힣.]/g,
      "_"
    ); // 특수문자 제거
    const timestamp = Date.now(); // 타임스탬프 추가
    cb(null, `${timestamp}-${sanitizedFilename}`); // 최종 파일 이름
  },
});

const upload = multer({ storage });

// 이미지 삭제 함수
function deleteImage(filename) {
  const filePath = path.join(__dirname, "../uploads", filename);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
}

// 상품 추가
router.post("/add", upload.single("image"), (req, res) => {
  const { product_name, description, price, stock, code_id } = req.body;
  const image = req.file ? req.file.filename : null;

  if (!product_name || !price || !stock || !code_id || !image) {
    // 업로드된 이미지 삭제
    if (image) deleteImage(image);
    return res.status(400).json({ message: "모든 필드를 입력하세요." });
  }

  db.query(
    "INSERT INTO PRODUCT (product_name, description, price, stock, code_id, image) VALUES (?, ?, ?, ?, ?, ?)",
    [
      product_name,
      description,
      parseInt(price),
      parseInt(stock),
      code_id,
      image,
    ],
    (err) => {
      if (err) {
        // 업로드된 이미지 삭제
        if (image) deleteImage(image);
        console.error("상품 추가 실패:", err);
        return res
          .status(500)
          .json({ message: "서버 오류. 다시 시도해주세요." });
      }
      res.status(200).json({ message: "상품 추가 성공" });
    }
  );
});

// 상품 조회
router.get("/list", (req, res) => {
  db.query(
    "SELECT p.*, c.code_name FROM PRODUCT p JOIN CODE c ON p.code_id = c.code_id",
    (err, results) => {
      if (err) {
        console.error("상품 조회 실패:", err);
        return res
          .status(500)
          .json({ message: "서버 오류. 다시 시도해주세요." });
      }
      res.status(200).json(results);
    }
  );
});

// 상품 수정
router.put("/update/:id", upload.single("image"), (req, res) => {
  const { id } = req.params;
  const { product_name, description, price, stock, code_id } = req.body;
  const image = req.file ? req.file.filename : null;

  // 기존 이미지 조회
  db.query(
    "SELECT image FROM PRODUCT WHERE product_id = ?",
    [id],
    (err, results) => {
      if (err) {
        if (image) deleteImage(image); // 새 이미지 삭제
        console.error("기존 이미지 조회 실패:", err);
        return res
          .status(500)
          .json({ message: "서버 오류. 다시 시도해주세요." });
      }

      const oldImage = results[0]?.image;

      db.query(
        "UPDATE PRODUCT SET product_name = ?, description = ?, price = ?, stock = ?, code_id = ?, image = ? WHERE product_id = ?",
        [
          product_name,
          description,
          parseInt(price),
          parseInt(stock),
          code_id,
          image || oldImage,
          id,
        ],
        (err) => {
          if (err) {
            if (image) deleteImage(image); // 새 이미지 삭제
            console.error("상품 수정 실패:", err);
            return res
              .status(500)
              .json({ message: "서버 오류. 다시 시도해주세요." });
          }

          // 기존 이미지 삭제 (새 이미지가 업로드된 경우)
          if (image && oldImage) {
            deleteImage(oldImage);
          }

          res.status(200).json({ message: "상품 수정 성공" });
        }
      );
    }
  );
});

// 상품 삭제
router.delete("/delete/:id", (req, res) => {
  const { id } = req.params;

  // 기존 이미지 조회
  db.query(
    "SELECT image FROM PRODUCT WHERE product_id = ?",
    [id],
    (err, results) => {
      if (err) {
        console.error("기존 이미지 조회 실패:", err);
        return res
          .status(500)
          .json({ message: "서버 오류. 다시 시도해주세요." });
      }

      const image = results[0]?.image;

      db.query("DELETE FROM PRODUCT WHERE product_id = ?", [id], (err) => {
        if (err) {
          console.error("상품 삭제 실패:", err);
          return res
            .status(500)
            .json({ message: "서버 오류. 다시 시도해주세요." });
        }

        // 기존 이미지 삭제
        if (image) {
          deleteImage(image);
        }

        res.status(200).json({ message: "상품 삭제 성공" });
      });
    }
  );
});

module.exports = router;
