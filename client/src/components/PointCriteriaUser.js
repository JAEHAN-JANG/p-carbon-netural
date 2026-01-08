import React, { useState, useEffect } from "react";
import axios from "axios";

const PointCriteriaUser = () => {
  const [reductionPoints, setReductionPoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 데이터 가져오기
  useEffect(() => {
    const fetchReductionPoints = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/reduction-points");
        setReductionPoints(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching reduction points:", err.message);
        setError("데이터를 불러오는 데 실패했습니다.");
        setLoading(false);
      }
    };

    fetchReductionPoints();
  }, []);

  // 로딩 및 오류 처리
  if (loading) return <div className="loading">로딩 중...</div>;
  if (error) return <div className="error-message">{error}</div>;

  // 표 데이터 준비
  const tableData = [
    {
      reduction_rate_range: "5% ~ 10%",
      electric: reductionPoints.find(item => item.category === "전기" && item.reduction_rate_range === "5% ~ 10%")?.points || 0,
      gas: reductionPoints.find(item => item.category === "가스" && item.reduction_rate_range === "5% ~ 10%")?.points || 0,
      water: reductionPoints.find(item => item.category === "물" && item.reduction_rate_range === "5% ~ 10%")?.points || 0,
      traffic: reductionPoints.find(item => item.category === "교통" && item.reduction_rate_range === "5% ~ 10%")?.points || 0,
      waste: reductionPoints.find(item => item.category === "폐기물" && item.reduction_rate_range === "5% ~ 10%")?.points || 0,
    },
    {
      reduction_rate_range: "10% ~ 15%",
      electric: reductionPoints.find(item => item.category === "전기" && item.reduction_rate_range === "10% ~ 15%")?.points || 0,
      gas: reductionPoints.find(item => item.category === "가스" && item.reduction_rate_range === "10% ~ 15%")?.points || 0,
      water: reductionPoints.find(item => item.category === "물" && item.reduction_rate_range === "10% ~ 15%")?.points || 0,
      traffic: reductionPoints.find(item => item.category === "교통" && item.reduction_rate_range === "10% ~ 15%")?.points || 0,
      waste: reductionPoints.find(item => item.category === "폐기물" && item.reduction_rate_range === "10% ~ 15%")?.points || 0,
    },
    {
      reduction_rate_range: "15%이상",
      electric: reductionPoints.find(item => item.category === "전기" && item.reduction_rate_range === "15% 이상")?.points || 0,
      gas: reductionPoints.find(item => item.category === "가스" && item.reduction_rate_range === "15% 이상")?.points || 0,
      water: reductionPoints.find(item => item.category === "물" && item.reduction_rate_range === "15% 이상")?.points || 0,
      traffic: reductionPoints.find(item => item.category === "교통" && item.reduction_rate_range === "15% 이상")?.points || 0,
      waste: reductionPoints.find(item => item.category === "폐기물" && item.reduction_rate_range === "15% 이상")?.points || 0,
    },
  ];

  return (
    <div className="p-8 bg-[#f8fbf9] min-h-screen">
      <h1 className="text-left text-2xl font-bold mb-6">Eco 마일리지 지급 기준</h1>
      <p className="text-[#509568] text-sm font-normal leading-normal mb-10">
        각 항목별 전월 대비 탄소 배출량의 감축률에 따라 Eco 마일리지를 차등 지급받을 수 있습니다.<br/>
        탄소 배출량 감소 실천화 방안을 직접 실행하고, Eco 마일리지를 수령해보세요!
      </p>
      <div className="overflow-x-auto mt-4">
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr className="bg-gray-200 text-gray-700">
              <th className="w-[150px]">감축률 범위</th>
              <th>전기</th>
              <th>가스</th>
              <th>물</th>
              <th>교통</th>
              <th>폐기물</th>
            </tr>
          </thead>
          <tbody>
            {tableData.map((row, rowIndex) => (
              <tr key={rowIndex} className="text-center">
                <td className="px-4 py-2 border whitespace-nowrap overflow-hidden text-ellipsis">{row.reduction_rate_range}</td>
                <td className="px-4 py-2 border whitespace-nowrap overflow-hidden text-ellipsis">{row.electric.toLocaleString()}P</td>
                <td className="px-4 py-2 border whitespace-nowrap overflow-hidden text-ellipsis">{row.gas.toLocaleString()}P</td>
                <td className="px-4 py-2 border whitespace-nowrap overflow-hidden text-ellipsis">{row.water.toLocaleString()}P</td>
                <td className="px-4 py-2 border whitespace-nowrap overflow-hidden text-ellipsis">{row.traffic.toLocaleString()}P</td>
                <td className="px-4 py-2 border whitespace-nowrap overflow-hidden text-ellipsis">{row.waste.toLocaleString()}P</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PointCriteriaUser;