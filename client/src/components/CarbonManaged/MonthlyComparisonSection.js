import React, { useEffect, useRef, useState, useCallback } from "react";
import useMonthlyComparison from "./useMonthlyComparison";

const calculateLastMonth = (year, month) => {
  if (month === 1) {
    return { year: year - 1, month: 12 }; // 1월이면 전년도 12월
  }
  return { year, month: month - 1 }; // 나머지 경우
};

const MonthlyComparisonSection = ({ email, comparisonKeys }) => {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);

  const { year: lastYear, month: lastMonth } = calculateLastMonth(
    selectedYear,
    selectedMonth
  );

  const { thisMonthData, lastMonthData, percentageChange, loading } =
    useMonthlyComparison(
      email,
      selectedYear,
      selectedMonth,
      lastYear,
      lastMonth
    );

  const chartWrapperRef = useRef(null);

  const [chartDimensions, setChartDimensions] = useState({
    width: window.innerWidth * 0.7, // 화면 너비의 70%
    height: window.innerHeight * 0.7, // 화면 높이의 70%
  });

  // 화면 크기 변경 감지
  useEffect(() => {
    const handleResize = () => {
      setChartDimensions({
        width: window.innerWidth * 0.7,
        height: window.innerHeight * 0.7,
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const drawChart = useCallback(() => {
    const safeThisMonthData = thisMonthData || {};
    const safeLastMonthData = lastMonthData || {};
    const safePercentageChange = percentageChange || {};

    const data = [
      [
        "항목",
        "전 월 배출량",
        { role: "style" },
        "선택 월 배출량",
        { role: "style" },
        { role: "annotation" },
      ],
      ...comparisonKeys.map((key) => {
        const thisMonth = parseFloat(safeThisMonthData[key]) || 0;
        const lastMonth = parseFloat(safeLastMonthData[key]) || 0;
        const percentage =
          parseFloat(safePercentageChange[key]?.percentage) || 0;

        const annotationText = `${percentage.toFixed(2)}%`;

        return [
          key,
          lastMonth,
          "#5F9EA0",
          thisMonth,
          "#FF6F61",
          annotationText,
        ];
      }),
    ];

    const googleData = new window.google.visualization.DataTable();
    googleData.addColumn("string", "항목");
    googleData.addColumn("number", "전 월 배출량");
    googleData.addColumn({ type: "string", role: "style" });
    googleData.addColumn("number", "선택 월 배출량");
    googleData.addColumn({ type: "string", role: "style" });
    googleData.addColumn({ type: "string", role: "annotation" });

    data.slice(1).forEach((row) => googleData.addRows([row]));

    const options = {
      chartArea: { width: "70%", height: "80%" },
      vAxis: { title: "배출량 (kg)", textStyle: { fontSize: 14 } },
      hAxis: { textStyle: { fontSize: 14 } },
      annotations: {
        textStyle: { fontSize: 16, bold: true },
        alwaysOutside: true,
      },
      bar: { groupWidth: "50%" },
      colors: ["#5F9EA0", "#FF6F61"],
      legend: {
        position: "right",
        textStyle: { fontSize: 14 },
      },
      width: chartDimensions.width,
      height: chartDimensions.height,
    };

    const chart = new window.google.visualization.ColumnChart(
      chartWrapperRef.current
    );
    chart.draw(googleData, options);
  }, [
    thisMonthData,
    lastMonthData,
    percentageChange,
    comparisonKeys,
    chartDimensions,
  ]);

  useEffect(() => {
    const loadGoogleCharts = () => {
      if (window.google && window.google.charts) {
        window.google.charts.load("current", { packages: ["corechart"] });
        window.google.charts.setOnLoadCallback(drawChart);
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
  }, [drawChart]);

  const handleYearChange = (e) => setSelectedYear(+e.target.value);
  const handleMonthChange = (e) => setSelectedMonth(+e.target.value);

  if (loading) {
    return (
      <p className="text-lg text-gray-500">데이터를 불러오는 중입니다...</p>
    );
  }

  return (
    <section className="mt-12 bg-gray-100 p-10 rounded-lg shadow-inner">
      <h2 className="text-4xl font-bold text-gray-800 mb-4">
        전월과 선택한 월 배출량 비교
      </h2>
      <div className="flex justify-center space-x-8 mb-8">
        <div className="flex items-center">
          <select
            value={selectedYear}
            onChange={handleYearChange}
            className="p-3 rounded-lg border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-300 ease-in-out"
          >
            {[2024, 2023, 2022].map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center">
          <select
            value={selectedMonth}
            onChange={handleMonthChange}
            className="p-3 rounded-lg border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-300 ease-in-out"
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
              <option key={month} value={month}>
                {month}월
              </option>
            ))}
          </select>
        </div>
      </div>
      <div
        ref={chartWrapperRef}
        style={{
          width: `${chartDimensions.width}px`,
          height: `${chartDimensions.height}px`,
          margin: "0 auto",
        }}
      />
    </section>
  );
};

export default MonthlyComparisonSection;