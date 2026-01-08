import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function CarbonTracker() {
  const [electricity, setElectricity] = useState(0);
  const [gas, setGas] = useState(0);
  const [water, setWater] = useState(0);
  const [fuelType, setFuelType] = useState("none");
  const [distance, setDistance] = useState(0);
  const [waste, setWaste] = useState(0);
  const [result, setResult] = useState(null);
  const [userEmail, setUserEmail] = useState(""); // 이메일 상태 추가\
  const [, setUserName] = useState("");
  const navigate = useNavigate();

  // 로그인된 사용자 정보 API 호출
  useEffect(() => {
    const fetchUserName = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/auth/check-session",
          {
            withCredentials: true, // 쿠키를 포함하여 요청
          }
        );
        if (response.data.loggedIn) {
          setUserName(response.data.user.username);
          setUserEmail(response.data.user.email); // 로그인된 사용자 이메일을 저장
        } else {
          alert("로그인이 필요합니다.");
          navigate("/login");
        }
      } catch (error) {
        console.error("사용자 정보를 가져오는 데 실패했습니다.", error);
        setUserName("알 수 없음");
        alert("사용자 정보를 불러오지 못했습니다. 다시 시도해주세요.");
      }
    };

    fetchUserName();
  }, [navigate]);

  useEffect(() => {
    console.log("현재 이메일:", userEmail);
  }, [userEmail]); // userEmail이 변경될 때마다 확인

  const handleCalculate = (e) => {
    e.preventDefault();

    const electricityCarbon = (parseFloat(electricity) * 0.4781).toFixed(2);
    const gasCarbon = (parseFloat(gas) * 2.176).toFixed(2);
    const waterCarbon = (parseFloat(water) * 0.237).toFixed(2);
    let fuelCarbon = 0;

    if (fuelType !== "none" && distance) {
      const parsedDistance = parseFloat(distance);
      switch (fuelType) {
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

    setResult({
      electricityCarbon,
      gasCarbon,
      waterCarbon,
      fuelCarbon,
      wasteCarbon,
      totalCarbon: totalCarbon.toFixed(2),
      treeLoss,
    });
  };

  const saveResultsToDatabase = async () => {
    if (!result || !userEmail) return; // 이메일이 없으면 저장하지 않음

    try {
      const response = await axios.post(
        "http://localhost:5000/track/carbon-emissions", // 서버의 API 엔드포인트
        {
          user_email: userEmail, // 세션에서 가져온 사용자 이메일
          electricity: result.electricityCarbon,
          gas: result.gasCarbon,
          water: result.waterCarbon,
          fuel: result.fuelCarbon,
          waste: result.wasteCarbon,
          total_carbon: result.totalCarbon,
          tree_loss: result.treeLoss,
          month: new Date().getMonth() + 1,
          year: new Date().getFullYear(),
        }
      );

      if (response.status === 200) {
        alert("탄소 배출량 결과가 저장되었습니다.");
        navigate("/CarbonManaged"); // 저장 후 CarbonManaged 페이지로 이동
      }
    } catch (error) {
      console.error("결과를 저장하는 데 실패했습니다.", error);
      alert("결과 저장에 실패했습니다. 다시 시도해주세요.");
    }
  };

  const checkIfExists = async () => {
    const currentDate = new Date();
    const month = currentDate.getMonth() + 1;
    const year = currentDate.getFullYear();

    try {
      const response = await axios.get(
        `http://localhost:5000/track/check-emissions?user_email=${userEmail}&month=${month}&year=${year}`
      );

      if (response.data.success && response.data.emissions) {
        alert("이미 해당 월의 데이터가 존재합니다.");
        navigate("/CarbonManaged");
      } else {
        saveResultsToDatabase();
      }
    } catch (error) {
      if (error.response && error.response.status === 404) {
        console.log("데이터가 없습니다. 새로운 데이터 저장을 시도합니다.");
        saveResultsToDatabase();
      } else {
        console.error("중복 체크에 실패했습니다.", error);
        alert("중복 체크에 실패했습니다. 다시 시도해주세요.");
      }
    }
  };

  const handleSave = () => {
    if (!result) {
      alert("먼저 계산을 진행해주세요.");
      return;
    }
    checkIfExists();
  };

  // handleReset 함수 정의
  const handleReset = () => {
    setElectricity(0);
    setGas(0);
    setWater(0);
    setFuelType("none");
    setDistance(0);
    setWaste(0);
    setResult(null);
  };

  return (
    <div className="min-h-screen bg-[#f8fbf9] py-10">
      <div className="max-w-4xl mx-auto bg-white p-8 shadow-md rounded-md">
        <h1 className="text-2xl font-bold text-blue-600 text-center mb-6">
          탄소 배출량 계산기
        </h1>
        <p className="text-center text-gray-600 mb-8">
          다양한 활동에서 발생하는 본인의 월별 탄소배출량을 계산해보세요.
          <br/>'전기', '가스', '물' 항목은 관리비 고지서 등에 적힌 값을 입력하시면 됩니다.
        </p>

        <form onSubmit={handleCalculate} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {/* 전기 */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                전기 사용량 (kWh)
              </label>
              <input
                type="number"
                value={electricity}
                onChange={(e) => setElectricity(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0"
              />
            </div>

            {/* 가스 */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                가스 사용량 (m³)
              </label>
              <input
                type="number"
                value={gas}
                onChange={(e) => setGas(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="0"
              />
            </div>

            {/* 물 */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                물 사용량 (m³)
              </label>
              <input
                type="number"
                value={water}
                onChange={(e) => setWater(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="0"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-6">
            {/* 연료 */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                연료 종류
              </label>
              <select
                value={fuelType}
                onChange={(e) => setFuelType(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="none">선택 안 함</option>
                <option value="gasoline">휘발유</option>
                <option value="diesel">경유</option>
                <option value="lpg">LPG</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                운행 거리 (km)
              </label>
              <input
                type="number"
                value={distance}
                onChange={(e) => setDistance(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="0"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                폐기물 배출량 (L)
              </label>
              <input
                type="number"
                value={waste}
                onChange={(e) => setWaste(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="0"
              />
            </div>
          </div>

          <div className="flex justify-start mt-8">
            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition duration-300 mr-2"
            >
              계산하기
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="w-full sm:w-auto px-6 py-2 bg-gray-300 text-gray-700 rounded-lg shadow-md hover:bg-gray-400 transition duration-300 mr-2"
            >
              초기화
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="w-full sm:w-auto px-6 py-2 bg-green-600 text-white rounded-lg shadow-md hover:bg-green-700 transition duration-300"
            >
              저장하기
            </button>
          </div>
        </form>

        {result && (
          <div className="mt-10 bg-gray-100 p-6 rounded-lg shadow-inner flex justify-center items-start space-x-10 pl-1">
            {/* 왼쪽 영역: 배출량 이미지와 텍스트 */}
            <div className="flex flex-col items-center space-y-2 border-r border-gray-300 pr-10">
              {/* 배출량 이미지와 텍스트를 수평으로 배치 */}
              <div className="flex items-center space-x-4">
                {/* 배출량 이미지 */}
                <div className="w-24 h-24 bg-gray-300 rounded-full overflow-hidden">
                  <img
                    src="./CO2.jpg"
                    alt="배출량 이미지"
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* 배출량 결과 텍스트 */}
                <div className="text-xl font-bold text-red-600">
                  배출량 결과
                </div>
              </div>
              {/* 배출량 값은 아래에 배치 */}
              <div className="text-4xl font-bold text-red-600">
                {result.totalCarbon} kg CO₂
              </div>
            </div>

            {/* 가운데 영역: 나무 손실 이미지와 텍스트 */}
            <div className="flex flex-col items-center space-y-2 border-r border-gray-300 px-10 pl-1">
              {/* 나무 손실 이미지와 텍스트를 수평으로 배치 */}
              <div className="flex items-center space-x-4">
                {/* 나무 손실 이미지 */}
                <div className="w-24 h-24 bg-green-300 rounded-full overflow-hidden">
                  <img
                    src="./tree.png"
                    alt="나무 손실 이미지"
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* 나무 손실 텍스트 */}
                <div className="text-xl font-bold text-green-600">
                  나무 손실
                </div>
              </div>
              {/* 나무 손실 값은 아래에 배치 */}
              <div className="text-4xl font-bold text-green-600">
                {result.treeLoss} 그루
              </div>
            </div>

            {/* 오른쪽 영역: 나머지 항목들 */}
            <div className="space-y-2 pl-1">
              <ul>
                <li className="text-sm border-b border-gray-300 pb-1 mb-2">
                  전기: {result.electricityCarbon} kgCO₂
                </li>
                <li className="text-sm border-b border-gray-300 pb-1 mb-2">
                  가스: {result.gasCarbon} kgCO₂
                </li>
                <li className="text-sm border-b border-gray-300 pb-1 mb-2">
                  물: {result.waterCarbon} kgCO₂
                </li>
                <li className="text-sm border-b border-gray-300 pb-1 mb-2">
                  연료: {result.fuelCarbon} kgCO₂
                </li>
                <li className="text-sm">폐기물: {result.wasteCarbon} kgCO₂</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CarbonTracker;
