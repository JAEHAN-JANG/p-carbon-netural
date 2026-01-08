import React, { useState, useEffect } from "react";
import useMonthlySummary from "./useMonthlySummary";

const keyMap = {
  electricity: "전기",
  gas: "가스",
  water: "물",
  fuel: "연료",
  waste: "폐기물",
};

const MonthlySummarySection = ({ userName, email, selectedKeys }) => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [noData, setNoData] = useState(false);

  const { thisMonthData, loading, error } = useMonthlySummary(
    email,
    selectedMonth,
    selectedYear
  );

  const handleYearChange = (e) => setSelectedYear(e.target.value);
  const handleMonthChange = (e) => setSelectedMonth(e.target.value);

  useEffect(() => {
    if (error && error.response?.status === 404) {
      setNoData(true);
    } else {
      setNoData(false);
    }
  }, [error]);

  console.log("Rendering MonthlySummarySection...");
  console.log("Selected Year: ", selectedYear);
  console.log("Selected Month: ", selectedMonth);

  return (
    <div className="mt-12 bg-gray-100 p-10 rounded-lg shadow-inner">
      <h2 className="text-4xl font-bold text-gray-800 mb-4">사용자 배출량</h2>
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

      {loading && (
        <p className="text-lg text-gray-500 text-left">
          데이터를 불러오는 중입니다...
        </p>
      )}

      {error && !noData && (
        <p className="text-lg text-red-500 text-left">
          {error.message || "데이터를 불러오는 데 실패했습니다."}
        </p>
      )}

      {noData && (
        <div className="flex justify-center items-center h-screen">
          <p className="text-4xl text-gray-500">
            해당 월의 탄소 배출량 데이터가 없습니다.
          </p>
        </div>
      )}

      {!noData && thisMonthData && (
        <div className="flex space-x-14">
          <div className="flex flex-col items-center space-y-6 w-1/3 border-r border-gray-300 pr-14">
            <div className="flex items-center space-x-8">
              <div className="w-40 h-40 bg-gray-300 rounded-full overflow-hidden">
                <img
                  src="./CO2.jpg"
                  alt="배출량 이미지"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="text-3xl font-bold text-red-600">배출량 결과</div>
            </div>
            <div className="text-6xl font-bold text-red-600">
              {parseFloat(thisMonthData.total_carbon) || 0} kg
            </div>
          </div>

          <div className="flex flex-col items-center space-y-6 w-1/3 border-r border-gray-300 px-12">
            <div className="flex items-center space-x-8">
              <div className="w-40 h-40 bg-green-300 rounded-full overflow-hidden">
                <img
                  src="./tree.png"
                  alt="나무 손실 이미지"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="text-3xl font-bold text-green-600">나무 손실</div>
            </div>
            <div className="text-6xl font-bold text-green-600">
              {parseFloat(thisMonthData.tree_loss) || 0} 그루
            </div>
          </div>

          <div className="flex flex-col items-start space-y-6 w-1/3 pl-16">
            <ul>
              {selectedKeys.map((key) => (
                <li
                  key={key}
                  className="text-base border-b border-gray-300 pb-3 mb-4"
                >
                  <div className="flex justify-between">
                    <span className="text-2xl">{keyMap[key] || key}</span>
                    <span className="text-2xl font-bold ml-12">
                      {parseFloat(thisMonthData[key]) || 0} kg
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default MonthlySummarySection;
