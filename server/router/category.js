const express = require("express");
const db = require("../lib/db");

const router = express.Router();

// 카테고리 추가
router.post("/add", (req, res) => {
  const { code_name, description } = req.body;

  if (!code_name) {
    return res.status(400).json({ message: "코드 이름을 입력하세요." });
  }

  db.query(
    "INSERT INTO CODE (code_name, description) VALUES (?, ?)",
    [code_name, description],
    (err) => {
      if (err) {
        console.error("카테고리 추가 실패:", err);
        return res
          .status(500)
          .json({ message: "서버 오류. 다시 시도해주세요." });
      }
      res.status(200).json({ message: "카테고리 추가 성공" });
    }
  );
});

// 카테고리 조회
router.get("/list", (req, res) => {
  db.query("SELECT * FROM CODE", (err, results) => {
    if (err) {
      console.error("카테고리 조회 실패:", err);
      return res.status(500).json({ message: "서버 오류. 다시 시도해주세요." });
    }
    res.status(200).json(results);
  });
});

// 카테고리 수정
router.put("/update/:id", (req, res) => {
  const { id } = req.params;
  const { code_name, description } = req.body;

  db.query(
    "UPDATE CODE SET code_name = ?, description = ? WHERE code_id = ?",
    [code_name, description, id],
    (err) => {
      if (err) {
        console.error("카테고리 수정 실패:", err);
        return res
          .status(500)
          .json({ message: "서버 오류. 다시 시도해주세요." });
      }
      res.status(200).json({ message: "카테고리 수정 성공" });
    }
  );
});

// 카테고리 삭제
router.delete("/delete/:id", (req, res) => {
  const { id } = req.params;

  db.query("DELETE FROM CODE WHERE code_id = ?", [id], (err) => {
    if (err) {
      console.error("카테고리 삭제 실패:", err);
      return res.status(500).json({ message: "서버 오류. 다시 시도해주세요." });
    }
    res.status(200).json({ message: "카테고리 삭제 성공" });
  });
});

module.exports = router;
