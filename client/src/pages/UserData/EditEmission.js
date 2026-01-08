import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

const EditEmission = () => {
  const { state } = useLocation();
  const { email, data } = state || {};
  const [formData, setFormData] = useState({ ...data });
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updatedFormData = { ...formData, [name]: value };

    const {
      electricity = 0,
      gas = 0,
      water = 0,
      fuel = 0,
      waste = 0,
    } = updatedFormData;

    // 해당 값이 숫자로 변환 가능한지 확인하고, 숫자로 변환
    const updatedValue = isNaN(value) ? 0 : parseFloat(value); // 숫자가 아니면 0으로 처리

    setFormData({
      ...formData,
      [name]: updatedValue,
    });

    // 탄소 배출량 계산 (총합)
    const totalCarbon =
      parseFloat(electricity || 0) +
      parseFloat(gas || 0) +
      parseFloat(water || 0) +
      parseFloat(fuel || 0) +
      parseFloat(waste || 0);

    // 나무 손실 계산
    const treeLoss = (totalCarbon / 5.6).toFixed(2);

    // 계산된 값 업데이트
    setFormData({
      ...updatedFormData,
      total_carbon: totalCarbon.toFixed(2), // 여기서 `toFixed` 사용
      tree_loss: treeLoss,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("전송 데이터:", { email, ...formData }); // 추가
    try {
      const response = await axios.put(
        `http://localhost:5000/userManage/api/update-emissions`,
        {
          email,
          ...formData,
        }
      );
      console.log("서버 응답:", response.data); // 추가
      alert("수정되었습니다.");
      navigate(-1); // 이전 페이지로 이동
    } catch (error) {
      console.error("수정 중 오류 발생", error);
      alert("수정 실패");
    }
  };

  return (
    <div className="p-8 bg-[#f8fbf9] min-h-screen">
      <h1 className="text-2xl font-bold mb-6">데이터 수정</h1>
      <form onSubmit={handleSubmit}>
        {Object.keys(formData).map((key) =>
          key !== "year" &&
          key !== "month" &&
          key !== "total_carbon" &&
          key !== "tree_loss" ? ( // 수정 불가한 필드 제외
            <div key={key} className="mb-4">
              <label className="block text-sm font-medium mb-1">{key}</label>
              <input
                type="text"
                name={key}
                value={formData[key]}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-md"
              />
            </div>
          ) : null
        )}
        {/* 자동 계산된 값 표시 */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Total Carbon</label>
          <input
            type="text"
            name="total_carbon"
            value={formData.total_carbon}
            readOnly
            className="w-full px-4 py-2 border rounded-md bg-gray-100"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Tree Loss</label>
          <input
            type="text"
            name="tree_loss"
            value={formData.tree_loss}
            readOnly
            className="w-full px-4 py-2 border rounded-md bg-gray-100"
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600"
        >
          수정 저장
        </button>
      </form>
    </div>
  );
};

export default EditEmission;
