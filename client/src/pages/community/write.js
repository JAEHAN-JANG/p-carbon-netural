import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const WritePage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    password: "",
    content: "",
    file: null,
    secret: false,
  });
  const [fileText, setFileText] = useState("파일 첨부"); // 파일 텍스트 상태 추가

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]:
        type === "checkbox" ? checked : type === "file" ? files[0] : value,
    }));

    if (type === "file" && files.length > 0) {
      setFileText("파일이 첨부되었습니다. 변경하시겠습니까?"); // 파일이 첨부되었을 때 텍스트 변경
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const submitData = new FormData();
      submitData.append("title", formData.title);
      submitData.append("password", formData.password);
      submitData.append("content", formData.content);
      submitData.append("secret", formData.secret);
      if (formData.file) {
        submitData.append("file", formData.file);
      }

      console.log("Sending data:", {
        title: formData.title,
        content: formData.content,
        secret: formData.secret,
        hasFile: !!formData.file,
      });

      const response = await fetch(
        "http://localhost:5000/api/community/posts/write",
        {
          method: "POST",
          credentials: "include",
          body: submitData,
        }
      );

      const responseText = await response.text();
      console.log("Server response text:", responseText);

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        throw new Error("서버 응답을 파싱할 수 없습니다: " + responseText);
      }

      if (!response.ok) {
        throw new Error(data.error || "게시글 작성에 실패했습니다.");
      }

      alert("게시글이 성공적으로 작성되었습니다.");
      navigate("/community");
    } catch (error) {
      console.error("Error submitting post:", error);
      alert(error.message || "게시글 작성 중 오류가 발생했습니다.");
    }
  };

  const handleCancel = () => {
    navigate("/community");
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
                  placeholder="제목을 입력하세요."
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className="w-full p-2 border border-gray-300 rounded-md mb-4"
                />
              </td>
            </tr>
            <tr>
              <td className="py-2 text-lg font-semibold text-left">
                게시글 비밀번호
              </td>
            </tr>
            <tr>
              <td>
                <input
                  type="password"
                  name="password"
                  placeholder="비밀번호를 설정하세요. 수정/삭제 시 필요합니다."
                  value={formData.password}
                  onChange={handleChange}
                  required
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
                  placeholder="내용을 입력하세요."
                  value={formData.content}
                  onChange={handleChange}
                  required
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
                    onChange={handleChange}
                    className="hidden"
                  />
                </label>
              </td>
            </tr>
            <tr>
              <td className="flex justify-end space-x-4 pt-4">
                <input
                  type="submit"
                  value="등록"
                  className="w-32 h-12 text-black bg-[#1cca59] rounded-md cursor-pointer text-sm font-bold hover:bg-[#16a34a] hover:text-white transition-all duration-300 ease-in-out"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (
                      window.confirm(
                        "작성을 취소하시겠습니까? 작성 내용은 저장되지 않습니다."
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

export default WritePage;