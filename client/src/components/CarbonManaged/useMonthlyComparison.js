import { useEffect, useState } from "react";
import axios from "axios";

const useMonthlyComparison = (email, selectedYear, selectedMonth) => {
  const [thisMonthData, setThisMonthData] = useState(null);
  const [lastMonthData, setLastMonthData] = useState(null);
  const [percentageChange, setPercentageChange] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true); // 데이터 로딩 시작

      // 전 달 계산
      const lastMonth = selectedMonth === 1 ? 12 : selectedMonth - 1;
      const lastYear = selectedMonth === 1 ? selectedYear - 1 : selectedYear;

      try {
        // 이번 달 데이터
        const userResponse = await axios.get(
          `http://localhost:5000/track/check-emissions?user_email=${email}&month=${selectedMonth}&year=${selectedYear}`
        );
        // 전 달 데이터
        const lastMonthResponse = await axios.get(
          `http://localhost:5000/track/check-emissions?user_email=${email}&month=${lastMonth}&year=${lastYear}`
        );

        if (userResponse.data.success && userResponse.data.emissions) {
          setThisMonthData(userResponse.data.emissions);
        }

        if (
          lastMonthResponse.data.success &&
          lastMonthResponse.data.emissions
        ) {
          setLastMonthData(lastMonthResponse.data.emissions);
        }

        // 비율 계산
        const percentageDiff = Object.keys(userResponse.data.emissions).reduce(
          (acc, key) => {
            const thisValue = parseFloat(userResponse.data.emissions[key]) || 0;
            const lastValue =
              parseFloat(lastMonthResponse.data.emissions[key]) || 0;

            const difference = thisValue - lastValue;
            const percentage =
              lastValue !== 0 ? (difference / lastValue) * 100 : 0;

            acc[key] = { difference, percentage };
            return acc;
          },
          {}
        );

        setPercentageChange(percentageDiff);
      } catch (error) {
        setError(error.message); // 에러 메시지 설정
        console.error("데이터를 가져오는 데 실패했습니다.", error);
      } finally {
        setLoading(false); // 로딩 끝
      }
    };

    if (email && selectedYear && selectedMonth) {
      fetchData();
    }
  }, [email, selectedYear, selectedMonth]); // email, selectedYear, selectedMonth이 변경될 때마다 실행

  return { thisMonthData, lastMonthData, percentageChange, loading, error };
};

export default useMonthlyComparison;
