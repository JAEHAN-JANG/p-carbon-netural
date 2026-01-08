import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

const DeletePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");

  // 로그인 상태 확인
  useEffect(() => {
    const loggedInUser = localStorage.getItem("userEmail");
    if (!loggedInUser) {
      alert("로그인이 필요합니다.");
      navigate("/login");
      return;
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!password) {
      alert("비밀번호를 입력해주세요.");
      return;
    }

    try {
      // 먼저 비밀번호 확인
      const checkResponse = await fetch(
        `http://localhost:5000/api/community/posts/checkpw/${id}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password }),
          credentials: "include",
        }
      );

      if (!checkResponse.ok) {
        const errorData = await checkResponse.json();
        alert(errorData.error || "비밀번호가 일치하지 않습니다.");
        return;
      }

      // 비밀번호가 일치하면 삭제 진행
      const deleteResponse = await fetch(
        `http://localhost:5000/api/community/posts/delete/${id}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password }),
          credentials: "include",
        }
      );

      const data = await deleteResponse.json();

      if (deleteResponse.ok) {
        alert("게시글이 삭제되었습니다.");
        navigate("/community");
      } else {
        alert(data.error || "삭제에 실패했습니다.");
      }
    } catch (error) {
      console.error("Error deleting post:", error);
      alert("삭제 중 오류가 발생했습니다.");
    }
  };

  const handleCancel = () => {
    navigate(`/community/view/${id}`);
  };

  return (
    <div className="min-h-screen mx-auto p-8 text-center bg-[#f8fbf9]">
      <h2 className="text-2xl font-semibold mb-12">게시글 삭제</h2>
      <form
        onSubmit={handleSubmit}
        className="mx-auto w-[500px] flex flex-col gap-4"
      >
        <div className="flex flex-col gap-3 mb-6">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="게시글을 삭제하려면 생성 시 설정했던 비밀번호를 입력하세요"
            required
            className="p-2 border border-gray-300 rounded-md"
          />
        </div>

        <button
          type="submit"
          className="py-2 px-4 text-black bg-red-500 rounded-md cursor-pointer text-sm font-bold hover:bg-red-600 hover:text-white transition-all duration-300 ease-in-out"
        >
          삭제
        </button>
        <button
          type="submit"
          onClick={() => {
            if (window.confirm("게시글 삭제를 취소하시겠습니까?")) {
              handleCancel();
            }
          }}
          className="py-2 px-4 text-black bg-gray-300 rounded-md cursor-pointer text-sm font-bold hover:bg-gray-400 hover:text-white transition-all duration-300 ease-in-out"
        >
          돌아가기
        </button>
      </form>
    </div>
  );
};

export default DeletePage;
