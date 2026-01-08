import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const CheckPw = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(
        `http://localhost:5000/api/community/posts/checkpw/${id}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        navigate(`/community/view/${id}`);
      } else {
        alert(data.error || "비밀번호가 일치하지 않습니다.");
      }
    } catch (error) {
      console.error("Error checking password:", error);
      alert("오류가 발생했습니다.");
    }
  };

  return (
    <div className="text-center p-8 pt-16">
      <h2 className="text-2xl font-semibold mb-4">비밀글 확인</h2>
      <form onSubmit={handleSubmit} className="mt-6">
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="비밀번호를 입력하세요"
          required
          className="p-2 mb-4 border border-gray-300 rounded-md w-64"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          확인
        </button>
      </form>
    </div>
  );
};

export default CheckPw;
