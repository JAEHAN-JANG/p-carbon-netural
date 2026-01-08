const express = require("express");
const db = require("../lib/db");
const bcrypt = require("bcryptjs");

const router = express.Router();

// 사용자 목록 가져오기 (GET)
router.get("/", (req, res) => {
  const query = "SELECT email, username, birth, tel, class, mileage FROM users";
  db.query(query, (err, results) => {
    if (err) {
      res
        .status(500)
        .json({ message: "사용자 목록을 가져오는 데 실패했습니다." });
    } else {
      res.json(results);
    }
  });
});

// 사용자 추가하기 (POST)
router.post("/", async (req, res) => {
  const {
    email,
    username,
    birth,
    tel,
    password,
    class: userClass,
    mileage,
  } = req.body;

  try {
    // 비밀번호 암호화
    const hashedPassword = await bcrypt.hash(password, 10);

    const query = `
        INSERT INTO users (email, username, birth, tel, password, class, mileage)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;
    const values = [
      email,
      username,
      birth,
      tel,
      hashedPassword,
      userClass,
      mileage,
    ];

    db.query(query, values, (err) => {
      if (err) {
        console.error("Database error:", err); // 에러 로그 추가
        res
          .status(500)
          .json({ message: "사용자 추가 실패", error: err.message });
      } else {
        res.status(201).json({ message: "사용자 추가 성공" });
      }
    });
  } catch (err) {
    console.error("Hashing error:", err); // 해싱 에러 로그 추가
    res.status(500).json({ message: "비밀번호 해싱 실패", error: err.message });
  }
});

//사용자 정보 수정
router.put("/:email", (req, res) => {
  const { email } = req.params;
  const { username, birth, tel, class: userClass, mileage } = req.body;

  const query = `
      UPDATE users
      SET
        username = ?,
        birth = ?,
        tel = ?,
        class = ?,
        mileage = ?
      WHERE email = ?
    `;

  const values = [username, birth, tel, userClass, mileage, email];

  db.query(query, values, (err) => {
    if (err) {
      console.error("Database error:", err); // 에러 로그 추가
      res.status(500).json({ message: "사용자 수정 실패", error: err.message });
    } else {
      res.status(200).json({ message: "사용자 수정 성공" });
    }
  });
});

//사용자 삭제
router.delete("/:email", (req, res) => {
  const { email } = req.params;

  db.beginTransaction((err) => {
    if (err) {
      res
        .status(500)
        .json({ message: "트랜잭션 시작 오류", error: err.message });
      return;
    }

    //외래키 때문에 먼저 삭제해야함
    const deleteCarbonQuery =
      "DELETE FROM carbon_emissions WHERE user_email = ?";
    db.query(deleteCarbonQuery, [email], (err, result) => {
      if (err) {
        return db.rollback(() => {
          res.status(500).json({
            message: "carbon_emissions 삭제 실패",
            error: err.message,
          });
        });
      }

      const deleteUserQuery = "DELETE FROM users WHERE email = ?";
      db.query(deleteUserQuery, [email], (err, result) => {
        if (err) {
          return db.rollback(() => {
            res
              .status(500)
              .json({ message: "users 삭제 실패", error: err.message });
          });
        }

        db.commit((err) => {
          if (err) {
            return db.rollback(() => {
              res
                .status(500)
                .json({ message: "커밋 실패", error: err.message });
            });
          }
          res.status(200).json({ message: "사용자 및 관련 데이터 삭제 성공" });
        });
      });
    });
  });
});

// 예시: 서버에서 MNG인지 확인하고 페이지 접근 제어
router.get("/checkAdmin", (req, res) => {
  if (req.session.user && req.session.user.class === "MNG") {
    // 관리자인 경우
    res.send("관리자 전용 페이지입니다.");
  } else {
    // 관리자가 아닌 경우
    res.status(403).send("접근이 거부되었습니다.");
  }
});

// 이메일로 모든 데이터 조회하는 API
router.get("/user-emissions", (req, res) => {
  const { email } = req.query; // 클라이언트에서 이메일을 받아옴

  if (!email) {
    return res.status(400).json({ message: "이메일이 필요합니다." });
  }

  // 이메일로 데이터를 모두 가져오는 쿼리
  const query = `
    SELECT year, month, electricity, gas, water, fuel, waste, total_carbon, tree_loss
    FROM carbon_emissions
    WHERE user_email = ?`;

  db.query(query, [email], (err, results) => {
    if (err) {
      console.error("데이터 조회 오류", err);
      return res.status(500).json({ message: "서버 오류가 발생했습니다." });
    }

    // 이메일에 해당하는 모든 데이터 반환
    res.json({ emissions: results });
  });
});

router.post("/add-emission", (req, res) => {
  const {
    email,
    year,
    month,
    electricity,
    gas,
    water,
    fuel,
    waste,
    total_carbon,
    tree_loss,
  } = req.body;

  if (
    !email ||
    !year ||
    !month ||
    !electricity ||
    !gas ||
    !water ||
    !fuel ||
    !waste ||
    !total_carbon ||
    !tree_loss
  ) {
    return res.status(400).send({
      message: "모든 필드를 입력해야 합니다.",
    });
  }

  // MySQL 쿼리 작성 (INSERT INTO)
  const query = `
    INSERT INTO carbon_emissions (user_email, year, month, electricity, gas, water, fuel, waste, total_carbon, tree_loss)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
    email,
    year,
    month,
    electricity,
    gas,
    water,
    fuel,
    waste,
    total_carbon,
    tree_loss,
  ];

  // 데이터 삽입
  db.query(query, values, (err, results) => {
    if (err) {
      console.error("데이터베이스에 삽입 중 오류 발생:", err);
      return res.status(500).send({
        message: "서버 오류. 데이터를 저장할 수 없습니다.",
      });
    }

    // 성공적인 응답 반환
    res.status(201).send({
      message: "데이터가 성공적으로 저장되었습니다.",
      data: {
        id: results.insertId, // 새로 추가된 데이터의 ID
        email,
        year,
        month,
        electricity,
        gas,
        water,
        fuel,
        waste,
        total_carbon,
        tree_loss,
      },
    });
  });
});

