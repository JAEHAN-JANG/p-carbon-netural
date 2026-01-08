import React, { useState, useEffect } from "react";
import axios from "axios";

const PointCriteriaAdmin = () => {
  const [reductionPoints, setReductionPoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const categories = ["전기", "가스", "물", "교통", "폐기물"]; // 5개 카테고리
  const reductionRates = ["5% ~ 10%", "10% ~ 15%", "15% 이상"]; // 3개 감축률 범위

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

  // 데이터 수정 함수
  const handleChange = (rate, category, value) => {
    setReductionPoints((prevPoints) =>
      prevPoints.map((item) =>
        item.reduction_rate_range === rate && item.category === category
          ? { ...item, points: parseInt(value, 10) || 0 }
          : item
      )
    );
  };

  // 데이터 저장 함수
  const handleSave = async () => {
    try {
      for (const point of reductionPoints) {
        await axios.put(`http://localhost:5000/api/reduction-points/${point.id}`, {
          category: point.category,
          reduction_rate_range: point.reduction_rate_range,
          points: point.points,
        });
      }
      alert("데이터가 성공적으로 저장되었습니다.");
    } catch (err) {
      console.error("Error saving reduction points:", err.message);
      setError("데이터 저장에 실패했습니다.");
    }
  };

  // 로딩 및 오류 처리
  if (loading) return <div className="loading">로딩 중...</div>;
  if (error) return <div className="error-message">{error}</div>;

  // 테이블 데이터 렌더링
  return (
    <div className="p-8 bg-[#f8fbf9] min-h-screen">
      <h1 className="text-left text-2xl font-bold mb-6">포인트 지급 기준 관리</h1>
      <div className="overflow-x-auto mt-4">
      <table className="min-w-full bg-white border border-gray-200">
        <thead>
          <tr className="bg-gray-200 text-gray-700">
            <th className="px-4 py-2 text-center align-middle">감축률 범위</th>
            {categories.map((category, index) => (
              <th key={index} className="px-4 py-2 text-center align-middle">{category}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {reductionRates.map((rate) => (
            <tr key={rate} className="text-center">
              <td className="px-4 py-2 border text-center align-middle whitespace-nowrap overflow-hidden text-ellipsis">{rate}</td>
              {categories.map((category) => {
                const pointData = reductionPoints.find(
                  (item) => item.reduction_rate_range === rate && item.category === category
                );
                return (
                  <td key={category} className="px-4 py-2 border text-center align-middle whitespace-nowrap overflow-hidden text-ellipsis">
                    <input
                      type="number"
                      value={pointData?.points || 0}
                      className="text-center"
                      onChange={(e) => handleChange(rate, category, e.target.value)}
                    />
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      </div>

      <div className="flex justify-end mt-6">
        <button className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 bg-[#e7edf3] text-[#0e141b] text-sm font-bold leading-normal tracking-[0.015em] hover:bg-gray-400 hover:text-white transition-all duration-300 ease-in-out" onClick={handleSave}>
          저장
        </button>
      </div>

    </div>
  );
};

export default PointCriteriaAdmin;