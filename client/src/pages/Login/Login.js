import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
  const [email, setLoginid] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:5000/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();

        // 로그인 성공 시 사용자 정보 저장
        localStorage.clear(); // 기존 데이터 초기화
        localStorage.setItem("userEmail", data.user.email);
        localStorage.setItem("userClass", data.user.class);
        localStorage.setItem("isAdmin", data.user.isAdmin);

        console.log("로그인 성공 - 저장된 사용자 정보:", {
          email: data.user.email,
          class: data.user.class,
          isAdmin: data.user.isAdmin,
        });

        navigate("/Home");
      } else {
        const errorData = await response.json();
        alert(errorData.message);
      }
    } catch (error) {
      console.error("로그인 에러:", error);
      alert("로그인 중 오류가 발생했습니다.");
    }
  };

  const handleSignUpRedirect = () => {
    navigate("/signup");
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 bg-white shadow-lg rounded-lg">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
          로그인
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              htmlFor="loginid"
              className="block text-sm font-semibold text-gray-700"
            >
              이메일
            </label>
            <input
              type="text"
              id="email"
              value={email}
              onChange={(e) => setLoginid(e.target.value)}
              placeholder="이메일"
              className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>

          <div className="mb-6">
            <label
              htmlFor="password"
              className="block text-sm font-semibold text-gray-700"
            >
              비밀번호
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호"
              className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm text-center mb-4">{error}</p>
          )}

          <button
            type="submit"
            className="w-full py-3 px-4 bg-green-500 text-white font-semibold rounded-md hover:bg-green-600 transition duration-300"
          >
            로그인
          </button>
        </form>

        <div className="text-center mt-4">
          <small className="text-gray-600">
            계정이 없으신가요?{" "}
            <button
              onClick={handleSignUpRedirect}
              className="text-green-500 font-semibold hover:text-green-600"
            >
              회원가입
            </button>
          </small>
        </div>
      </div>
    </div>
  );
}

export default Login;
