const mysql = require("mysql2");

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "root",
  database: "project",
});

db.connect((err) => {
  if (err) {
    console.error("MySQL 연결 실패:", err);
    return;
  }
  console.log("MySQL에 연결되었습니다.");
});

module.exports = db;