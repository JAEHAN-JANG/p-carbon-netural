import React, { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Neutralization from "./Neutralization";
import axios from "axios";

function ChatbotIcon() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [position, setPosition] = useState({
    x: window.innerWidth - 100,
    y: window.innerHeight - 100,
  });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [mouseDownPos, setMouseDownPos] = useState({ x: 0, y: 0 });
  const [userClass, setUserClass] = useState(null);
  const iconRef = useRef(null);
  const location = useLocation();

  const hideOnPaths = ["/", "/login", "/register", "/signup", "/signup2"];

  // 세션 체크하여 사용자 클래스 확인
  const checkSession = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/auth/check-session",
        {
          withCredentials: true,
        }
      );

      if (response.data.loggedIn) {
        setUserClass(response.data.user.class);
      } else {
        setUserClass(null);
      }
    } catch (error) {
      console.error("세션 확인 오류:", error);
      setUserClass(null);
    }
  };

  // 컴포넌트 마운트 시와 location 변경 시 세션 체크
  useEffect(() => {
    checkSession();
  }, [location.pathname]);

  // 주기적으로 세션 체크 (5초마다)
  useEffect(() => {
    const interval = setInterval(checkSession, 5000);
    return () => clearInterval(interval);
  }, []);

  // 드래그 이벤트 리스너
  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);

      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging]);

  // 로그인하지 않았거나, 관리자이거나, hideOnPaths에 포함된 경로면 챗봇 숨기기
  if (
    !userClass ||
    userClass === "MNG" ||
    hideOnPaths.includes(location.pathname)
  ) {
    return null;
  }

  // 드래그 시작
  const handleMouseDown = (e) => {
    if (iconRef.current) {
      const rect = iconRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
      setMouseDownPos({
        x: e.clientX,
        y: e.clientY,
      });
      setIsDragging(true);
    }
  };

  // 드래그 중
  const handleMouseMove = (e) => {
    if (isDragging) {
      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;

      const maxX = window.innerWidth - 64;
      const maxY = window.innerHeight - 64;

      setPosition({
        x: Math.min(Math.max(0, newX), maxX),
        y: Math.min(Math.max(0, newY), maxY),
      });
    }
  };

  // 드래그 종료
  const handleMouseUp = (e) => {
    if (isDragging) {
      // 마우스가 이동한 거리 계산
      const moveDistance = Math.sqrt(
        Math.pow(e.clientX - mouseDownPos.x, 2) +
          Math.pow(e.clientY - mouseDownPos.y, 2)
      );

      // 5픽셀 이하로 이동했다면 클릭으로 간주
      if (moveDistance < 5) {
        setIsModalOpen(true);
      }

      setIsDragging(false);
    }
  };

  return (
    <>
      {/* 챗봇 아이콘 */}
      <button
        ref={iconRef}
        onMouseDown={handleMouseDown}
        style={{
          position: "fixed",
          left: `${position.x}px`,
          top: `${position.y}px`,
          cursor: isDragging ? "grabbing" : "grab",
          touchAction: "none",
        }}
        className="w-16 h-16 bg-red-500 rounded-full shadow-lg flex items-center justify-center hover:bg-red-600 transition-colors z-50"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-8 w-8 text-white"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
          />
        </svg>
      </button>

      {/* 챗봇 모달 */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-[90%] max-w-2xl h-[80vh] relative flex flex-col">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
            <div className="flex-1 overflow-y-auto p-6">
              <Neutralization />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default ChatbotIcon;
