const express = require("express");
const router = express.Router();
const db = require("../lib/db");
const multer = require("multer");
const path = require("path");

// 파일 업로드를 위한 multer 설정
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../uploads/"));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

// 게색 라우터를 일반 게시글 목록 라우터보다 위에 배치
router.get("/posts/search", (req, res) => {
  const { option, query } = req.query;
  let sqlQuery = "SELECT p.*, p.writer_name as writer FROM posts p";
  let values = [];

  if (query && query.trim() !== "") {
    const searchPattern = `%${query}%`;
    switch (option) {
      case "title":
        sqlQuery += " WHERE p.title LIKE ?";
        values = [searchPattern];
        break;
      case "content":
        sqlQuery += " WHERE p.content LIKE ?";
        values = [searchPattern];
        break;
      case "all":
      default:
        sqlQuery += " WHERE p.title LIKE ? OR p.content LIKE ?";
        values = [searchPattern, searchPattern];
    }
  }

  sqlQuery += " ORDER BY p.id DESC";

  console.log("SQL Query:", sqlQuery); // 쿼리 확인용 로그
  console.log("Values:", values); // 값 확인용 로그

  db.query(sqlQuery, values, (error, results) => {
    if (error) {
      console.error("Error searching posts:", error);
      return res.status(500).json({ error: "서버 오류가 발생했습니다." });
    }
    res.json(results);
  });
});

// 일반 게시글 목록 라우터
router.get("/posts", (req, res) => {
  const query = `
    SELECT 
      p.id,
      p.title,
      p.content,
      p.writer_name,
      p.secret,
      DATE_FORMAT(p.date, '%Y-%m-%d') as date
    FROM posts p 
    ORDER BY p.id DESC
  `;

  db.query(query, (error, results) => {
    if (error) {
      console.error("Error fetching posts:", error);
      return res.status(500).json({ error: "서버 오류가 발생했습니다." });
    }
    res.json(results);
  });
});

// 게시글 상세 조회
router.get("/posts/:id", (req, res) => {
  console.log("Fetching post with id:", req.params.id);

  db.query(
    "SELECT * FROM posts WHERE id = ?",
    [req.params.id],
    (error, results) => {
      if (error) {
        console.error("Database error:", error);
        return res.status(500).json({ error: "서버 오류가 발생했습니다." });
      }

      console.log("Query results:", results);

      if (results.length === 0) {
        return res.status(404).json({ error: "게시글을 찾을 수 없습니다." });
      }

      res.json(results[0]);
    }
  );
});

// 게시글 작성
router.post("/posts/write", upload.single("file"), (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({
      error: "로그인이 필요합니다.",
    });
  }

  const { title, content, password, secret } = req.body;
  const writer = req.session.user.email;

  // users 테이블에서 username 가져오기
  db.query(
    "SELECT username FROM users WHERE email = ?",
    [writer],
    (error, results) => {
      if (error) {
        console.error("Error fetching username:", error);
        return res.status(500).json({ error: "서버 오류가 발생했습니다." });
      }

      const writer_name = results[0].username;

      if (!title || !content || !password) {
        return res.status(400).json({
          error: "필수 필드가 누락되었습니다.",
        });
      }

      const query = `
      INSERT INTO posts 
      (title, content, writer, writer_name, password, secret, image_name, image_dir, date) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `;

      const values = [
        title,
        content,
        writer,
        writer_name,
        password,
        secret === "true" ? 1 : 0,
        req.file?.filename || null,
        req.file ? "/uploads/" : null,
      ];

      console.log("Query values:", values);

      db.query(query, values, (error, result) => {
        if (error) {
          console.error("Server Error:", error);
          return res.status(500).json({
            error: "게시글 작성에 실패했습니다.",
            details: error.message,
          });
        }

        res.status(200).json({
          success: true,
          message: "게시글이 성공적으로 작성되었습니다.",
        });
      });
    }
  );
});

