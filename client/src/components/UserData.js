import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

const UserData = () => {
  const { state } = useLocation();
  const { email } = state || {}; // 이메일 값 받아오기 (state가 없을 경우 빈 객체로 기본값 설정)
  const [emissionsData, setEmissionsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (email) {
      fetchUserData(email);
    } else {
      alert("이메일이 전달되지 않았습니다.");
    }
  }, [email]);

  const fetchUserData = async (email) => {
    try {
      const response = await axios.get(
        "http://localhost:5000/userManage/user-emissions",
        { params: { email } }
      );

      // 데이터 정렬: 먼저 년을, 그 다음 월을 기준으로 내림차순 정렬
      const sortedData = response.data.emissions.sort((a, b) => {
        if (b.year === a.year) {
          return b.month - a.month; // 월 기준 내림차순
        }
        return b.year - a.year; // 년 기준 내림차순
      });

      setEmissionsData(sortedData);
      setLoading(false);
    } catch (error) {
      console.error("사용자 데이터 로딩 실패", error);
      setLoading(false);
    }
  };

  const handleDelete = async (year, month) => {
    const isConfirmed = window.confirm("정말 삭제하시겠습니까?");
    if (isConfirmed) {
      try {
        await axios.delete(
          `http://localhost:5000/userManage/delete-emissions/${email}/${year}/${month}`
        );
        alert("삭제되었습니다.");
        fetchUserData(email);
      } catch (error) {
        alert("삭제 실패");
        console.error("삭제 중 오류 발생", error);
      }
    }
  };

  const handleUpdate = (data) => {
    navigate("/editEmission", { state: { email, data } });
  };

  const handleAdd = () => {
    navigate("/addEmission", { state: { email } });
  };

  if (loading) {
    return <div>로딩 중...</div>;
  }

  return (
    <div className="p-8 bg-[#f8fbf9] min-h-screen">
      <h1 className="text-2xl font-bold mb-6">사용자 데이터 관리</h1>
      {emissionsData.length > 0 ? (
        <div className="overflow-x-auto mt-4">
          <table className="min-w-full bg-white border border-gray-200">
            <thead>
              <tr className="bg-gray-200 text-gray-700">
                <th className="px-4 py-2 border text-xs">년</th>
                <th className="px-4 py-2 border text-xs">월</th>
                <th className="px-4 py-2 border text-xs">전기</th>
                <th className="px-4 py-2 border text-xs">가스</th>
                <th className="px-4 py-2 border text-xs">물</th>
                <th className="px-4 py-2 border text-xs">연료</th>
                <th className="px-4 py-2 border text-xs">쓰레기</th>
                <th className="px-4 py-2 border text-xs">총 탄소 배출량</th>
                <th className="px-4 py-2 border text-xs">나무 손실</th>
                <th className="px-4 py-2 border text-xs">조작</th>
              </tr>
            </thead>
            <tbody>
              {emissionsData
                .sort((a, b) => {
                  if (b.year === a.year) {
                    return b.month - a.month;
                  }
                  return b.year - a.year;
                })
                .map((data, index) => (
                  <tr key={index} className="text-center hover:bg-gray-100">
                    <td className="px-4 py-2 border text-xs">{data.year}</td>
                    <td className="px-4 py-2 border text-xs">{data.month}</td>
                    <td className="px-4 py-2 border text-xs">
                      {data.electricity}
                    </td>
                    <td className="px-4 py-2 border text-xs">{data.gas}</td>
                    <td className="px-4 py-2 border text-xs">{data.water}</td>
                    <td className="px-4 py-2 border text-xs">{data.fuel}</td>
                    <td className="px-4 py-2 border text-xs">{data.waste}</td>
                    <td className="px-4 py-2 border text-xs">
                      {data.total_carbon}
                    </td>
                    <td className="px-4 py-2 border text-xs">
                      {data.tree_loss}
                    </td>
                    <td className="px-4 py-2 border">
                      <div className="flex justify-center space-x-2">
                        <button
                          className="px-1 py-1 text-xs bg-yellow-500 text-white rounded-md hover:bg-yellow-600"
                          onClick={() => handleUpdate(data)}
                        >
                          수정
                        </button>
                        <button
                          className="px-1 py-1 text-xs bg-red-500 text-white rounded-md hover:bg-red-600"
                          onClick={() => handleDelete(data.year, data.month)}
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
      ) : (
        <div>해당 데이터가 없습니다.</div>
      )}
      <div className="mt-4">
        <button
          onClick={handleAdd}
          className="px-4 py-2 bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600 transition duration-300"
        >
          데이터 추가
        </button>
      </div>
    </div>
  );
};

export default UserData;
