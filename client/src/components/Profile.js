import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function Profile() {
  const [user, setUser] = useState(null); // 사용자 정보 저장
  const [isEditing, setIsEditing] = useState(false); // 수정 모드 상태
  const [formData, setFormData] = useState({
    username: "",
    birth: "",
    tel: "",
    password: "",
  }); // 수정 가능한 데이터
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate(); // 구매목록 페이지로 이동을 위한 navigate 추가

  // 사용자 정보 불러오기
  useEffect(() => {
    const fetchUserProfile = async () => {
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
          setUser(data.user);
          setFormData({
            username: data.user.username,
            birth: data.user.birth,
            tel: data.user.tel,
            password: data.user.password || "", // 서버에서 반환된 비밀번호 포함
          });
        } else {
          setError("세션이 만료되었습니다. 다시 로그인해주세요.");
        }
      } catch (err) {
        setError("사용자 정보를 불러오는 데 실패했습니다.");
      }
    };

    fetchUserProfile();
  }, []);

  // 입력 값 변경 처리
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 저장 버튼 클릭 시
  const handleSave = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const response = await fetch("http://localhost:5000/auth/update-user", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setUser((prev) => ({
          ...prev,
          ...formData,
        }));
        setIsEditing(false); // 수정 모드 해제
      } else {
        const data = await response.json();
        setError(data.message || "수정에 실패했습니다.");
      }
    } catch (err) {
      setError("수정 요청 중 오류가 발생했습니다.");
    }
  };

  // 취소 버튼 클릭 시
  const handleCancel = () => {
    const confirmCancel = window.confirm(
      "회원 정보 수정을 취소하시겠습니까? 수정 내용은 저장되지 않습니다."
    );
    if (confirmCancel) {
      setFormData({
        username: user.username,
        birth: user.birth,
        tel: user.tel,
        password: user.password || "", // 원래 비밀번호 값
      });
      setIsEditing(false); // 수정 모드 해제
    }
  };

  // 회원탈퇴 버튼 클릭 시
  const handleDeleteAccount = async () => {
    if (window.confirm("정말로 회원탈퇴를 진행하시겠습니까?")) {
      setError("");
      setSuccess("");

      try {
        const response = await fetch("http://localhost:5000/auth/delete-user", {
          method: "DELETE",
          credentials: "include",
        });

        if (response.ok) {
          alert("회원탈퇴가 완료되었습니다.");
          window.location.href = "/";
        } else {
          const data = await response.json();
          setError(data.message || "회원탈퇴에 실패했습니다.");
        }
      } catch (err) {
        setError("회원탈퇴 요청 중 오류가 발생했습니다.");
      }
    }
  };

  // 구매목록 버튼 클릭 시
  const handleViewPurchases = () => {
    navigate("/purchase/list");
  };

  return (
    <div className="relative flex size-full min-h-screen flex-col bg-[#f8fbf9] group/design-root overflow-x-hidden">
      <div className="layout-container flex h-full grow flex-col">
        <div className="px-64 flex flex-1 justify-start py-5">
          <div className="layout-content-container flex flex-col flex-1 items-center">
            <div className="flex flex-wrap justify-start gap-3 p-4">
              {error && (
                <p className="text-red-500 text-center mb-4">{error}</p>
              )}
              {success && (
                <p className="text-green-500 text-center mb-4">{success}</p>
              )}

              {user ? (
                <div>
                  {!isEditing ? (
                    <>
                      <div className="p-4">
                        <div className="flex flex-col items-start justify-start rounded-xl">
                          <div className="flex w-full min-w-72 grow flex-col items-start justify-center gap-1 py-4">
                            <p className="text-[#4e7397] text-sm font-normal leading-normal">
                              Member
                            </p>
                            <p className="text-[#0e141b] text-lg font-bold leading-tight tracking-[-0.015em]">
                              {user.username}
                            </p>

                            <div className="flex items-end flex-row gap-80 justify-end">
                              <p className="text-[#4e7397] text-base font-normal leading-normal">
                                {user.email}
                              </p>
                              <button
                                onClick={() => setIsEditing(true)}
                                className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-8 px-4 bg-[#e7edf3] text-[#0e141b] text-sm font-bold leading-normal hover:bg-gray-400 hover:text-white transition-all duration-300 ease-in-out"
                              >
                                <span className="truncate">수정</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 px-4 min-h-[72px] py-2 justify-between">
                        <div className="flex flex-col justify-center">
                          <p className="text-[#0e141b] text-base font-medium leading-normal line-clamp-1">
                            Birthday
                          </p>
                          <p className="text-[#4e7397] text-sm font-normal leading-normal line-clamp-2">
                            {user.birth}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 px-4 min-h-[72px] py-2 justify-between">
                        <div className="flex flex-col justify-center">
                          <p className="text-[#0e141b] text-base font-medium leading-normal line-clamp-1">
                            Password
                          </p>
                          <p className="text-[#4e7397] text-sm font-normal leading-normal line-clamp-2">
                            •••••••••••••••
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 px-4 min-h-[72px] py-2 justify-between">
                        <div className="flex flex-col justify-center">
                          <p className="text-[#0e141b] text-base font-medium leading-normal line-clamp-1">
                            Phone
                          </p>
                          <p className="text-[#4e7397] text-sm font-normal leading-normal line-clamp-2">
                            {user.tel}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 px-4 min-h-[72px] py-2 justify-between">
                        <div className="flex flex-col justify-center">
                          <p className="text-[#0e141b] text-base font-medium leading-normal line-clamp-1">
                            Mileage
                          </p>
                          <p className="text-[#4e7397] text-sm font-normal leading-normal line-clamp-2">
                            {user.mileage} P
                          </p>
                        </div>
                      </div>

                      <div className="flex px-4 py-3 justify-start gap-4">
                        <button
                          onClick={handleDeleteAccount}
                          className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 bg-red-500 text-[#0e141b] text-sm font-bold leading-normal tracking-[0.015em] hover:bg-red-600 hover:text-white transition-all duration-300 ease-in-out"
                        >
                          <span className="truncate">회원 탈퇴</span>
                        </button>

                        <button
                          onClick={handleViewPurchases}
                          className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 bg-[#e7edf3] text-[#0e141b] text-sm font-bold leading-normal tracking-[0.015em] hover:bg-gray-400 hover:text-white transition-all duration-300 ease-in-out"
                        >
                          <span className="truncate">🛒 구매 내역</span>
                        </button>
                      </div>
                    </>
                  ) : (
                    <form onSubmit={handleSave}>
                      <div className="p-4">
                        <div className="flex flex-col items-start justify-start rounded-xl">
                          <div className="flex w-full min-w-72 grow flex-col items-start justify-center gap-1 py-4">
                            <p className="text-[#4e7397] text-sm font-normal leading-normal">
                              Member
                            </p>
                            <input
                              type="text"
                              id="username"
                              name="username"
                              value={formData.username}
                              onChange={handleChange}
                              className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                              required
                            />

                            <div className="flex items-end flex-row gap-80 justify-end">
                              <p className="text-[#4e7397] text-base font-normal leading-normal">
                                {user.email}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 px-4 min-h-[72px] py-2 justify-between">
                        <div className="flex w-full flex-col justify-center">
                          <p className="text-[#0e141b] text-base font-medium leading-normal line-clamp-1">
                            Birthday
                          </p>
                          <input
                            type="date"
                            id="birth"
                            name="birth"
                            value={formData.birth}
                            onChange={handleChange}
                            className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                            required
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-4 px-4 min-h-[72px] py-2 justify-between">
                        <div className="flex w-full flex-col justify-center">
                          <p className="text-[#0e141b] text-base font-medium leading-normal line-clamp-1">
                            Password
                          </p>
                          <input
                            type="password"
                            id="password"
                            name="password"
                            placeholder="새로운 비밀번호를 입력하세요."
                            value={formData.password}
                            onChange={handleChange}
                            className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                            required
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-4 px-4 min-h-[72px] py-2 justify-between">
                        <div className="flex w-full flex-col justify-center">
                          <p className="text-[#0e141b] text-base font-medium leading-normal line-clamp-1">
                            Phone
                          </p>
                          <input
                            type="tel"
                            id="tel"
                            name="tel"
                            value={formData.tel}
                            onChange={handleChange}
                            className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                            required
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-4 px-4 min-h-[72px] py-2 justify-between">
                        <div className="flex w-full flex-col justify-center">
                          <p className="text-[#0e141b] text-base font-medium leading-normal line-clamp-1">
                            Mileage
                          </p>
                          <input
                            type="tel"
                            id="tel"
                            name="tel"
                            value={user.mileage}
                            P
                            onChange={handleChange}
                            className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                            disabled
                          />
                        </div>
                      </div>

                      <div className="flex px-4 py-3 justify-center gap-12 mt-5">
                        <button
                          type="submit"
                          className="flex min-w-[120px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 bg-[#e7edf3] text-[#0e141b] text-sm font-bold leading-normal tracking-[0.015em] hover:bg-gray-400 hover:text-white transition-all duration-300 ease-in-out"
                        >
                          저장
                        </button>
                        <button
                          type="button"
                          onClick={handleCancel}
                          className="flex min-w-[120px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 bg-[#e7edf3] text-[#0e141b] text-sm font-bold leading-normal tracking-[0.015em] hover:bg-gray-400 hover:text-white transition-all duration-300 ease-in-out"
                        >
                          취소
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              ) : (
                <p className="text-center">로딩 중...</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;