// 게시글 수정
router.post("/posts/modify/:id", upload.single("file"), (req, res) => {
  const { id } = req.params;
  const { title, content, password, secret } = req.body;

  // 세션 체크
  if (!req.session.user) {
    return res.status(401).json({
      error: "로그인이 필요합니다.",
    });
  }

  // 게시글 작성자 또는 관리자 확인
  db.query("SELECT * FROM posts WHERE id = ?", [id], (error, results) => {
    if (error) {
      console.error("Error fetching post:", error);
      return res.status(500).json({ error: "서버 오류가 발생했습니다." });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: "게시글을 찾을 수 없습니다." });
    }

    const post = results[0];
    // 세션의 이메일과 게시글 작성자 비교
    if (post.writer !== req.session.user.email && !req.session.user.isAdmin) {
      return res.status(403).json({ error: "권한이 없습니다." });
    }

    // 관리자인 경우 비밀번호 체크 건너뛰기
    if (!req.session.user.isAdmin && post.password !== password) {
      return res.status(401).json({ error: "비밀번호가 일치하지 않습니다." });
    }

    let query = "UPDATE posts SET title = ?, content = ?, secret = ?";
    let values = [title, content, secret === "true" ? 1 : 0];

    if (req.file) {
      query += ", image_name = ?, image_dir = ?";
      values.push(req.file.filename, "/uploads/");
    }

    query += " WHERE id = ?";
    values.push(id);

    db.query(query, values, (updateError, result) => {
      if (updateError) {
        console.error("Error updating post:", updateError);
        return res.status(500).json({ error: "게시글 수정에 실패했습니다." });
      }
      res.json({ success: true, message: "게시글이 수정되   습니다." });
    });
  });
});

// 게시글 삭제
router.post("/posts/delete/:id", (req, res) => {
  const { id } = req.params;
  const { password } = req.body;

  // 세션 체크
  if (!req.session.user) {
    return res.status(401).json({
      error: "로그인이 필요합니다.",
    });
  }

  // 게시글 작성자 또는 관리자 확인
  db.query("SELECT * FROM posts WHERE id = ?", [id], (error, results) => {
    if (error) {
      console.error("Error fetching post:", error);
      return res.status(500).json({ error: "서버 오류가 발생했습니다." });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: "게시글을 찾을 수 없습니다." });
    }

    const post = results[0];

    // 관리자가 아닌 경우에만 비밀번호 확인
    if (!req.session.user.isAdmin) {
      // 비밀번호 확인
      if (post.password !== password) {
        return res.status(401).json({ error: "비밀번호가 일치하지 않습니다." });
      }

      // 작성자 확인
      if (post.writer !== req.session.user.email) {
        return res.status(403).json({ error: "권한이 없습니다." });
      }
    }

    db.query("DELETE FROM posts WHERE id = ?", [id], (deleteError) => {
      if (deleteError) {
        console.error("Error deleting post:", deleteError);
        return res.status(500).json({ error: "게시글 삭제에 실패했습니다." });
      }
      res.json({ success: true, message: "게시글이 삭제되었습니다." });
    });
  });
});

// 비밀번호 확인
router.post("/posts/checkpw/:id", (req, res) => {
  const { id } = req.params;
  const { password } = req.body;

  db.query(
    "SELECT * FROM posts WHERE id = ? AND password = ?",
    [id, password],
    (error, results) => {
      if (error) {
        console.error("Error checking password:", error);
        return res.status(500).json({ error: "서버 오류가 발생했습니다." });
      }

      if (results.length > 0) {
        res.json({ success: true });
      } else {
        res.status(401).json({ error: "비밀번호가 일치하지 않습니다." });
      }
    }
  );
});

// DELETE 메서드 수정
router.delete("/posts/:id", (req, res) => {
  const { id } = req.params;

  console.log("Delete request received for post:", id);
  console.log("Session user:", req.session.user);

  // 세션 체크
  if (!req.session.user) {
    return res.status(401).json({
      error: "로그인이 필요합니다.",
    });
  }

  // 게시글 작성자 또는 관리자 확인
  db.query("SELECT * FROM posts WHERE id = ?", [id], (error, results) => {
    if (error) {
      console.error("Error fetching post:", error);
      return res.status(500).json({ error: "서버 오류가 발생했습니다." });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: "게시글을 찾을 수 없습니다." });
    }

    const post = results[0];
    // 세션의 이메일과 게시글 작성자 비교
    if (post.writer !== req.session.user.email && !req.session.user.isAdmin) {
      return res.status(403).json({ error: "권한이 없습니다." });
    }

    db.query("DELETE FROM posts WHERE id = ?", [id], (deleteError) => {
      if (deleteError) {
        console.error("Error deleting post:", deleteError);
        return res.status(500).json({ error: "게시글 삭제에 실패했습니다." });
      }
      res.json({ success: true, message: "게시글이 삭제되었습니다." });
    });
  });
});

module.exports = router;
