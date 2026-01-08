const express = require("express");
const db = require("../lib/db");

const router = express.Router();

// 모든 감축률 데이터 조회
router.get("/", (req, res) => {
  const query = "SELECT * FROM reduction_points";

  db.query(query, (err, results) => {
    if (err) {
      console.error("감축률 데이터 조회 오류:", err);
      return res.status(500).json({ message: "감축률 데이터를 불러오는데 실패했습니다." });
    }
    res.status(200).json(results);
  });
});

// 감축률 데이터 수정 API
router.put("/:id", (req, res) => {
  const { id } = req.params;
  const { category, reduction_rate_range, points } = req.body;

  if (!category || !reduction_rate_range || points == null) {
    return res.status(400).json({ message: "모든 필드를 입력해주세요." });
  }

  const query = `
    UPDATE reduction_points
    SET category = ?, reduction_rate_range = ?, points = ?
    WHERE id = ?
  `;

  db.query(query, [category, reduction_rate_range, points, id], (err, result) => {
    if (err) {
      console.error("감축률 데이터 수정 오류:", err);
      return res.status(500).json({ message: "감축률 데이터를 수정하는 데 실패했습니다." });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "해당 데이터가 존재하지 않습니다." });
    }

    res.status(200).json({ message: "감축률 데이터가 수정되었습니다." });
  });
});

module.exports = router;
