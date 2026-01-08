import { useEffect, useState } from "react";
import axios from "axios";

const useComparisonData = (email, selectedMonth, selectedYear) => {
  const [thisMonthData, setThisMonthData] = useState(null);
  const [averageData, setAverageData] = useState(null);
  const [differences, setDifferences] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userResponse = await axios.get(
          `http://localhost:5000/track/check-emissions?user_email=${email}&month=${selectedMonth}&year=${selectedYear}`
        );
        const averageResponse = await axios.get(
          `http://localhost:5000/track/average-emissions?month=${selectedMonth}&year=${selectedYear}`
        );

        if (userResponse.data.success && userResponse.data.emissions) {
          setThisMonthData(userResponse.data.emissions);
        }

        if (averageResponse.data.success && averageResponse.data.averages) {
          setAverageData(averageResponse.data.averages);
        }

        if (
          userResponse.data.success &&
          averageResponse.data.success &&
          userResponse.data.emissions &&
          averageResponse.data.averages
        ) {
          const calculatedDifferences = Object.keys(
            userResponse.data.emissions
          ).reduce((acc, key) => {
            const thisValue = parseFloat(userResponse.data.emissions[key]) || 0;
            const avgValue =
              parseFloat(averageResponse.data.averages[key]) || 0;
            acc[key] = thisValue - avgValue;
            return acc;
          }, {});

          setDifferences(calculatedDifferences);
        }
      } catch (error) {
        console.error("데이터를 가져오는 데 실패했습니다.", error);
      } finally {
        setLoading(false);
      }
    };

    if (email && selectedMonth && selectedYear) {
      fetchData();
    }
  }, [email, selectedMonth, selectedYear]); // selectedMonth와 selectedYear가 변경될 때마다 fetchData 실행

  return { thisMonthData, averageData, differences, loading };
};

export default useComparisonData;
