import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";

function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b white">
      {/* 내부 레이아웃 */}
      <div className="w-full mx-auto flex flex-col min-h-full">
        {" "}
        {/* 상단 내비게이션 (고정) */}
        <Navbar />
        {/* 자식 컴포넌트 출력 */}
        <div className="flex-grow mt-0">
          {" "}
          <Outlet /> {/* 자식 컴포넌트 렌더링 */}
        </div>
      </div>

      {/* 하단 푸터 */}
      <Footer />
    </div>
  );
}

export default Layout;
