const express = require("express");
const router = express.Router();
const db = require("../lib/db"); // 기존 db.js 파일 사용

router.post("/", async (req, res) => {
  const { product_id, quantity, total_price } = req.body;
  const user_email = req.session?.user?.email;

  if (!user_email) {
    return res
      .status(401)
      .json({ success: false, message: "로그인이 필요합니다." });
  }

  try {
    // 프로미스 기반 쿼리 사용
    const [user] = await db
      .promise()
      .query("SELECT mileage FROM users WHERE email = ?", [user_email]);

    if (!user.length || user[0].mileage < total_price) {
      return res
        .status(400)
        .json({ success: false, message: "마일리지가 부족합니다." });
    }

    const [product] = await db
      .promise()
      .query("SELECT stock FROM product WHERE product_id = ?", [product_id]);

    console.log("Product Data:", product); // 쿼리 결과 확인

    if (!product.length) {
      return res
        .status(400)
        .json({ success: false, message: "상품을 찾을 수 없습니다." });
    }

    console.log("현재 재고:", product[0].stock, "구매 수량:", quantity);

    if (product[0].stock < quantity) {
      return res
        .status(400)
        .json({ success: false, message: "재고가 부족합니다." });
    }

    // 구매 정보 저장
    await db
      .promise()
      .query(
        "INSERT INTO purchase (user_email, product_id, quantity, total_price) VALUES (?, ?, ?, ?)",
        [user_email, product_id, quantity, total_price]
      );

    // 재고 차감
    await db
      .promise()
      .query("UPDATE product SET stock = stock - ? WHERE product_id = ?", [
        quantity,
        product_id,
      ]);

    // 마일리지 차감
    await db
      .promise()
      .query("UPDATE users SET mileage = mileage - ? WHERE email = ?", [
        total_price,
        user_email,
      ]);

    res.json({ success: true });
  } catch (err) {
    console.error("구매 처리 중 오류:", err);
    res
      .status(500)
      .json({ success: false, message: "서버 오류가 발생했습니다." });
  }
});

router.get("/list", async (req, res) => {
  const user_email = req.session?.user?.email;

  if (!user_email) {
    return res
      .status(401)
      .json({ success: false, message: "로그인이 필요합니다." });
  }

  try {
    const [purchases] = await db.promise().query(
      `SELECT 
          p.product_name, 
          p.description, 
          p.image, 
          p.price, 
          c.code_name, 
          pu.quantity, 
          pu.total_price, 
          pu.purchase_date 
        FROM purchase pu
        JOIN product p ON pu.product_id = p.product_id
        JOIN code c ON p.code_id = c.code_id
        WHERE pu.user_email = ?
        ORDER BY pu.purchase_date DESC`,
      [user_email]
    );

    res.json({ success: true, purchases });
  } catch (err) {
    console.error("구매 목록 조회 오류:", err);
    res
      .status(500)
      .json({ success: false, message: "구매 목록 조회에 실패했습니다." });
  }
});

module.exports = router;