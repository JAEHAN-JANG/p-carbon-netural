import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();
  const [userClass, setUserClass] = useState(null);
  const [username, setUsername] = useState("");

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch(
          "http://localhost:5000/auth/check-session",
          {
            method: "GET",
            credentials: "include",
          }
        );

        if (response.ok) {
          const data = await response.json();
          setUserClass(data.user?.class);
          setUsername(data.user?.username);
        } else {
          if (response.status === 401) {
            alert("세션이 만료되었습니다.");
            navigate("/");
          }
        }
      } catch (error) {
        console.error("세션 체크 중 오류:", error);
        alert("서버와의 연결에 문제가 발생했습니다.");
      }
    };

    checkSession();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      const response = await fetch("http://localhost:5000/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      if (response.ok) {
        alert("로그아웃 되었습니다.");
        navigate("/login");
      } else {
        const data = await response.json();
        alert(data.message || "로그아웃에 실패했습니다.");
      }
    } catch (error) {
      console.error("로그아웃 중 오류:", error);
      alert("서버와의 연결에 문제가 발생했습니다.");
    }
  };

  return (
    <header className="flex items-center justify-between bg-[#f8fbf9] whitespace-nowrap border-b border-solid border-b-[#b4c4c4] px-10 py-3">
      <div className="flex items-center gap-4 text-[#0e1b13]">
        <h2 className="text-2xl"> 🌍 </h2>
        <h2 className="text-2xl font-bold leading-tight tracking-[-0.015em]">
          <a
            href="/home"
            className="bg-gradient-to-r from-green-500 via-blue-600 to-teal-500 bg-clip-text text-transparent"
          >
            Carbon Tracker
          </a>
        </h2>
      </div>

      <div className="flex flex-1 justify-end gap-8">
        <div className="flex items-center gap-9">
          {/* 사용자 화면 */}
          {userClass === "MBR" && (
            <>
              <Link
                to="/carbonManaged"
                className="text-[#4A5568] text-l font-bold leading-normal hover:text-[#68D391] transition-all duration-300 ease-in-out"
              >
                탄소 배출 관리
              </Link>

              <Link
                to="/neutralization"
                className="text-[#4A5568] text-l font-bold leading-normal hover:text-[#68D391] transition-all duration-300 ease-in-out"
              >
                중립화 지원 AI
              </Link>

              <Link
                to="/EcoStore"
                className="text-[#4A5568] text-l font-bold leading-normal hover:text-[#68D391] transition-all duration-300 ease-in-out"
              >
                Eco 스토어
              </Link>

              <Link
                to="/community"
                className="text-[#4A5568] text-l font-bold leading-normal hover:text-[#68D391] transition-all duration-300 ease-in-out"
              >
                커뮤니티
              </Link>

              <Link
                to="/userEvidence"
                className="text-[#4A5568] text-l font-bold leading-normal hover:text-[#68D391] transition-all duration-300 ease-in-out"
              >
                증빙자료 제출
              </Link>

              <Link
                to="/profile"
                className="text-[#4A5568] text-l font-bold leading-normal hover:text-[#68D391] transition-all duration-300 ease-in-out"
              >
                마이페이지
              </Link>
            </>
          )}

          {/* 관리자 화면 */}
          {userClass === "MNG" && (
            <>
              <Link
                to="/category/list"
                className="text-[#4A5568] text-l font-bold leading-normal hover:text-[#68D391] transition-all duration-300 ease-in-out"
              >
                상품 분류 관리
              </Link>

              <Link
                to="/product/list"
                className="text-[#4A5568] text-l font-bold leading-normal hover:text-[#68D391] transition-all duration-300 ease-in-out"
              >
                상품 관리
              </Link>

              <Link
                to="/community"
                className="text-[#4A5568] text-l font-bold leading-normal hover:text-[#68D391] transition-all duration-300 ease-in-out"
              >
                커뮤니티 관리
              </Link>

              <Link
                to="/EvidenceManagement"
                className="text-[#4A5568] text-l font-bold leading-normal hover:text-[#68D391] transition-all duration-300 ease-in-out"
              >
                증빙자료 제출 관리
              </Link>

              <Link
                to="/PointCriteriaAdmin"
                className="text-[#4A5568] text-l font-bold leading-normal hover:text-[#68D391] transition-all duration-300 ease-in-out"
              >
                포인트 지급 기준 관리
              </Link>

              <Link
                to="/userManage"
                className="text-[#4A5568] text-l font-bold leading-normal hover:text-[#68D391] transition-all duration-300 ease-in-out"
              >
                회원 관리
              </Link>
            </>
          )}
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleLogout}
            className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 bg-[#68D391] text-white text-sm font-bold leading-normal tracking-[0.015em] hover:bg-[#48BB78] hover:text-white transition-all duration-300 ease-in-out"
          >
            <span className="truncate">
              {userClass ? `로그아웃 (${username})` : "로그아웃"}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
