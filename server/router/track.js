const express = require("express");
const db = require("../lib/db"); // MySQL 연결
const router = express.Router();

// 탄소 배출량 결과 저장 API
router.post("/carbon-emissions", (req, res) => {
  const {
    user_email,
    electricity,
    gas,
    water,
    fuel,
    waste,
    total_carbon,
    tree_loss,
  } = req.body;

  if (
    !user_email ||
    electricity === undefined ||
    gas === undefined ||
    water === undefined ||
    fuel === undefined ||
    waste === undefined ||
    total_carbon === undefined ||
    tree_loss === undefined
  ) {
    return res.status(400).json({ message: "모든 필드를 입력하세요." });
  }

  // 현재 년도와 월 추출
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1; // getMonth()는 0부터 시작하므로 1을 더함

  // DB에 탄소 배출량 결과 저장
  const query = `
    INSERT INTO carbon_emissions (
      user_email, electricity, gas, water, fuel, waste, total_carbon, tree_loss, year, month
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
    user_email,
    electricity,
    gas,
    water,
    fuel,
    waste,
    total_carbon,
    tree_loss,
    currentYear,
    currentMonth,
  ];

  db.query(query, values, (err, results) => {
    if (err) {
      console.error("데이터베이스 저장 오류", err);
      return res.status(500).json({ message: "서버 오류. 다시 시도해주세요." });
    }

    res.status(200).json({ message: "탄소 배출량 결과가 저장되었습니다." });
  });
});

// 월별 탄소 배출량 확인 API
router.get("/check-emissions", (req, res) => {
  // 경로 수정
  const { user_email, month, year } = req.query;

  const query = `
      SELECT * FROM carbon_emissions
      WHERE user_email = ? AND year = ? AND month = ?
    `;
  const values = [user_email, year, month];

  db.query(query, values, (err, results) => {
    if (err) {
      console.error("Error fetching emissions:", err);
      return res.status(500).json({
        success: false,
        message: "서버 오류가 발생했습니다. 다시 시도해주세요.",
      });
    }

    if (results.length > 0) {
      return res.status(200).json({
        success: true,
        emissions: results[0], // 첫 번째 결과 반환
      });
    } else {
      return res.status(404).json({
        success: false,
        message: "해당 월의 탄소 배출량 데이터가 없습니다.",
      });
    }
  });
});

// 월과 연도를 입력받아 세션의 사용자 데이터 반환
router.get("/get-carbon-data", (req, res) => {
  const { year, month } = req.query; // 연도와 월 파라미터 받기
  const user_email = req.session?.user?.email; // 세션에서 사용자 이메일 가져오기

  // 세션에 사용자 정보가 없을 경우
  if (!user_email) {
    return res.status(401).json({
      message:
        "로그인이 필요합니다. 세션이 만료되었거나 로그인하지 않았습니다.",
    });
  }

  // 연도와 월 입력 확인
  if (!year || !month) {
    return res.status(400).json({ message: "연도 및 월을 입력하세요." });
  }

  // 특정 사용자, 연도, 월에 대한 탄소 배출량 데이터 조회
  const query = `
      SELECT 
        electricity, gas, water, fuel, waste, total_carbon, tree_loss
      FROM 
        carbon_emissions
      WHERE 
        user_email = ? AND year = ? AND month = ?
    `;
  const values = [user_email, year, month];

  db.query(query, values, (err, results) => {
    if (err) {
      console.error("데이터 조회 오류", err);
      return res.status(500).json({ message: "서버 오류. 다시 시도해주세요." });
    }

    // 결과가 없는 경우
    if (results.length === 0) {
      return res
        .status(404)
        .json({ message: "해당 사용자의 데이터가 존재하지 않습니다." });
    }

    // 결과 반환
    return res.status(200).json({
      success: true,
      data: results[0], // 첫 번째 결과 반환
    });
  });
});

// 평균 배출량 API 라우터
router.get("/average-emissions", (req, res) => {
  const { month, year } = req.query;

  const monthInt = parseInt(month, 10);
  const yearInt = parseInt(year, 10);

  if (isNaN(monthInt) || isNaN(yearInt)) {
    return res.status(400).json({
      success: false,
      message: "Invalid month or year provided.",
    });
  }

  const query = `
        SELECT 
          AVG(electricity) AS avg_electricity,
          AVG(gas) AS avg_gas,
          AVG(water) AS avg_water,
          AVG(fuel) AS avg_fuel,
          AVG(waste) AS avg_waste,
          AVG(total_carbon) AS avg_total_carbon,
          AVG(tree_loss) AS avg_tree_loss
        FROM carbon_emissions
        WHERE month = ? AND year = ?`;

  db.query(query, [monthInt, yearInt], (error, results) => {
    if (error) {
      console.error("Failed to fetch average emissions:", error.message);
      return res.status(500).json({
        success: false,
        message: "Internal Server Error",
        error: error.message,
      });
    }

    if (
      !results ||
      results.length === 0 ||
      results[0]?.avg_total_carbon === null
    ) {
      return res.json({
        success: true,
        averages: {
          electricity: 0,
          gas: 0,
          water: 0,
          fuel: 0,
          waste: 0,
          total_carbon: 0,
          tree_loss: 0,
        },
      });
    }

    const averages = {
      electricity: results[0]?.avg_electricity || 0,
      gas: results[0]?.avg_gas || 0,
      water: results[0]?.avg_water || 0,
      fuel: results[0]?.avg_fuel || 0,
      waste: results[0]?.avg_waste || 0,
      total_carbon: results[0]?.avg_total_carbon || 0,
      tree_loss: results[0]?.avg_tree_loss || 0,
    };

    return res.json({ success: true, averages });
  });
});

module.exports = router;