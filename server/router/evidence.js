const express = require("express");
const multer = require("multer");
const path = require("path");
const db = require("../lib/db");

const router = express.Router();

// 파일 업로드 설정
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../uploads"));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage });

// 증빙자료 제출 API
router.post("/upload", upload.single("file"), (req, res) => {
  const { description } = req.body;
  const email = req.session.user?.email;
  const username = req.session.user?.username;

  if (!email || !username) {
    return res.status(401).json({ message: "로그인이 필요합니다." });
  }

  if (!req.file) {
    return res.status(400).json({ message: "파일이 첨부되지 않았습니다." });
  }

  const query = `
    INSERT INTO evidence (user, email, description, file, createdAt, status)
    VALUES (?, ?, ?, ?, NOW(), '대기')
  `;
  db.query(query, [username, email, description, req.file.filename], (err, result) => {
    if (err) {
      console.error("증빙자료 저장 오류:", err);
      return res.status(500).json({ message: "증빙자료 저장에 실패했습니다." });
    }
    res.status(200).json({ message: "증빙자료가 성공적으로 제출되었습니다." });
  });
});

// 사용자별 증빙자료 조회 API
router.get("/user", (req, res) => {
  const email = req.session.user?.email;

  if (!email) {
    return res.status(401).json({ message: "로그인이 필요합니다." });
  }

  const query = "SELECT * FROM evidence WHERE email = ?";
  db.query(query, [email], (err, results) => {
    if (err) {
      console.error("증빙자료 조회 오류:", err);
      return res.status(500).json({ message: "증빙자료를 불러오는데 실패했습니다." });
    }
    res.status(200).json(results);
  });
});

// 모든 증빙자료 조회 API (관리자용)
router.get("/all", (req, res) => {
  const query = "SELECT * FROM evidence";
  db.query(query, (err, results) => {
    if (err) {
      console.error("모든 증빙자료 조회 오류:", err);
      return res.status(500).json({ message: "증빙자료를 불러오는데 실패했습니다." });
    }
    res.status(200).json(results);
  });
});

// 증빙자료 승인 API
router.put("/approve/:id", (req, res) => {
  const { id } = req.params;
  const { category, reduction_rate_range } = req.body;

  // 해당 카테고리와 감축률에 대한 포인트 조회
  const pointsQuery = `
    SELECT points 
    FROM reduction_points 
    WHERE category = ? AND reduction_rate_range = ?
  `;

  const updateStatusQuery = "UPDATE evidence SET status = '승인', category = ?, reduction_rate_range = ? WHERE id = ?";
  const updateMileageQuery = `
    UPDATE users 
    SET mileage = mileage + ? 
    WHERE email = (SELECT email FROM evidence WHERE id = ?)
  `;

  // 포인트 조회 후, DB 업데이트
  db.query(pointsQuery, [category, reduction_rate_range], (err, pointsResult) => {
    if (err) {
      console.error("포인트 조회 오류:", err);
      return res.status(500).json({ message: "포인트 조회에 실패했습니다." });
    }

    if (pointsResult.length === 0) {
      return res.status(400).json({ message: "해당 카테고리와 감축률에 대한 포인트 정보를 찾을 수 없습니다." });
    }

    const points = pointsResult[0].points;

    // 증빙자료 승인 후 카테고리, 감축률 정보 업데이트
    db.query(updateStatusQuery, [category, reduction_rate_range, id], (err) => {
      if (err) {
        console.error("증빙자료 승인 오류:", err);
        return res.status(500).json({ message: "증빙자료 승인에 실패했습니다." });
      }

      // 사용자의 마일리지 업데이트
      db.query(updateMileageQuery, [points, id], (err) => {
        if (err) {
          console.error("마일리지 업데이트 오류:", err);
          return res.status(500).json({ message: "마일리지 업데이트에 실패했습니다." });
        }

        res.status(200).json({
          message: `증빙자료가 승인되었으며, ${points} 포인트가 지급되었습니다.`,
        });
      });
    });
  });
});


// 증빙자료 삭제 API
router.delete("/delete/:id", (req, res) => {
  const { id } = req.params;

  const query = "DELETE FROM evidence WHERE id = ?";
  db.query(query, [id], (err, result) => {
    if (err) {
      console.error("증빙자료 삭제 오류:", err);
      return res.status(500).json({ message: "증빙자료 삭제에 실패했습니다." });
    }
    res.status(200).json({ message: "증빙자료가 삭제되었습니다." });
  });
});


module.exports = router;
