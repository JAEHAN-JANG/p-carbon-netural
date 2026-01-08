import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";

const Signup2 = () => {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [birth, setBirth] = useState("");
  const [tel, setTel] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [classOption, setClassOption] = useState("MBR"); // 기본값: 회원
  const [mileage, setMileage] = useState(0);
  const [error, setError] = useState("");
  const [isEdit, setIsEdit] = useState(false); // 수정 상태 체크
  const [userData, setUserData] = useState(null); // 수정할 데이터
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.state?.isEdit) {
      setIsEdit(true);
      setUserData(location.state.user);
      setEmail(location.state.user.email);
      setUsername(location.state.user.username);
      setBirth(location.state.user.birth);
      setTel(location.state.user.tel);
      setClassOption(location.state.user.class);
      setMileage(location.state.user.mileage);
    }
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !email ||
      !username ||
      !birth ||
      !tel ||
      !classOption ||
      (!isEdit && !password)
    ) {
      setError("모든 필드를 입력하세요.");
      return;
    }

    if (!isEdit && password !== confirmPassword) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }

    const userData = {
      email,
      username,
      birth,
      tel,
      class: classOption,
      mileage,
      ...(isEdit ? {} : { password }), // 수정 시 비밀번호 제외
    };

    try {
      if (isEdit) {
        // 수정 API 호출
        await axios.put(`http://localhost:5000/userManage/${email}`, userData);
        alert("사용자 정보가 수정되었습니다.");
      } else {
        // 추가 API 호출
        await axios.post("http://localhost:5000/userManage", userData);
        alert("사용자 추가가 완료되었습니다.");
      }
      navigate("/userManage");
    } catch (err) {
      setError("처리 중 오류가 발생했습니다.");
      console.error("사용자 처리 오류", err);
    }
  };

  const handleCancel = () => {
    navigate("/userManage");
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 bg-white shadow-lg rounded-lg">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
          {isEdit ? "사용자 수정" : "사용자 추가"}
        </h2>
        <form onSubmit={handleSubmit}>
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
              disabled={isEdit}
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
              htmlFor="class"
              className="block text-sm font-semibold text-gray-700"
            >
              클래스
            </label>
            <select
              id="class"
              value={classOption}
              onChange={(e) => setClassOption(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md mt-2"
            >
              <option value="MNG">관리자</option>
              <option value="MBR">회원</option>
            </select>
          </div>

          <div className="mb-4">
            <label
              htmlFor="mileage"
              className="block text-sm font-semibold text-gray-700"
            >
              마일리지
            </label>
            <input
              type="number"
              id="mileage"
              value={mileage}
              onChange={(e) => setMileage(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md mt-2"
            />
          </div>

          {!isEdit && (
            <>
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

              <div className="mb-4">
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
                  placeholder="비밀번호를 다시 입력하세요."
                  className="w-full p-3 border border-gray-300 rounded-md mt-2"
                />
              </div>
            </>
          )}

          <div className="flex flex-col space-y-4">
            <button
              type="submit"
              className="w-full bg-[#e7edf3] text-black py-3 rounded-md font-semibold hover:bg-gray-500 hover:text-white transition-all duration-300 ease-in-out"
            >
              {isEdit ? "수정하기" : "추가하기"}
            </button>

            <button
              onClick={() => {
                if (
                  window.confirm(
                    "작성을 취소하시겠습니까? 작성 내용은 저장되지 않습니다."
                  )
                ) {
                  handleCancel();
                }
              }}
              className="w-full bg-[#e7edf3] text-black py-3 rounded-md font-semibold hover:bg-gray-500 hover:text-white transition-all duration-300 ease-in-out"
            >
              돌아가기
            </button>
          </div>
        </form>

        {error && <p className="text-red-500 text-center mt-4">{error}</p>}
      </div>
    </div>
  );
};

export default Signup2;
