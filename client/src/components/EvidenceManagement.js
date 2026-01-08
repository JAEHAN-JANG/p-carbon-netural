import React, { useState, useEffect } from "react";

function EvidenceManagement() {
  const [evidences, setEvidences] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const categories = ["전기", "가스", "물", "교통", "폐기물"];
  const reductionRates = ["5% ~ 10%", "10% ~ 15%", "15% 이상"];

  // 서버에서 증빙자료를 요청할 때, 분류와 감축률 값을 포함해 가져옵니다.
  useEffect(() => {
    const fetchEvidences = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/evidence/all", {
          method: "GET",
          credentials: "include",
        });
        if (response.ok) {
          const data = await response.json();
          setEvidences(
            data.map((evidence) => ({
              ...evidence,
              selectedCategory: evidence.selectedCategory || "",
              selectedRate: evidence.selectedRate || "",
            }))
          );
        } else {
          alert("증빙자료를 불러오는 데 실패했습니다.");
        }
      } catch (error) {
        console.error("증빙자료 불러오기 오류:", error);
        alert("서버와의 연결에 문제가 발생했습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvidences();
  }, []);

  const handleApprove = async (id, selectedCategory, selectedRate) => {
    if (!selectedCategory || !selectedRate) {
      alert("카테고리와 감축률을 선택해주세요.");
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/evidence/approve/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category: selectedCategory, reduction_rate_range: selectedRate }),
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        alert(data.message);

        // 서버에서 승인된 증빙자료 상태를 업데이트하여 유지
        setEvidences((prevEvidences) =>
          prevEvidences.map((evidence) =>
            evidence.id === id
              ? {
                  ...evidence,
                  status: "승인",
                  selectedCategory: selectedCategory,
                  selectedRate: selectedRate,
                }
              : evidence
          )
        );
      } else {
        alert("승인에 실패했습니다.");
      }
    } catch (error) {
      console.error("승인 처리 오류:", error);
      alert("서버와의 연결에 문제가 발생했습니다.");
    }
  };

  const handleReject = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/api/evidence/delete/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (response.ok) {
        alert("거절되었습니다.");
        setEvidences((prevEvidences) => prevEvidences.filter((evidence) => evidence.id !== id));
      } else {
        alert("거절에 실패했습니다.");
      }
    } catch (error) {
      console.error("거절 처리 오류:", error);
      alert("서버와의 연결에 문제가 발생했습니다.");
    }
  };

  if (isLoading) {
    return <p>로딩 중...</p>;
  }

  return (
    <div className="p-8 bg-[#f8fbf9] min-h-screen">
      <h1 className="text-2xl font-bold mb-4 text-left">증빙자료 관리</h1>
      {evidences.length === 0 ? (
        <p className="text-left">등록된 증빙자료가 없습니다.</p>
      ) : (
        <div className="overflow-x-auto mt-4">
          <table className="min-w-full bg-white border border-gray-20">
            <thead>
              <tr className="bg-gray-200 text-gray-700">
                <th className="px-4 py-2 border">사용자명</th>
                <th className="px-4 py-2 border w-[480px]">내용</th>
                <th className="px-4 py-2 border w-40">첨부파일</th>
                <th className="px-4 py-2 border w-24">승인 여부</th>
                <th className="px-4 py-2 border w-20">항목 분류</th>
                <th className="px-4 py-2 border w-20">감축률</th>
                <th className="px-4 py-2 border w-24">조치</th>
              </tr>
            </thead>
            <tbody>
              {evidences.map((evidence) => (
                <tr key={evidence.id}>
                  <td className="px-2 py-2 border w-24 text-center">{evidence.user || "이름 없음"}</td>
                  <td className="px-6 py-2 border w-[480px]">{evidence.description || "내용 없음"}</td>
                  <td className="px-4 py-2 border">
                    {evidence.file && evidence.file.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                      <img
                        src={`http://localhost:5000/uploads/${evidence.file}`}
                        alt="첨부파일 미리보기"
                        className="w-40 h-40 object-cover mx-auto border"
                      />
                    ) : (
                      <a
                        href={`http://localhost:5000/uploads/${evidence.file}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 underline"
                      >
                        파일 보기
                      </a>
                    )}
                  </td>
                  <td className="px-2 py-2 border text-center">{evidence.status || "대기"}</td>
                  <td className="px-2 py-2 border text-center">
                    {evidence.status === "승인" ? (
                      <span>{evidence.selectedCategory}</span> // 승인 시 텍스트로 표시
                    ) : (
                      <select
                        className="border text-center"
                        value={evidence.selectedCategory}
                        onChange={(e) =>
                          setEvidences((prevEvidences) =>
                            prevEvidences.map((ev) =>
                              ev.id === evidence.id
                                ? { ...ev, selectedCategory: e.target.value }
                                : ev
                            )
                          )
                        }
                      >
                        <option value="">선택</option>
                        {categories.map((category) => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                      </select>
                    )}
                  </td>
                  <td className="px-2 py-2 border text-center">
                    {evidence.status === "승인" ? (
                      <span>{evidence.selectedRate}</span> // 승인 시 텍스트로 표시
                    ) : (
                      <select
                        className="border text-center"
                        value={evidence.selectedRate}
                        onChange={(e) =>
                          setEvidences((prevEvidences) =>
                            prevEvidences.map((ev) =>
                              ev.id === evidence.id
                                ? { ...ev, selectedRate: e.target.value }
                                : ev
                            )
                          )
                        }
                      >
                        <option value="">선택</option>
                        {reductionRates.map((rate) => (
                          <option key={rate} value={rate}>
                            {rate}
                          </option>
                        ))}
                      </select>
                    )}
                  </td>
                  <td className="px-2 py-2 border text-center">
                    {evidence.status === "승인" ? (
                      <span className="text-green-500 font-bold">승인됨</span>
                    ) : (
                      <>
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() =>
                              handleApprove(evidence.id, evidence.selectedCategory, evidence.selectedRate)
                            }
                            className="bg-green-500 text-white px-4 py-1 rounded mr-2 text-center whitespace-nowrap"
                          >
                            승인
                          </button>

                          <button
                            onClick={() => handleReject(evidence.id)}
                            className="bg-red-500 text-white px-4 py-1 rounded"
                          >
                            거절
                          </button>
                        </div>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default EvidenceManagement;