router.delete("/delete-emissions/:email/:year/:month", (req, res) => {
  const { email, year, month } = req.params;
  console.log("삭제 요청 받은 값:", { email, year, month }); // 서버에서 값 확인
  const deleteEmissionQuery = `
    DELETE FROM carbon_emissions 
    WHERE user_email = ? AND year = ? AND month = ?
  `;

  db.query(deleteEmissionQuery, [email, year, month], (err, result) => {
    if (err) {
      console.error("배출 데이터 삭제 실패:", err);
      return res
        .status(500)
        .json({ message: "배출 데이터 삭제 실패", error: err.message });
    }

    res.status(200).json({ message: "배출 데이터 삭제 성공" });
  });
});

router.put("/update-emission", (req, res) => {
  console.log("수신 데이터:", req.body); // 여기서 데이터를 확인
  const {
    email,
    year,
    month,
    electricity,
    gas,
    water,
    fuel,
    waste,
    total_carbon,
    tree_loss,
  } = req.body;

  // 여기서도 각 변수 출력하여 타입이나 값 확인
  console.log("year:", year, "month:", month, "electricity:", electricity);

  const user_email = email;
  const sql = `UPDATE carbon_emissions SET year = ?, month = ?, electricity = ?, gas = ?, water = ?, fuel = ?, waste = ?, total_carbon = ?, tree_loss = ? WHERE user_email = ?`;
  const values = [
    year,
    month,
    electricity,
    gas,
    water,
    fuel,
    waste,
    total_carbon,
    tree_loss,
    user_email,
  ];

  console.log("SQL 실행 데이터:", values); // 실행될 SQL 데이터 점검

  db.query(sql, values, (error, results) => {
    if (error) {
      console.error("업데이트 중 오류 발생:", error);
      return res.status(500).json({ message: "서버 오류가 발생했습니다." });
    }
    if (results.affectedRows > 0) {
      console.log("데이터 업데이트 성공:", results);
      res
        .status(200)
        .json({ message: "데이터가 성공적으로 업데이트되었습니다." });
    } else {
      res.status(404).json({ message: "데이터를 찾을 수 없습니다." });
    }
  });
});

router.put("/api/update-emissions", (req, res) => {
  const {
    email,
    year,
    month,
    electricity,
    gas,
    water,
    fuel,
    waste,
    total_carbon,
    tree_loss,
  } = req.body;

  // 변경 가능 필드만 업데이트
  const sql = `
    UPDATE carbon_emissions
    SET electricity = ?, gas = ?, water = ?, fuel = ?, waste = ?, total_carbon = ?, tree_loss = ?
    WHERE user_email = ? AND year = ? AND month = ?`;
  const values = [
    electricity,
    gas,
    water,
    fuel,
    waste,
    total_carbon,
    tree_loss,
    email,
    year,
    month,
  ];

  console.log("수신된 데이터:", req.body); // 데이터 확인
  console.log("쿼리 실행 데이터:", values); // 쿼리 파라미터 확인

  db.query(sql, values, (error, results) => {
    if (error) {
      console.error("업데이트 중 오류 발생:", error);
      return res.status(500).json({ message: "서버 오류가 발생했습니다." });
    }
    console.log("쿼리 실행 결과:", results); // 쿼리 실행 결과 확인
    if (results.affectedRows > 0) {
      res
        .status(200)
        .json({ message: "데이터가 성공적으로 업데이트되었습니다." });
    } else {
      res.status(404).json({ message: "데이터를 찾을 수 없습니다." });
    }
  });
});

module.exports = router;