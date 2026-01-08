import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get("http://localhost:5000/userManage");
      setUsers(response.data);
    } catch (error) {
      console.error("사용자 목록을 가져오는 데 오류가 발생했습니다.", error);
    }
  };

  const deleteUser = async (email) => {
    const isConfirmed = window.confirm("정말 삭제하시겠습니까?");
    if (isConfirmed) {
      try {
        await axios.delete(`http://localhost:5000/userManage/${email}`);
        fetchUsers();
        alert("삭제되었습니다.");
      } catch (error) {
        console.error("삭제 중 오류가 발생했습니다.", error);
        alert("삭제 실패했습니다.");
      }
    }
  };

  const editUser = (user) => {
    navigate("/signup2", {
      state: { isEdit: true, user },
    });
  };

  const addUser = () => {
    navigate("/signup2", { state: { isEdit: false } });
  };

  const manageUserData = (userEmail) => {
    console.log("이메일 전달:", userEmail); // 이메일 값 확인
    navigate("/userData", {
      state: { email: userEmail },
    });
  };

  return (
    <div className="p-8 bg-[#f8fbf9] min-h-screen">
      <h1 className="text-left text-2xl font-bold mb-6">회원 관리</h1>
      <div className="overflow-x-auto mt-4">
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr className="bg-gray-200 text-gray-700">
              <th className="px-4 py-2 border text-xs">이메일</th>
              <th className="px-4 py-2 border text-xs">이름</th>
              <th className="px-4 py-2 border text-xs">생일</th>
              <th className="px-4 py-2 border text-xs">전화번호</th>
              <th className="px-4 py-2 border text-xs">클래스</th>
              <th className="px-4 py-2 border text-xs">마일리지</th>
              <th className="px-4 py-2 border text-xs">메뉴</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, index) => (
              <tr key={index} className="text-center hover:bg-gray-100">
                <td className="px-4 py-2 border text-xs whitespace-nowrap overflow-hidden text-ellipsis">
                  {user.email}
                </td>
                <td className="px-4 py-2 border text-xs whitespace-nowrap overflow-hidden text-ellipsis">
                  {user.username}
                </td>
                <td className="px-4 py-2 border text-xs whitespace-nowrap overflow-hidden text-ellipsis">
                  {user.birth}
                </td>
                <td className="px-4 py-2 border text-xs whitespace-nowrap overflow-hidden text-ellipsis">
                  {user.tel}
                </td>
                <td className="px-4 py-2 border text-xs whitespace-nowrap overflow-hidden text-ellipsis">
                  {user.class}
                </td>
                <td className="px-4 py-2 border text-xs whitespace-nowrap overflow-hidden text-ellipsis">
                  {user.mileage}
                </td>
                <td className="px-4 py-2 border">
                  <div className="flex justify-center space-x-2">
                    <button
                      className="px-1 py-1 text-xs bg-yellow-400 text-white rounded-md hover:bg-yellow-500"
                      onClick={() => editUser(user)}
                    >
                      수정
                    </button>
                    <button
                      className="px-1 py-1 text-xs bg-blue-400 text-white rounded-md hover:bg-blue-500"
                      onClick={() => manageUserData(user.email)} // 데이터 관리 버튼
                    >
                      데이터 관리
                    </button>
                    <button
                      className="px-1 py-1 text-xs bg-red-500 text-white rounded-md hover:bg-red-600"
                      onClick={() => deleteUser(user.email)}
                    >
                      삭제
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4">
        <button
          onClick={addUser}
          className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 bg-[#e7edf3] text-[#0e141b] text-sm font-bold leading-normal tracking-[0.015em] hover:bg-gray-400 hover:text-white transition-all duration-300 ease-in-out"
        >
          + 고객 추가
        </button>
      </div>
    </div>
  );
};

export default UserManagement;
