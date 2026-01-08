import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Signup() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [birth, setBirth] = useState("");
  const [tel, setTel] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // 회원가입 처리 함수
  const handleSignup = async (e) => {
    e.preventDefault();

    if (
      !email ||
      !username ||
      !birth ||
      !tel ||
      !password ||
      !confirmPassword
    ) {
      setError("모든 필드를 입력하세요.");
      return;
    }

    if (password !== confirmPassword) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }

    try {
      const response = await axios.post("http://localhost:5000/auth/signup", {
        email,
        username,
        birth,
        tel,
        password,
      });

      if (response.status === 200) {
        alert("회원가입 성공!");
        navigate("/login");
      }
    } catch (err) {
      setError("회원가입 실패. 다시 시도해주세요.");
      console.error("회원가입 오류:", err);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 bg-white shadow-lg rounded-lg">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
          회원가입
        </h2>
        <form onSubmit={handleSignup}>
          <div className="mb-4">
            <label
              htmlFor="email"
              className="block text-sm font-semibold text-gray-700"
            >
              이메일
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="이메일을 입력하세요."
              className="w-full p-3 border border-gray-300 rounded-md mt-2"
            />
          </div>

          <div className="mb-4">
            <label
              htmlFor="username"
              className="block text-sm font-semibold text-gray-700"
            >
              이름
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="이름을 입력하세요."
              className="w-full p-3 border border-gray-300 rounded-md mt-2"
            />
          </div>

          <div className="mb-4">
            <label
              htmlFor="birth"
              className="block text-sm font-semibold text-gray-700"
            >
              생년월일
            </label>
            <input
              type="date"
              id="birth"
              value={birth}
              onChange={(e) => setBirth(e.target.value)}
              placeholder="생년월일을 입력하세요."
              className="w-full p-3 border border-gray-300 rounded-md mt-2"
            />
          </div>

          <div className="mb-4">
            <label
              htmlFor="tel"
              className="block text-sm font-semibold text-gray-700"
            >
              휴대전화번호
            </label>
            <input
              type="text"
              id="tel"
              value={tel}
              onChange={(e) => setTel(e.target.value)}
              placeholder="휴대전화번호를 입력하세요."
              className="w-full p-3 border border-gray-300 rounded-md mt-2"
            />
          </div>

          <div className="mb-4">
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
              placeholder="비밀번호를 입력하세요."
              className="w-full p-3 border border-gray-300 rounded-md mt-2"
            />
          </div>

          <div className="mb-6">
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-semibold text-gray-700"
            >
              비밀번호 확인
            </label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="비밀번호를 확인하세요."
              className="w-full p-3 border border-gray-300 rounded-md mt-2"
            />
          </div>

          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

          <button
            type="submit"
            className="w-full p-3 bg-green-500 text-white text-lg font-semibold rounded-md hover:bg-green-600 transition duration-300"
          >
            회원가입
          </button>
        </form>

        <div className="text-center mt-4">
          <small className="text-gray-500">
            이미 계정이 있으신가요?{" "}
            <a
              href="/login"
              className="text-green-500 font-semibold hover:text-green-600"
            >
              로그인
            </a>
          </small>
        </div>
      </div>
    </div>
  );
}

export default Signup;
