const express = require("express");
const db = require("../lib/db");
const { hashPassword, comparePassword } = require("../lib/bcrypt");
const { createToken } = require("../lib/jwt");

const router = express.Router();

// 회원가입 처리
router.post("/signup", async (req, res) => {
  const { email, username, birth, tel, password } = req.body;

  console.log("Received data:", req.body); // 요청 데이터 확인

  if (!email || !username || !birth || !tel || !password) {
    return res.status(400).json({ message: "모든 필드를 입력하세요." });
  }

  // 이메일 중복 확인
  db.query(
    "SELECT * FROM users WHERE email = ?",
    [email],
    async (err, results) => {
      if (err) {
        return res
          .status(500)
          .json({ message: "서버 오류. 다시 시도해주세요." });
      }

      if (results.length > 0) {
        return res.status(400).json({ message: "이미 등록된 이메일입니다." });
      }

      // 비밀번호 해싱
      const hashedPassword = await hashPassword(password);

      // 사용자 정보 저장
      db.query(
        "INSERT INTO users (email, username, birth, tel, password, class, mileage) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [email, username, birth, tel, hashedPassword, "MBR", "0"],
        (err) => {
          if (err) {
            return res
              .status(500)
              .json({ message: "서버 오류. 다시 시도해주세요." });
          }
          res.status(200).json({ message: "회원가입 성공" });
        }
      );
    }
  );
});

// 로그인 처리
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  console.log("로그인 시도:", email);

  db.query(
    "SELECT * FROM users WHERE email = ?",
    [email],
    async (err, results) => {
      if (err) {
        console.error("DB 에러:", err);
        return res
          .status(500)
          .json({ message: "서버 오류. 다시 시도해주세요." });
      }

      if (results.length === 0) {
        return res
          .status(400)
          .json({ message: "이메일 또는 비밀번호가 잘못되었습니다." });
      }

      const user = results[0];
      const isMatch = await comparePassword(password, user.password);

      if (!isMatch) {
        return res
          .status(400)
          .json({ message: "이메일 또는 비밀번호가 잘못되었습니다." });
      }

      // 세션에 사용자 정보 저장
      req.session.user = {
        id: user.id,
        email: user.email,
        username: user.username,
        tel: user.tel,
        birth: user.birth,
        class: user.class,
        mileage: user.mileage,
        isAdmin: user.class === "MNG",
      };

      console.log("세션에 저장된 사용자 정보:", req.session.user);

      await new Promise((resolve, reject) => {
        req.session.save((err) => {
          if (err) {
            console.error("세션 저장 실패:", err);
            reject(err);
          }
          console.log("세션 저장 성공!");
          resolve();
        });
      });

      res.status(200).json({
        message: "로그인 성공",
        user: {
          email: user.email,
          username: user.username,
          class: user.class,
          isAdmin: user.class === "MNG",
        },
      });
    }
  );
});

// 세션 확인 라우트 수정
router.get("/check-session", (req, res) => {
  if (req.session && req.session.user) {
    res.json({
      loggedIn: true,
      user: {
        birth: req.session.user.birth,
        tel: req.session.user.tel,
        mileage: req.session.user.mileage,
        username: req.session.user.username,
        email: req.session.user.email,
        class: req.session.user.class,
        isAdmin: req.session.user.class === "MNG",
      },
    });
  } else {
    res.json({
      loggedIn: false,
    });
  }
});

// 로그아웃 라우트
router.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "로그아웃 처리 중 오류가 발생했습니다." });
    }
    res.clearCookie("connect.sid");
    res.status(200).json({ message: "로그아웃 성공" });
  });
});

// 세션 미들웨어 추가 (보호된 라우트용)
const requireAuth = (req, res, next) => {
  if (!req.session.user) {
    return res.status(401).json({ message: "로그인이 필요합니다." });
  }
  next();
};

// 세션 데이터 확인용 새로운 라우트 추가
router.get("/session-check", (req, res) => {
  if (req.session.user) {
    console.log("현재 세션 데이터:", {
      email: req.session.user.email,
      username: req.session.user.username,
      class: req.session.user.class,
      isAdmin: req.session.user.isAdmin,
    });

    res.status(200).json({
      message: "세션 데이터 확인",
      sessionData: req.session.user,
    });
  } else {
    res.status(404).json({
      message: "세션 데이터가 없습니다",
    });
  }
});

// 사용자 정보 수정
router.put("/update-user", async (req, res) => {
  const userEmail = req.session.user?.email; // 로그인한 사용자 이메일 가져오기
  if (!userEmail) {
    return res.status(401).json({ message: "로그인 상태가 아닙니다." });
  }

  const { username, birth, tel, password } = req.body; // 클라이언트에서 받은 수정 데이터
  if (!username || !birth || !tel || !password) {
    return res.status(400).json({ message: "필수 필드가 누락되었습니다." });
  }

  const hashedPassword = await hashPassword(password); // 비밀번호 해싱

  db.query(
    "UPDATE users SET username = ?, birth = ?, tel = ?, password = ? WHERE email = ?",
    [username, birth, tel, hashedPassword, userEmail],
    (err, result) => {
      if (err) {
        return res
          .status(500)
          .json({ message: "서버 오류로 수정에 실패했습니다." });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "사용자를 찾을 수 없습니다." });
      }
      res
        .status(200)
        .json({ message: "회원 정보가 성공적으로 수정되었습니다." });
    }
  );
});

// 회원탈퇴 처리
router.delete("/delete-user", (req, res) => {
  if (!req.session.user) {
    console.error("세션 정보가 없습니다. 로그인 후 이용 가능합니다."); // 로그 추가
    return res.status(401).json({ message: "로그인 후 이용 가능합니다." });
  }

  const email = req.session.user.email;

  console.log("회원탈퇴 요청 - 이메일:", email);

  db.query("DELETE FROM users WHERE email = ?", [email], (err, results) => {
    if (err) {
      console.error("회원탈퇴 쿼리 오류:", err); // 구체적인 오류 로그 추가
      return res
        .status(500)
        .json({ message: "회원탈퇴 중 오류가 발생했습니다." });
    }

    if (results.affectedRows === 0) {
      console.warn("회원탈퇴 실패 - 해당 사용자가 존재하지 않습니다."); // 경고 로그 추가
      return res
        .status(400)
        .json({ message: "해당 사용자가 존재하지 않습니다." });
    }

    // 세션 종료
    req.session.destroy((err) => {
      if (err) {
        console.error("세션 종료 오류:", err); // 구체적인 오류 로그 추가
        return res
          .status(500)
          .json({ message: "로그아웃 처리 중 오류가 발생했습니다." });
      }
      console.log("세션 종료 성공 - 회원탈퇴 완료");
      res.clearCookie("connect.sid");
      res.status(200).json({ message: "회원탈퇴가 완료되었습니다." });
    });
  });
});

module.exports = router;
