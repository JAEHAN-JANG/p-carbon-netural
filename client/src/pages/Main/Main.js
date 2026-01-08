import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

function Main() {
  const [weatherData, setWeatherData] = useState(null);
  const [location, setLocation] = useState({ latitude: null, longitude: null });
  const [locationName, setLocationName] = useState("");
  const [error, setError] = useState(null);

  const API_KEY = "1034b2f3c15c7889f413fbc5bd6e73b5";

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          setError(
            "Failed to fetch location. Please enable location permissions."
          );
          console.error("Geolocation Error: ", error);
        }
      );
    } else {
      setError("Geolocation is not supported by your browser.");
    }
  }, []);

  const fetchWeatherData = async () => {
    if (location.latitude && location.longitude) {
      try {
        const response = await axios.get(
          `https://api.openweathermap.org/data/2.5/weather`,
          {
            params: {
              lat: location.latitude,
              lon: location.longitude,
              appid: API_KEY,
              units: "metric",
              lang: "kr",
            },
          }
        );
        setWeatherData(response.data);
        fetchLocationName(location.latitude, location.longitude);
      } catch (error) {
        setError("Failed to fetch weather data.");
        console.error("Error fetching weather data:", error);
      }
    }
  };

  const fetchLocationName = async (latitude, longitude) => {
    try {
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/reverse`,
        {
          params: {
            lat: latitude,
            lon: longitude,
            format: "json",
            "accept-language": "ko",
          },
        }
      );
      setLocationName(
        response.data.address.city ||
          response.data.address.town ||
          response.data.address.village ||
          "Unknown Location"
      );
    } catch (error) {
      console.error("Error fetching location name:", error);
      setLocationName("Failed to fetch location name.");
    }
  };

  useEffect(() => {
    if (location.latitude && location.longitude) {
      fetchWeatherData();
    }
  }, [location]);

  const getWeatherIcon = (weather) => {
    if (weather.includes("맑음")) {
      return "☀️";
    } else if (weather.includes("흐림")) {
      return "☁️";
    } else if (weather.includes("비")) {
      return "🌧️";
    } else if (weather.includes("눈")) {
      return "❄️";
    } else {
      return "🌤️";
    }
  };

  const weatherIcon = weatherData
    ? getWeatherIcon(weatherData.weather[0].description)
    : "";

  const recommendations = weatherData
    ? {
        message:
          weatherData.main.temp < 15
            ? "난방 적정 온도는 22-24°C 입니다."
            : weatherData.main.temp > 25
            ? "냉방 적정 온도는 26-28°C 입니다."
            : "현재 온도는 냉난방이 필요하지 않습니다.",
        carbonReduction:
          weatherData.main.temp < 15 || weatherData.main.temp > 25
            ? "적정 온도를 유지하면 약 10% 탄소 배출 감소 효과가 있습니다."
            : "현재 최적의 온도로 에너지 소비를 줄일 수 있습니다.",
      }
    : null;

  return (
    <div
      className="relative flex size-full min-h-screen flex-col bg-[#f8fbf9] group/design-root overflow-x-hidden"
      style={{
        fontFamily: "Space Grotesk, Noto Sans, sans-serif",
        backgroundColor: "#f8fbf9",
      }}
    >
      <nav
        className="flex items-center justify-between px-8 py-4"
        style={{ borderBottom: "2px solid #d1d5db" }}
      >
        <div className="text-xl font-bold">Carbon Tracker</div>
      </nav>

      <div className="flex min-h-[calc(100vh-80px)]">
        <div className="w-1/2 p-12 flex flex-col items-start justify-center gap-y-8">
          <h1 className="text-6xl font-bold text-[#0e1b13] text-left">
            환경을 지키는<br />
            작은 발걸음
          </h1>
          <p className="text-xl max-w-md text-[#0e1b13] text-left">
            Carbon Tracker는 탄소 배출량을 계산하고, 중립화 방안을 제공하여 지속 가능한 삶을 도울 수 있는 플랫폼입니다.
          </p>
          <p className="text-lg max-w-md text-gray-600 text-left">
            우리 서비스는 환경 보호를 위한 행동 지침과 목표 설정을 지원하며, 탄소 배출 감소를 통해 모두가 함께하는 친환경 미래를 만들어 갑니다.
          </p>
          <div className="flex gap-4 items-center">
            <Link
              to="/signup"
              className="flex items-center gap-2 text-lg font-semibold bg-[#1cca59] text-[#0e1b13] px-6 py-3 rounded-full hover:bg-[#16a34a] hover:text-white transition-colors"
            >
              회원가입
            </Link>
            <Link
              to="/login"
              className="flex items-center gap-2 text-lg font-semibold bg-[#1cca59] text-[#0e1b13] px-6 py-3 rounded-full hover:bg-[#16a34a] hover:text-white transition-colors"
            >
              로그인
            </Link>
          </div>
        </div>

        <div className="w-1/2 bg-green-100 relative overflow-hidden">
          <img
            src="/home2.png"
            alt="Eco Friendly"
            className="absolute inset-0 w-full h-full object-cover"
          />
          {weatherData && (
            <div
              className="absolute top-4 right-4 text-base"
              style={{
                backgroundColor: "transparent",
                color: "#ffffff",
                textShadow: "1px 1px 4px rgba(0, 0, 0, 0.8)",
                lineHeight: "1.8",
              }}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="text-5xl" style={{ color: "#ffd700" }}>
                  {weatherIcon}
                </div>
                <p className="text-xl font-semibold" style={{ color: "#ffffff" }}>
                  {locationName}
                </p>
              </div>
              <div className="flex flex-col items-end">
                <p>온도: {weatherData.main.temp}°C</p>
                <p>날씨: {weatherData.weather[0].description}</p>
                <p className="text-sm mt-2">{recommendations.message}</p>
                <p className="text-sm">{recommendations.carbonReduction}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Main;

// 위치명 및 명칭 한글 변환 -> Nominatim API
// 위치 정보 -> Geolocation API
// 날씨 정보 -> OpenWeatherMap API