import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

const ModifyPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [userClass, setUserClass] = useState(null);
  const [username, setUsername] = useState("");

  useEffect(() => {
    const checkSession = async () => {
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
          setUserClass(data.user?.class);
          setUsername(data.user?.username);
        } else {
          if (response.status === 401) {
            alert("세션이 만료되었습니다.");
            navigate("/");
          }
        }
      } catch (error) {
        console.error("세션 체크 중 오류:", error);
        alert("서버와의 연결에 문제가 발생했습니다.");
      }
    };

    checkSession();
  }, [navigate]);

  const [formData, setFormData] = useState({
    title: "",
    password: "",
    content: "",
    file: null,
    secret: false,
  });
  const [fileText, setFileText] = useState("파일 첨부"); // 파일 텍스트 상태 추가

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/api/community/posts/${id}`
        );
        if (!response.ok) {
          throw new Error("게시글을 불러올 수 없습니다.");
        }
        const data = await response.json();

        const params = new URLSearchParams(window.location.search);
        const skipPassword = params.get("skipPassword") === "true";

        setFormData({
          title: data.title,
          password: skipPassword ? "admin" : "",
          content: data.content,
          file: null,
          secret: data.secret === 1,
        });

        if (skipPassword) {
          const passwordField = document.querySelector(
            'input[name="password"]'
          );
          if (passwordField) {
            passwordField.parentElement.parentElement.style.display = "none";
          }
        }
      } catch (error) {
        console.error("Failed to fetch post:", error);
        alert("게시글을 불러오는데 실패했습니다.");
        navigate("/community");
      }
    };

    fetchPost();
  }, [id, navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleFileChange = (e) => {
    const { files } = e.target; // 파일 리스트 가져오기
    const file = files[0]; // 첫 번째 파일 선택

    setFormData((prev) => ({
      ...prev,
      file: file,
    }));

    if (file) {
      setFileText(`${file.name} (첨부됨)`); // 첨부된 파일 이름 표시
    } else {
      setFileText("파일 첨부"); // 파일이 없을 때 기본 텍스트
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.password) {
      alert("비밀번호를 입력해주세요.");
      return;
    }

    const modifiedData = new FormData();
    modifiedData.append("title", formData.title);
    modifiedData.append("password", formData.password);
    modifiedData.append("content", formData.content);
    modifiedData.append("secret", formData.secret);
    if (formData.file) {
      modifiedData.append("file", formData.file);
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/community/posts/modify/${id}`,
        {
          method: "POST",
          body: modifiedData,
          credentials: "include",
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "수정에 실패했습니다.");
      }

      const data = await response.json();
      alert("게시글이 수정되었습니다.");
      navigate(`/community/view/${id}`);
    } catch (error) {
      console.error("Error modifying post:", error);
      alert(error.message);
    }
  };

  const handleCancel = () => {
    navigate(`/community/view/${id}`);
  };

  return (
    <div className="p-6 pt-16 bg-[#f8fbf9]">
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <table className="mx-auto w-full max-w-3xl border-collapse">
          <tbody>
            <tr>
              <td className="py-2 text-lg font-semibold text-left">제목</td>
            </tr>
            <tr>
              <td>
                <input
                  type="text"
                  name="title"
                  placeholder="제목을 수정하세요."
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md mb-4"
                />
              </td>
            </tr>

            {userClass === "MBR" && (
              <>
              <tr>
                <td className="py-2 text-lg font-semibold text-left">
                  게시글 비밀번호
                </td>
              </tr>
              </>
            )}
            <tr>
              <td>
                <input
                  type="password"
                  name="password"
                  placeholder="게시글 작성 시 설정했던 비밀번호를 입력하세요."
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md mb-4"
                />
              </td>
            </tr>
            <tr>
              <td className="py-2 text-lg font-semibold text-left">내용</td>
            </tr>
            <tr>
              <td>
                <textarea
                  name="content"
                  placeholder="내용을 수정하세요."
                  value={formData.content}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md mb-4 h-40 resize-none"
                />
              </td>
            </tr>
            <tr>
              <td>
                <label
                  htmlFor="file"
                  className="w-full flex items-center justify-center p-3 border border-gray-300 rounded-md bg-white shadow-md text-gray-700 cursor-pointer mb-4 hover:bg-gray-100 transition-all duration-300 ease-in-out"
                >
                  {fileText} {/* 텍스트 표시 */}
                  <input
                    id="file"
                    type="file"
                    name="file"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              </td>
            </tr>
            <tr>
              <td className="flex justify-end space-x-4 pt-4">
                <input
                  type="submit"
                  value="수정"
                  className="w-32 h-12 text-black bg-[#1cca59] rounded-md cursor-pointer text-sm font-bold hover:bg-[#16a34a] hover:text-white transition-all duration-300 ease-in-out"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (
                      window.confirm(
                        "수정을 취소하시겠습니까? 수정 내용은 저장되지 않습니다."
                      )
                    ) {
                      handleCancel();
                    }
                  }}
                  className="w-32 h-12 text-black bg-gray-300 rounded-md text-sm font-bold hover:bg-gray-400 hover:text-white transition-all duration-300 ease-in-out"
                >
                  취소
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </form>
    </div>
  );
};

export default ModifyPage;