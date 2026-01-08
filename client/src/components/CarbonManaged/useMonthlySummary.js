import { useState, useEffect } from "react";
import axios from "axios";

const useMonthlySummary = (email, month, year) => {
  const [thisMonthData, setThisMonthData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!email || !month || !year) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `http://localhost:5000/track/check-emissions`,
          { params: { user_email: email, month, year } }
        );
        setThisMonthData(response.data.emissions); // 데이터 저장
        setError(null); // 에러 초기화
      } catch (err) {
        setError(
          err.response?.data || {
            message: "데이터를 가져오는 데 실패했습니다.",
          }
        );
        setThisMonthData(null); // 데이터 없음
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [email, month, year]);

  return { thisMonthData, loading, error };
};

export default useMonthlySummary;
