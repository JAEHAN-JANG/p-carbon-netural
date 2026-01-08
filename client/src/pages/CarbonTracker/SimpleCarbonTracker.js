import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function SimpleCarbonTracker() {
  const [userEmail, setUserEmail] = useState("");
  const [, setUserName] = useState("");
  const navigate = useNavigate();
  const [result, setResult] = useState(null);

  // 생로운 상태들 추가
  const [electricityHabits, setElectricityHabits] = useState({
    heatingHours: 'none',     
    coolingHours: 'none',     
    homeSize: 'none',         
    applianceUsage: 'medium'  
  });

  const [gasHabits, setGasHabits] = useState({
    cookingFreq: 'none',      
    hotWaterUsage: 'none',    
    heatingType: 'gas'        
  });

  const [waterHabits, setWaterHabits] = useState({
    showerFreq: 'none',       
    showerDuration: 'none',   
    laundryFreq: 'medium',    
    dishwasherFreq: 'medium'  
  });

  const [transportHabits, setTransportHabits] = useState({
    carUsageFreq: 'none',    
    averageDistance: 'none', 
    fuelType: 'none'         
  });

  const [wasteHabits, setWasteHabits] = useState({
    generalWaste: 'none',    
    recycling: 'none',       
    foodWaste: 'none'        
  });

  useEffect(() => {
    const fetchUserName = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/auth/check-session",
          { withCredentials: true }
        );
        if (response.data.loggedIn) {
          setUserName(response.data.user.username);
          setUserEmail(response.data.user.email);
        } else {
          alert("로그인이 필요합니다.");
          navigate("/login");
        }
      } catch (error) {
        console.error("사용자 정보를 가져오는 데 실패했습니다.", error);
        alert("사용자 정보를 불러오지 못했습니다. 다시 시도해주세요.");
      }
    };

    fetchUserName();
  }, [navigate]);

  // 초기화 함수 수정
  const handleReset = () => {
    setElectricityHabits({
      heatingHours: 'none',      
      coolingHours: 'none',      
      homeSize: 'none',         
    });
    
    setGasHabits({
      cookingFreq: 'none',        
      hotWaterUsage: 'none',    
    });
    
    setWaterHabits({
      showerFreq: 'none',        
      showerDuration: 'none',   
    });
    
    setTransportHabits({
      carUsageFreq: 'none',     
      averageDistance: 'none',   
      fuelType: 'none'           
    });
    
    setWasteHabits({
      generalWaste: 'none',     
    });
    
    setResult(null);
  };


  const calculateSimpleEmissions = () => {

    const electricityUsage = calculateElectricityEmissions();
    const gasUsage = calculateGasEmissions();
    const waterUsage = calculateWaterEmissions();
    const fuelUsage = calculateFuelEmissions();
    const wasteEmissions = calculateWasteEmissions();

    const totalCarbon = (
      electricityUsage +
      gasUsage +
      waterUsage +
      fuelUsage +
      wasteEmissions
    ).toFixed(2);

    const treeLoss = (totalCarbon / 5.6).toFixed(2);

    setResult({
      electricityCarbon: electricityUsage.toFixed(2),
      gasCarbon: gasUsage.toFixed(2),
      waterCarbon: waterUsage.toFixed(2),
      fuelCarbon: fuelUsage.toFixed(2),
      wasteCarbon: wasteEmissions.toFixed(2),
      totalCarbon,
      treeLoss
    });
  };

  // 각 항목별 계산 함수들
  const calculateElectricityEmissions = () => {
    const baseElectricity = {
      small: 250,    // 60m² 이하
      medium: 350,   // 60-85m²
      large: 450     // 85m² 이상
    }[electricityHabits.homeSize] || 0;  // none인 경우 0 반환

    const heatingCoolingFactor = {
      none: 0,    
      low: 1.2,
      medium: 1.4,
      high: 1.6
    };

    const totalUsage = baseElectricity * 
      ((heatingCoolingFactor[electricityHabits.heatingHours] + 
        heatingCoolingFactor[electricityHabits.coolingHours]) / 2);

    return totalUsage * 0.4781;
  };

  const calculateGasEmissions = () => {
    // 기본 월간 가스 사용량 (m³)
    const baseGas = {
      gas: 35,       // 가스 보일러
      electric: 10,  // 전기 보일러
      hybrid: 25     // 하이브리드
    }[gasHabits.heatingType];

    // 취사 사용 계수
    const cookingFactor = {
      low: 0.8,
      medium: 1,
      high: 1.3
    };

    // 온수 사용 계수
    const hotWaterFactor = {
      low: 0.7,
      medium: 1,
      high: 1.4
    };

    // 총 가스 사용량 계산
    const totalUsage = baseGas * 
      cookingFactor[gasHabits.cookingFreq] *
      hotWaterFactor[gasHabits.hotWaterUsage];

    // CO2 배출량 계산 (도시가스 배출계수: 2.176 kgCO2/m³)
    return totalUsage * 2.176;
  };

  const calculateWaterEmissions = () => {
    if (waterHabits.showerFreq === 'none' || waterHabits.showerDuration === 'none') {
      return 0;
    }

    const baseWater = 15;

    const showerFactor = {
      daily: { short: 1.2, medium: 1.5, long: 1.8 },
      often: { short: 1, medium: 1.3, long: 1.6 },
      rarely: { short: 0.8, medium: 1, long: 1.2 }
    };

    const totalUsage = baseWater * 
      (showerFactor[waterHabits.showerFreq]?.[waterHabits.showerDuration] || 0);

    return totalUsage * 0.237;
  };

  const calculateFuelEmissions = () => {
    if (transportHabits.fuelType === 'none' || 
        transportHabits.carUsageFreq === 'none' || 
        transportHabits.averageDistance === 'none') {
      return 0;
    }

    const baseFuel = 60;
    const fuelEmissionFactor = {
      gasoline: 2.097,
      diesel: 2.582,
      lpg: 1.868,
      none: 0
    };

    const usageFreqFactor = {
      daily: 1,
      often: 0.7,
      weekly: 0.3,
      none: 0
    };

    const distanceFactor = {
      short: 0.7,
      medium: 1,
      long: 1.5,
      none: 0
    };

    const totalUsage = baseFuel * 
      usageFreqFactor[transportHabits.carUsageFreq] *
      distanceFactor[transportHabits.averageDistance];

    return totalUsage * (fuelEmissionFactor[transportHabits.fuelType] || 0);
  };

  const calculateWasteEmissions = () => {
    // 기본 월간 쓰레기 배출량 (kg)
    const baseGeneralWaste = {
      low: 15,      // 5L 이하
      medium: 30,   // 5-10L
      high: 45      // 10L 이상
    }[wasteHabits.generalWaste] || 0;

    // 재활용 분리수거 습관에 따른 계수
    const recyclingFactor = {
      good: 0.7,    // 잘함 (30% 감소)
      medium: 1,    // 보통
      poor: 1.3     // 미흡 (30% 증가)
    }[wasteHabits.recycling] || 0;

    // 음식물 쓰레기 배출량 (kg)
    const foodWasteAmount = {
      low: 5,       // 2kg 이하
      medium: 10,   // 2-5kg
      high: 15      // 5kg 이상
    }[wasteHabits.foodWaste] || 0;

    // 일반 쓰레기 배출량 계산
    const generalWasteEmissions = baseGeneralWaste * recyclingFactor * 0.327; // 0.327 kgCO2/kg
    // 음식물 쓰레기 배출량 계산
    const foodWasteEmissions = foodWasteAmount * 0.682; // 0.682 kgCO2/kg (음식물 쓰레기 배출계수)

    return generalWasteEmissions + foodWasteEmissions;
  };

  const handleCalculate = (e) => {
    e.preventDefault();

    // 모든 필수 항목이 선택되었는지 확인
    const checks = [
      // 전기 사용 체크
      electricityHabits.heatingHours === 'none' && 
      electricityHabits.coolingHours === 'none' && 
      electricityHabits.homeSize === 'none',

      // 가스 사용 체크
      gasHabits.cookingFreq === 'none' && 
      gasHabits.hotWaterUsage === 'none',

      // 물 사용 체크
      waterHabits.showerFreq === 'none' && 
      waterHabits.showerDuration === 'none',

      // 차량 이용 체크 - 이용안함 선택시 추가 선택 불필요
      transportHabits.carUsageFreq === 'none' ? 
        false : // 차량을 이용하지 않으면 체크 통과
        (transportHabits.carUsageFreq === 'none' || // 차량을 이용하는 경우 모든 항목 체크
         transportHabits.fuelType === 'none' ||
         transportHabits.averageDistance === 'none'),

      // 폐기물 체크
      wasteHabits.generalWaste === 'none' ||
      wasteHabits.recycling === 'none' ||
      wasteHabits.foodWaste === 'none'
    ];

    if (checks.some(check => check)) {
      alert("모든 항목을 선택해주세요.");
      return;
    }

    calculateSimpleEmissions();
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
  

  const saveResultsToDatabase = async () => {
    if (!result || !userEmail) return;

    try {
      const response = await axios.post(
        "http://localhost:5000/track/carbon-emissions",
        {
          user_email: userEmail,
          electricity: result.electricityCarbon,
          gas: result.gasCarbon,
          water: result.waterCarbon,
          fuel: result.fuelCarbon,
          waste: result.wasteCarbon,
          total_carbon: result.totalCarbon,
          tree_loss: result.treeLoss,
          month: new Date().getMonth() + 1,
          year: new Date().getFullYear(),
          is_simple_calculation: true,
        }
      );

      if (response.status === 200) {
        alert("탄소 배출량 결과가 저장되었습니다.");
        navigate("/CarbonManaged");
      }
    } catch (error) {
      console.error("이미 해당 월 데이터가 존재합니다.", error);
      alert("이미 해당 월 데이터가 존재합니다.");
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fbf9] py-10">
      <div className="max-w-4xl mx-auto bg-white p-8 shadow-md rounded-md">
        <h1 className="text-2xl font-bold text-blue-600 text-center mb-6">
          간편 탄소 배출량 계산기
        </h1>
        <p className="text-center text-gray-600 mb-8">
          일상생활 습관을 통해 대략적인 탄소 배출량을 계산해보세요.
        </p>

        <form onSubmit={handleCalculate} className="space-y-8">
          {/* 전기 사용 섹션 */}
          <section className="space-y-4 border-b pb-6">
            <h2 className="text-xl font-semibold text-gray-700">전기 사용</h2>
            
            {/* 난방 사용 시간 */}
            <div className="space-y-4">
              <label className="block text-gray-700">
                난방 사용 시간 (하루 평균)
              </label>
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => setElectricityHabits({...electricityHabits, heatingHours: 'none'})}
                  className={`flex-1 py-2 px-4 rounded-lg ${
                    electricityHabits.heatingHours === 'none'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  사용안함
                </button>
                <button
                  type="button"
                  onClick={() => setElectricityHabits({...electricityHabits, heatingHours: 'low'})}
                  className={`flex-1 py-2 px-4 rounded-lg ${
                    electricityHabits.heatingHours === 'low'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  1-3시간
                </button>
                <button
                  type="button"
                  onClick={() => setElectricityHabits({...electricityHabits, heatingHours: 'medium'})}
                  className={`flex-1 py-2 px-4 rounded-lg ${
                    electricityHabits.heatingHours === 'medium'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  4-8시간
                </button>
                <button
                  type="button"
                  onClick={() => setElectricityHabits({...electricityHabits, heatingHours: 'high'})}
                  className={`flex-1 py-2 px-4 rounded-lg ${
                    electricityHabits.heatingHours === 'high'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  8시간 이상
                </button>
              </div>
            </div>

            {/* 냉방 사용 시간 */}
            <div className="space-y-4">
              <label className="block text-gray-700">
                냉방 사용 시간 (하루 평균)
              </label>
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => setElectricityHabits({...electricityHabits, coolingHours: 'none'})}
                  className={`flex-1 py-2 px-4 rounded-lg ${
                    electricityHabits.coolingHours === 'none'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  사용안함
                </button>
                <button
                  type="button"
                  onClick={() => setElectricityHabits({...electricityHabits, coolingHours: 'low'})}
                  className={`flex-1 py-2 px-4 rounded-lg ${
                    electricityHabits.coolingHours === 'low'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  1-3시간
                </button>
                <button
                  type="button"
                  onClick={() => setElectricityHabits({...electricityHabits, coolingHours: 'medium'})}
                  className={`flex-1 py-2 px-4 rounded-lg ${
                    electricityHabits.coolingHours === 'medium'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  4-8시간
                </button>
                <button
                  type="button"
                  onClick={() => setElectricityHabits({...electricityHabits, coolingHours: 'high'})}
                  className={`flex-1 py-2 px-4 rounded-lg ${
                    electricityHabits.coolingHours === 'high'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  8시간 이상
                </button>
              </div>
            </div>

            {/* 주거 공간 크기 */}
            <div className="space-y-4">
              <label className="block text-gray-700">
                주거 공간의 크기는?
              </label>
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => setElectricityHabits({...electricityHabits, homeSize: 'small'})}
                  className={`flex-1 py-2 px-4 rounded-lg ${
                    electricityHabits.homeSize === 'small'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  60m² 이하
                </button>
                <button
                  type="button"
                  onClick={() => setElectricityHabits({...electricityHabits, homeSize: 'medium'})}
                  className={`flex-1 py-2 px-4 rounded-lg ${
                    electricityHabits.homeSize === 'medium'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  60-85m²
                </button>
                <button
                  type="button"
                  onClick={() => setElectricityHabits({...electricityHabits, homeSize: 'large'})}
                  className={`flex-1 py-2 px-4 rounded-lg ${
                    electricityHabits.homeSize === 'large'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  85m² 이상
                </button>
              </div>
            </div>
          </section>

          {/* 가스 사용 섹션 */}
          <section className="space-y-4 border-b pb-6">
            <h2 className="text-xl font-semibold text-gray-700">가스 사용</h2>
            
            {/* 취사 빈도 */}
            <div className="space-y-4">
              <label className="block text-gray-700">
                하루 평균 요리 횟수?
              </label>
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => setGasHabits({...gasHabits, cookingFreq: 'low'})}
                  className={`flex-1 py-2 px-4 rounded-lg ${
                    gasHabits.cookingFreq === 'low'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  1회 이하
                </button>
                <button
                  type="button"
                  onClick={() => setGasHabits({...gasHabits, cookingFreq: 'medium'})}
                  className={`flex-1 py-2 px-4 rounded-lg ${
                    gasHabits.cookingFreq === 'medium'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  2-3회
                </button>
                <button
                  type="button"
                  onClick={() => setGasHabits({...gasHabits, cookingFreq: 'high'})}
                  className={`flex-1 py-2 px-4 rounded-lg ${
                    gasHabits.cookingFreq === 'high'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  4회 이상
                </button>
              </div>
            </div>

            {/* 온수 사용 */}
            <div className="space-y-4">
              <label className="block text-gray-700">
                온수 사용 빈도는?
              </label>
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => setGasHabits({...gasHabits, hotWaterUsage: 'low'})}
                  className={`flex-1 py-2 px-4 rounded-lg ${
                    gasHabits.hotWaterUsage === 'low'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  매일
                </button>
                <button
                  type="button"
                  onClick={() => setGasHabits({...gasHabits, hotWaterUsage: 'medium'})}
                  className={`flex-1 py-2 px-4 rounded-lg ${
                    gasHabits.hotWaterUsage === 'medium'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  2-3일에 한번
                </button>
                <button
                  type="button"
                  onClick={() => setGasHabits({...gasHabits, hotWaterUsage: 'high'})}
                  className={`flex-1 py-2 px-4 rounded-lg ${
                    gasHabits.hotWaterUsage === 'high'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  주 1-2회
                </button>
              </div>
            </div>
          </section>

          {/* 물 사용 섹션 */}
          <section className="space-y-4 border-b pb-6">
            <h2 className="text-xl font-semibold text-gray-700">물 사용</h2>
            
            {/* 샤워 빈도 */}
            <div className="space-y-4">
              <label className="block text-gray-700">
                샤워 빈도는?
              </label>
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => setWaterHabits({...waterHabits, showerFreq: 'daily'})}
                  className={`flex-1 py-2 px-4 rounded-lg ${
                    waterHabits.showerFreq === 'daily'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  매일
                </button>
                <button
                  type="button"
                  onClick={() => setWaterHabits({...waterHabits, showerFreq: 'often'})}
                  className={`flex-1 py-2 px-4 rounded-lg ${
                    waterHabits.showerFreq === 'often'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  주 3-4회
                </button>
                <button
                  type="button"
                  onClick={() => setWaterHabits({...waterHabits, showerFreq: 'rarely'})}
                  className={`flex-1 py-2 px-4 rounded-lg ${
                    waterHabits.showerFreq === 'rarely'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  거의 안함
                </button>
              </div>
            </div>

            {/* 샤워 시간 */}
            <div className="space-y-4">
              <label className="block text-gray-700">
                평균 샤워 시간은?
              </label>
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => setWaterHabits({...waterHabits, showerDuration: 'short'})}
                  className={`flex-1 py-2 px-4 rounded-lg ${
                    waterHabits.showerDuration === 'short'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  짧음
                </button>
                <button
                  type="button"
                  onClick={() => setWaterHabits({...waterHabits, showerDuration: 'medium'})}
                  className={`flex-1 py-2 px-4 rounded-lg ${
                    waterHabits.showerDuration === 'medium'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  보통
                </button>
                <button
                  type="button"
                  onClick={() => setWaterHabits({...waterHabits, showerDuration: 'long'})}
                  className={`flex-1 py-2 px-4 rounded-lg ${
                    waterHabits.showerDuration === 'long'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  길음
                </button>
              </div>
            </div>
          </section>

          {/* 차량 이용 섹션 */}
          <section className="space-y-4 border-b pb-6">
            <h2 className="text-xl font-semibold text-gray-700">차량 이용</h2>
            
            {/* 차량 이용 빈도 */}
            <div className="space-y-4">
              <label className="block text-gray-700">
                차량 이용 빈도는?
              </label>
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => setTransportHabits({
                    ...transportHabits, 
                    carUsageFreq: 'none',
                    fuelType: 'none',
                    averageDistance: 'none'
                  })}
                  className={`flex-1 py-2 px-4 rounded-lg ${
                    transportHabits.carUsageFreq === 'none'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  이용안함
                </button>
                <button
                  type="button"
                  onClick={() => setTransportHabits({...transportHabits, carUsageFreq: 'weekly'})}
                  className={`flex-1 py-2 px-4 rounded-lg ${
                    transportHabits.carUsageFreq === 'weekly'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  주 1-2회
                </button>
                <button
                  type="button"
                  onClick={() => setTransportHabits({...transportHabits, carUsageFreq: 'often'})}
                  className={`flex-1 py-2 px-4 rounded-lg ${
                    transportHabits.carUsageFreq === 'often'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  주 3-4회
                </button>
                <button
                  type="button"
                  onClick={() => setTransportHabits({...transportHabits, carUsageFreq: 'daily'})}
                  className={`flex-1 py-2 px-4 rounded-lg ${
                    transportHabits.carUsageFreq === 'daily'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  매일
                </button>
              </div>
            </div>

            {/* 차량을 이용하는 경우에만 표시 */}
            {transportHabits.carUsageFreq !== 'none' && (
              <>
                {/* 연료 종류 */}
                <div className="space-y-4">
                  <label className="block text-gray-700">
                    차량 연료 종류는?
                  </label>
                  <div className="flex space-x-4">
                    <button
                      type="button"
                      onClick={() => setTransportHabits({...transportHabits, fuelType: 'gasoline'})}
                      className={`flex-1 py-2 px-4 rounded-lg ${
                        transportHabits.fuelType === 'gasoline'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      휘발유
                    </button>
                    <button
                      type="button"
                      onClick={() => setTransportHabits({...transportHabits, fuelType: 'diesel'})}
                      className={`flex-1 py-2 px-4 rounded-lg ${
                        transportHabits.fuelType === 'diesel'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      경유
                    </button>
                    <button
                      type="button"
                      onClick={() => setTransportHabits({...transportHabits, fuelType: 'lpg'})}
                      className={`flex-1 py-2 px-4 rounded-lg ${
                        transportHabits.fuelType === 'lpg'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      LPG
                    </button>
                  </div>
                </div>

                {/* 주행 거리 */}
                <div className="space-y-4">
                  <label className="block text-gray-700">
                    하루 평균 주행거리는?
                  </label>
                  <div className="flex space-x-4">
                    <button
                      type="button"
                      onClick={() => setTransportHabits({...transportHabits, averageDistance: 'short'})}
                      className={`flex-1 py-2 px-4 rounded-lg ${
                        transportHabits.averageDistance === 'short'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      20km 미만
                    </button>
                    <button
                      type="button"
                      onClick={() => setTransportHabits({...transportHabits, averageDistance: 'medium'})}
                      className={`flex-1 py-2 px-4 rounded-lg ${
                        transportHabits.averageDistance === 'medium'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      20-50km
                    </button>
                    <button
                      type="button"
                      onClick={() => setTransportHabits({...transportHabits, averageDistance: 'long'})}
                      className={`flex-1 py-2 px-4 rounded-lg ${
                        transportHabits.averageDistance === 'long'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      50km 이상
                    </button>
                  </div>
                </div>
              </>
            )}
          </section>

          {/* 폐기물 배출 섹션 */}
          <section className="space-y-4 border-b pb-6">
            <h2 className="text-xl font-semibold text-gray-700">쓰레기 배출</h2>
            
            {/* 일반 쓰레기 */}
            <div className="space-y-4">
              <label className="block text-gray-700">
                일반 쓰레기는 얼마나 배출하시나요? (일주일 기준)
              </label>
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => setWasteHabits({...wasteHabits, generalWaste: 'low'})}
                  className={`flex-1 py-2 px-4 rounded-lg ${
                    wasteHabits.generalWaste === 'low'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  5L 이하
                </button>
                <button
                  type="button"
                  onClick={() => setWasteHabits({...wasteHabits, generalWaste: 'medium'})}
                  className={`flex-1 py-2 px-4 rounded-lg ${
                    wasteHabits.generalWaste === 'medium'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  5-10L
                </button>
                <button
                  type="button"
                  onClick={() => setWasteHabits({...wasteHabits, generalWaste: 'high'})}
                  className={`flex-1 py-2 px-4 rounded-lg ${
                    wasteHabits.generalWaste === 'high'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  10L 이상
                </button>
              </div>
            </div>

            {/* 재활용 분리수거 */}
            <div className="space-y-4">
              <label className="block text-gray-700">
                재활용 분리수거는 얼마나 철저히 하시나요?
              </label>
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => setWasteHabits({...wasteHabits, recycling: 'good'})}
                  className={`flex-1 py-2 px-4 rounded-lg ${
                    wasteHabits.recycling === 'good'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  항상 철저히
                </button>
                <button
                  type="button"
                  onClick={() => setWasteHabits({...wasteHabits, recycling: 'medium'})}
                  className={`flex-1 py-2 px-4 rounded-lg ${
                    wasteHabits.recycling === 'medium'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  가끔 섞여감
                </button>
                <button
                  type="button"
                  onClick={() => setWasteHabits({...wasteHabits, recycling: 'poor'})}
                  className={`flex-1 py-2 px-4 rounded-lg ${
                    wasteHabits.recycling === 'poor'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  거의 안함
                </button>
              </div>
            </div>

            {/* 음식물 쓰레기 */}
            <div className="space-y-4">
              <label className="block text-gray-700">
                음식물 쓰레기는 얼마나 배출하시나요? (일주일 기준)
              </label>
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => setWasteHabits({...wasteHabits, foodWaste: 'low'})}
                  className={`flex-1 py-2 px-4 rounded-lg ${
                    wasteHabits.foodWaste === 'low'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  2kg 이하
                </button>
                <button
                  type="button"
                  onClick={() => setWasteHabits({...wasteHabits, foodWaste: 'medium'})}
                  className={`flex-1 py-2 px-4 rounded-lg ${
                    wasteHabits.foodWaste === 'medium'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  2-5kg
                </button>
                <button
                  type="button"
                  onClick={() => setWasteHabits({...wasteHabits, foodWaste: 'high'})}
                  className={`flex-1 py-2 px-4 rounded-lg ${
                    wasteHabits.foodWaste === 'high'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  5kg 이상
                </button>
              </div>
            </div>
          </section>

          {/* 버튼 그룹 */}
          <div className="flex justify-start mt-8 space-x-4">
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition duration-300"
            >
              계산하기
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="px-6 py-2 bg-gray-500 text-white rounded-lg shadow-md hover:bg-gray-600 transition duration-300"
            >
              초기화
            </button>
            <button
              type="button"
              onClick={checkIfExists}
              className="px-6 py-2 bg-green-600 text-white rounded-lg shadow-md hover:bg-green-700 transition duration-300"
            >
              저장하기
            </button>
            <button
              type="button"
              onClick={() => navigate("/detailed-carbon-tracker")}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg shadow-md hover:bg-purple-700 transition duration-300"
            >
              더 정확한 계산하기
            </button>
          </div>
        </form>

        {result && (
          <div className="mt-10 bg-gray-100 p-6 rounded-lg shadow-inner flex justify-center items-start space-x-10 pl-1">
            {/* 왼쪽 영역: 배출량 이미지와 텍스트 */}
            <div className="flex flex-col items-center space-y-2 border-r border-gray-300 pr-10">
              <div className="flex items-center space-x-4">
                <div className="w-24 h-24 bg-gray-300 rounded-full overflow-hidden">
                  <img
                    src="./CO2.jpg"
                    alt="배출량 이미지"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="text-xl font-bold text-red-600">
                  배출량 결과
                </div>
              </div>
              <div className="text-4xl font-bold text-red-600">
                {result.totalCarbon} kg CO₂
              </div>
            </div>

            {/* 가운데 영역: 나무 손실 이미지와 텍스트 */}
            <div className="flex flex-col items-center space-y-2 border-r border-gray-300 px-10 pl-1">
              <div className="flex items-center space-x-4">
                <div className="w-24 h-24 bg-green-300 rounded-full overflow-hidden">
                  <img
                    src="./tree.png"
                    alt="나무 손실 이미지"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="text-xl font-bold text-green-600">
                  나무 손실
                </div>
              </div>
              <div className="text-4xl font-bold text-green-600">
                {result.treeLoss} 그루
              </div>
            </div>

            {/* 오른쪽 영역: 세부 항목들 */}
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
                <li className="text-sm">
                  폐기물: {result.wasteCarbon} kgCO₂
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default SimpleCarbonTracker; 