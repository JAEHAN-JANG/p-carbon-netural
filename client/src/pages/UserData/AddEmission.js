import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

const AddEmission = () => {
  const { state } = useLocation();
  const { email } = state || {}; // UserData 컴포넌트에서 전달된 이메일
  const [formData, setFormData] = useState({
    year: "",
    month: "",
    electricity: "",
    gas: "",
    water: "",
    fuel: "none", // fuel의 초기값을 "none"으로 설정
    fuelDistance: "", // 연료 거리
    waste: "",
    total_carbon: "",
    tree_loss: "",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { year, month, electricity, gas, water, fuel, fuelDistance, waste } =
      formData;

    // 값 계산
    const electricityCarbon = (parseFloat(electricity) * 0.4781).toFixed(2);
    const gasCarbon = (parseFloat(gas) * 2.176).toFixed(2);
    const waterCarbon = (parseFloat(water) * 0.237).toFixed(2);
    let fuelCarbon = 0;

    if (fuel !== "none" && fuel && fuelDistance) {
      const parsedDistance = parseFloat(fuelDistance);
      switch (fuel) {
        case "gasoline":
          fuelCarbon = ((parsedDistance / 16.04) * 2.097).toFixed(2);
          break;
        case "diesel":
          fuelCarbon = ((parsedDistance / 15.35) * 2.582).toFixed(2);
          break;
        case "lpg":
          fuelCarbon = ((parsedDistance / 11.06) * 1.868).toFixed(2);
          break;
        default:
          fuelCarbon = 0;
      }
    }

    const wasteCarbon = (parseFloat(waste) * 0.327).toFixed(2);

    const totalCarbon =
      parseFloat(electricityCarbon) +
      parseFloat(gasCarbon) +
      parseFloat(waterCarbon) +
      parseFloat(fuelCarbon) +
      parseFloat(wasteCarbon);

    const treeLoss = (totalCarbon / 5.6).toFixed(2);

    const postData = {
      email,
      year,
      month,
      electricity: electricityCarbon, // 계산된 전기 탄소 배출량
      gas: gasCarbon,
      water: waterCarbon,
      fuel: String(fuelCarbon), // fuelCarbon을 문자열로 변환
      waste: wasteCarbon,
      total_carbon: totalCarbon.toFixed(2).toString(), // totalCarbon을 문자열로 변환
      tree_loss: treeLoss, // 계산된 tree loss
    };

    // 콘솔에 출력
    console.log("Form Data:", formData);
    console.log("Post Data:", postData);

    // 필수 입력 값 체크
    if (!year || !month || !electricity || !gas || !water || !waste) {
      alert("모든 필드를 입력해야 합니다.");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:5000/userManage/add-emission",
        postData
      );
      console.log("서버 응답:", response.data);
      alert(response.data.message);
      navigate("/UserData", { state: { email } });
    } catch (error) {
      console.error("데이터 전송 실패:", error);
      alert("이미 해당 년,월에 데이터가 존재하고 있습니다.");
    }
  };

  return (
    <div className="p-8 bg-gray-100 min-h-screen mt-14">
      <h1 className="text-2xl font-bold mb-6">탄소 배출량 데이터 추가</h1>
      <form onSubmit={handleSubmit}>
        {/* 전기, 가스, 물 입력 필드 */}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {/* 년도 */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              년도
            </label>
            <select
              name="year"
              value={formData.year}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">년도 선택</option>
              <option value="2021">2021</option>
              <option value="2022">2022</option>
              <option value="2023">2023</option>
              <option value="2024">2024</option>
            </select>
          </div>

          {/* 월 */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2">월</label>
            <select
              name="month"
              value={formData.month}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">월 선택</option>
              {[...Array(12).keys()].map((i) => (
                <option key={i + 1} value={i + 1}>
                  {i + 1}월
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              전기 사용량 (kWh)
            </label>
            <input
              type="number"
              name="electricity"
              value={formData.electricity}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              가스 사용량 (m³)
            </label>
            <input
              type="number"
              name="gas"
              value={formData.gas}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="0"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              물 사용량 (톤)
            </label>
            <input
              type="number"
              name="water"
              value={formData.water}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="0"
              required
            />
          </div>
        </div>

        {/* 연료 종류, 연료 거리, 폐기물 입력 필드 */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-6">
          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              연료 종류
            </label>
            <select
              name="fuel"
              value={formData.fuel}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="none">선택 안 함</option>
              <option value="gasoline">휘발유</option>
              <option value="diesel">경유</option>
              <option value="lpg">LPG</option>
            </select>
          </div>

          {formData.fuel !== "none" && (
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                운행 거리 (km)
              </label>
              <input
                type="number"
                name="fuelDistance"
                value={formData.fuelDistance}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="0"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              폐기물 배출량 (kg)
            </label>
            <input
              type="number"
              name="waste"
              value={formData.waste}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="0"
              required
            />
          </div>
        </div>

        <div className="mt-4">
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600 transition duration-300"
          >
            데이터 추가
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddEmission;
