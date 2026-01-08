import React, { useState, useEffect } from "react";
import "./UserEvidence.css";

function UserEvidence() {
  const [evidenceList, setEvidenceList] = useState([]); // 증빙자료 리스트
  const [description, setDescription] = useState(""); // 내용
  const [file, setFile] = useState(null); // 파일 상태
  const [error, setError] = useState(null); // 에러 상태
  const [activeTab, setActiveTab] = useState("submit"); // 현재 활성화된 탭 ("submit" 또는 "list")

  // 증빙자료 목록 가져오기
  useEffect(() => {
    const fetchEvidence = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/evidence/user", {
          method: "GET",
          credentials: "include", // 세션 쿠키 포함
        });

        if (response.ok) {
          const data = await response.json();
          setEvidenceList(data); // 데이터 업데이트
        } else {
          const errorData = await response.json();
          setError(errorData.message || "증빙자료를 불러오는 데 실패했습니다.");
        }
      } catch (error) {
        setError("서버와 연결할 수 없습니다.");
      }
    };

    fetchEvidence();
  }, []);

  // 증빙자료 제출 핸들러
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!description || !file) {
      alert("내용과 파일을 모두 입력하세요.");
      return;
    }

    const formData = new FormData();
    formData.append("description", description);
    formData.append("file", file);

    try {
      const response = await fetch("http://localhost:5000/api/evidence/upload", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      if (response.ok) {
        alert("증빙자료가 성공적으로 제출되었습니다.");
        window.location.reload(); // 페이지 새로고침
      } else {
        const errorData = await response.json();
        alert(errorData.message || "증빙자료 제출에 실패했습니다.");
      }
    } catch (error) {
      alert("서버와 연결할 수 없습니다.");
    }
  };

  // 게시글 삭제 핸들러
  const handleDelete = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/api/evidence/delete/${id}`, {
        method: "DELETE",
        credentials: "include", // 세션 쿠키 포함
      });

      if (response.ok) {
        setEvidenceList((prevList) => prevList.filter((evidence) => evidence.id !== id));
        alert("증빙자료가 삭제되었습니다.");
      } else {
        const errorData = await response.json();
        alert(errorData.message || "증빙자료 삭제에 실패했습니다.");
      }
    } catch (error) {
      alert("서버와 연결할 수 없습니다.");
    }
  };

  return (
    <div className="user-evidence min-h-screen">
      <div className="tabs">
        <button
          className={`tab ${activeTab === "submit" ? "active" : ""}`}
          onClick={() => setActiveTab("submit")}
        >
          증빙자료 제출
        </button>
        <button
          className={`tab ${activeTab === "list" ? "active" : ""}`}
          onClick={() => setActiveTab("list")}
        >
          제출된 증빙자료
        </button>
      </div>

      {activeTab === "submit" && (
        <div className="submit-tab">
          {error && <p className="error">{error}</p>}

          <form onSubmit={handleSubmit} className="evidence-form">
            <textarea
              placeholder="증빙 내용을 입력하고, 증빙 자료를 첨부하세요."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md mb-4"
            />

            <label
              htmlFor="file-input"
              className="w-full flex items-center justify-center p-3 border border-gray-300 rounded-md bg-white shadow-md text-gray-700 cursor-pointer mb-4 hover:bg-gray-100 transition-all duration-300 ease-in-out"
            >
              {file ? "파일이 첨부되었습니다. 변경하시겠습니까?" : "파일 첨부"}
            </label>
            <input
              id="file-input"
              type="file"
              onChange={(e) => setFile(e.target.files[0])}
              className="hidden"
            />

            <button type="submit" className="p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
              제출
            </button>
          </form>
        </div>
      )}

      {activeTab === "list" && (
        <div className="list-tab">
          {evidenceList.length === 0 ? (
            <p className="text-center"><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/>
              제출된 증빙자료가 없습니다.<br/>
              실천화 증빙자료를 제출하고 Eco 마일리지를 수령하세요!
            </p>
          ) : (
            <div className="evidence-list">
              {evidenceList.map((evidence) => (
                <div key={evidence.id} className="evidence-card">

                  <div
                    className="delete-button"
                    onClick={() => handleDelete(evidence.id)}
                  >
                    삭제
                  </div>

                  <img
                    src={`http://localhost:5000/uploads/${evidence.file}`}
                    alt="Evidence"
                    className="evidence-image"
                  />

                  <p>{evidence.description}</p>

                  <p>{new Date(evidence.createdAt).toLocaleString()}</p>
                  
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default UserEvidence;