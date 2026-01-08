import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

const ViewPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [currentUser, setCurrentUser] = useState({
    email: "",
    isAdmin: false,
  });

  useEffect(() => {
    const loggedInUser = localStorage.getItem("userEmail");
    const userClass = localStorage.getItem("userClass");
    const isAdmin = localStorage.getItem("isAdmin") === "true";

    console.log("현재 로그인 정보:", {
      email: loggedInUser,
      class: userClass,
      isAdmin: isAdmin,
    });

    setCurrentUser({
      email: loggedInUser || "",
      isAdmin: userClass === "MNG" || isAdmin,
    });

    const fetchPost = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/api/community/posts/${id}`,
          {
            credentials: "include",
          }
        );
        if (!response.ok) {
          throw new Error("게시글을 불러올 수 없습니다.");
        }
        const data = await response.json();
        console.log("게시글 데이터:", data);
        setPost(data);
      } catch (error) {
        console.error("Failed to fetch post:", error);
        alert("게시글을 불러오는데 실패했습니다.");
        navigate("/community");
      }
    };

    fetchPost();
  }, [id, navigate]);

  const handleDelete = async () => {
    if (isAdmin) {
      // 관리자인 경우 바로 삭제 처리
      try {
        const response = await fetch(
          `http://localhost:5000/api/community/posts/${id}`,
          {
            method: "DELETE",
            credentials: "include",
          }
        );

        if (!response.ok) {
          throw new Error("게시글 삭제에 실패했습니다.");
        }

        alert("게시글이 삭제되었습니다.");
        navigate("/community");
      } catch (error) {
        console.error("Delete failed:", error);
        alert("게시글 삭제에 실패했습니다.");
      }
    } else {
      // 일반 사용자는 기존대로 삭제 페이지로 이동
      navigate(`/community/delete/${id}`);
    }
  };

  const handleEdit = () => {
    if (isAdmin) {
      // 관리자인 경우 바로 수정 페이지로 이동하며 비밀번호 체크 건너뛰기
      navigate(`/community/modify/${id}?skipPassword=true`);
    } else {
      // 일반 사용자는 기존대로 수정 페이지로 이동
      navigate(`/community/modify/${id}`);
    }
  };

  if (!post) {
    return <div className="text-center p-4">Loading...</div>;
  }

  const isAuthor = currentUser.email === post.writer;
  const isAdmin = currentUser.isAdmin;

  console.log("권한 체크:", {
    isAuthor,
    isAdmin,
    currentUserEmail: currentUser.email,
    postWriter: post.writer,
  });

  return (
    <div className="relative flex size-full min-h-screen flex-col bg-[#f8fbf9] group/design-root overflow-x-hidden">
      <div className="layout-container flex h-full grow flex-col">
        <div className="px-40 flex flex-1 justify-center py-5">
          <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
            <div className="flex flex-wrap justify-between gap-3 p-4">
              <div className="flex min-w-72 flex-col gap-3">
                <p className="text-[#0e141b] tracking-light text-[32px] font-bold leading-tight">
                  {post.title}
                </p>
                <p className="text-[#4e7397] text-sm font-normal leading-normal">
                  By {post.writer_name} •{" "}
                  {new Date(post.date).toLocaleDateString()}
                </p>
              </div>
            </div>

            <p className="text-[#0e141b] text-base font-normal leading-normal pb-3 pt-1 px-4">
              {post.content.split("\n").map((line, index) => (
                <span key={index}>
                  {line}
                  <br />
                </span>
              ))}
            </p>

            {post.image_name && (
              <div className="flex items-start mb-6 px-4">
                <div className="w-28 font-semibold text-gray-700">첨부파일</div>
                <div className="flex-1">
                  {post.image_name.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                    <div className="flex flex-col">
                      <img
                        src={`http://localhost:5000${post.image_dir}${post.image_name}`}
                        alt={post.image_name}
                        className="max-w-[300px] max-h-[300px] mb-2 cursor-pointer rounded-md hover:opacity-90"
                      />
                    </div>
                  ) : (
                    <a
                      href={`http://localhost:5000${post.image_dir}${post.image_name}`}
                      download
                      className="text-blue-600 hover:underline"
                    >
                      {post.image_name}
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* 버튼 영역 */}
            <div className="flex justify-end gap-4 px-4 mt-6">
              {(isAuthor || isAdmin) && (
                <>
                  <button
                    onClick={handleEdit}
                    className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 bg-[#e7edf3] text-[#0e141b] text-sm font-bold leading-normal tracking-[0.015em] hover:bg-gray-400 hover:text-white transition-all duration-300 ease-in-out"
                  >
                    수정
                  </button>
                  <button
                    onClick={handleDelete}
                    className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 bg-[#e7edf3] text-[#0e141b] text-sm font-bold leading-normal tracking-[0.015em] hover:bg-gray-400 hover:text-white transition-all duration-300 ease-in-out"
                  >
                    삭제
                  </button>
                </>
              )}
              <button
                onClick={() => navigate("/community")}
                className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 bg-[#e7edf3] text-[#0e141b] text-sm font-bold leading-normal tracking-[0.015em] hover:bg-gray-400 hover:text-white transition-all duration-300 ease-in-out"
              >
                돌아가기
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewPage;