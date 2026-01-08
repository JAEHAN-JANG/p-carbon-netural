import React, { useEffect, useRef, useState, useCallback } from "react";
import useComparisonData from "./useComparisonData";

const ComparisonSection = ({ email, comparisonKeys }) => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);

  const { thisMonthData, averageData, differences, loading } =
    useComparisonData(
      email,
      selectedMonth, // selectedMonth 전달
      selectedYear // selectedYear 전달
    );

  const chartWrapperRef = useRef(null);

  // 화면 크기에 비례하여 차트 크기 설정
  const [chartDimensions, setChartDimensions] = useState({
    width: window.innerWidth * 0.9, // 화면 너비의 90%
    height: window.innerHeight * 0.7, // 화면 높이의 70%
  });

  // 화면 크기가 변경될 때 차트 크기 조정
  useEffect(() => {
    const handleResize = () => {
      setChartDimensions({
        width: window.innerWidth * 0.9, // 화면 너비의 90%
        height: window.innerHeight * 0.7, // 화면 높이의 70%
      });
    };

    window.addEventListener("resize", handleResize);

    // 컴포넌트 언마운트 시 이벤트 리스너 제거
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // 차트 그리기
  const drawChart = useCallback(() => {
    const data = [
      ["항목", "사용자 배출량", "평균 배출량", "차이"],
      ...comparisonKeys.map((key) => {
        const thisMonth = parseFloat(thisMonthData[key]) || 0;
        const average = parseFloat(averageData[key]) || 0;
        const diff = differences[key] || 0;
        const adjustedDiff = Math.abs(diff); // 절대값으로 처리

        return [key, thisMonth, average, adjustedDiff];
      }),
    ];

    const googleData = window.google.visualization.arrayToDataTable(data);
    const options = {
      title: "배출량 비교",
      chartArea: { width: "80%" }, // 차트 영역 너비 조정
      isStacked: true,
      hAxis: {
        title: "배출량 (kg)",
        minValue: 0,
      },
      vAxis: {
        textPosition: "out", // y축 텍스트 외부 표시
        slantedText: true, // y축 항목 텍스트가 기울어지도록 설정
        slantedTextAngle: 45, // 텍스트 기울기 각도
      },
      colors: ["#FF6F61", "#5F9EA0", "#FFD700"], // 색상 설정
    };

    const chart = new window.google.visualization.BarChart(
      chartWrapperRef.current
    );
    chart.draw(googleData, options);
  }, [thisMonthData, averageData, differences, comparisonKeys]);

  // Google Charts 로드 및 차트 초기화
  useEffect(() => {
    const loadGoogleCharts = () => {
      if (window.google && window.google.charts) {
        window.google.charts.load("current", {
          packages: ["corechart", "bar"],
        });
        window.google.charts.setOnLoadCallback(() => {
          if (thisMonthData && averageData && differences && comparisonKeys) {
            drawChart();
          }
        });
      } else {
        console.error("Google Charts 라이브러리가 로드되지 않았습니다.");
      }
    };

    if (!window.google || !window.google.charts) {
      const script = document.createElement("script");
      script.src = "https://www.gstatic.com/charts/loader.js";
      script.onload = loadGoogleCharts;
      document.body.appendChild(script);
    } else {
      loadGoogleCharts();
    }
  }, [thisMonthData, averageData, differences, comparisonKeys, drawChart]);

  const handleYearChange = (e) => setSelectedYear(e.target.value);
  const handleMonthChange = (e) => setSelectedMonth(e.target.value);

  if (loading) {
    return (
      <p className="text-lg text-gray-500">데이터를 불러오는 중입니다...</p>
    );
  }

  return (
    <section className="bg-white p-8 rounded-lg shadow-lg pt-16">
      <h2 className="text-4xl font-bold text-gray-800 mb-4">
        사용자 배출량과 평균 비교
      </h2>

      {/* 년도와 월 선택 */}
      <div className="flex justify-center space-x-6 mb-8">
        <select
          value={selectedYear}
          onChange={handleYearChange}
          className="p-2 rounded-md bg-white border border-gray-300"
        >
          {[2020, 2021, 2022, 2023, 2024].map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
        <select
          value={selectedMonth}
          onChange={handleMonthChange}
          className="p-2 rounded-md bg-white border border-gray-300"
        >
          {[...Array(12).keys()].map((month) => (
            <option key={month} value={month + 1}>
              {month + 1}월
            </option>
          ))}
        </select>
      </div>

      {differences && comparisonKeys.length > 0 ? (
        <div
          ref={chartWrapperRef}
          style={{
            width: chartDimensions.width,
            height: chartDimensions.height,
          }}
        />
      ) : (
        <p className="text-lg text-gray-500">데이터가 없습니다.</p>
      )}
    </section>
  );
};

export default ComparisonSection;