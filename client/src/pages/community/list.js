import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const PostList = ({ onPostClick }) => {
  const [posts, setPosts] = useState([]);
  const [query, setQuery] = useState("");
  const [option, setOption] = useState("option1");
  const navigate = useNavigate();

  // 게시글 데이터 가져오기
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch(
          "http://localhost:5000/api/community/posts"
        );
        if (!response.ok) {
          throw new Error("서버 응답 오류");
        }
        const data = await response.json();
        setPosts(data);
      } catch (error) {
        console.error("Failed to fetch posts:", error);
      }
    };
    fetchPosts();
  }, []);

  // 검색 처리
  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      let url = "http://localhost:5000/api/community/posts";

      if (query.trim()) {
        url = `http://localhost:5000/api/community/posts/search?option=${encodeURIComponent(
          option
        )}&query=${encodeURIComponent(query)}`;
      }

      console.log("Search URL:", url);
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("검색 중 오류 발생");
      }
      const data = await response.json();
      setPosts(data);
    } catch (error) {
      console.error("검색 실패:", error);
      alert("검색 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="relative flex size-full min-h-screen flex-col bg-[#f8fbf9] group/design-root overflow-x-hidden">
      <div className="layout-container flex h-full grow flex-col">
        <div className="flex flex-1 justify-center">
          <div className="layout-content-container flex flex-col flex-1 w-full max-w-none">
            <div className="flex flex-wrap justify-between gap-3 p-4">
              <div className="flex min-w-72 flex-col gap-3">
                <p className="text-[#0e1b13] tracking-light text-[32px] font-bold leading-tight">
                  Carbon Tracker 커뮤니티
                </p>
                <p className="text-[#509568] text-sm font-normal leading-normal mb-10">
                  커뮤니티에 참여하여 탄소 발자국을 줄이는 방법에 대해 논의하고
                  지속 가능한 생활에 대한 팁을 공유하세요.
                </p>
              </div>
            </div>

            {/* 검색 폼과 글쓰기 버튼을 하나의 Flexbox 컨테이너로 합침 */}
            <div className="flex justify-between items-center px-4 py-3">
              {/* 검색 폼 */}
              <form onSubmit={handleSearch} className="flex items-center gap-2">
                <select
                  name="options"
                  value={option}
                  onChange={(e) => setOption(e.target.value)}
                  className="mr-2 p-2 h-10 rounded-md border border-gray-300"
                >
                  <option value="all">전체</option>
                  <option value="title">제목</option>
                  <option value="content">내용</option>
                </select>

                <input
                  type="text"
                  name="query"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="검색어를 입력하세요"
                  className="mr-2 p-2 h-10 w-[200px] border border-gray-300 rounded-md"
                />

                <button
                  type="submit"
                  className="flex min-w-[50px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-md h-10 px-4 bg-[#1cca59] text-[#0e1b13] text-sm font-bold leading-normal tracking-[0.015em] hover:bg-[#16a34a] hover:text-white transition-all duration-300 ease-in-out"
                >
                  검색
                </button>
              </form>

              {/* 글쓰기 버튼 */}
              <button
                className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-md h-10 px-4 bg-[#1cca59] text-[#0e1b13] text-sm font-bold leading-normal tracking-[0.015em] hover:bg-[#16a34a] hover:text-white transition-all duration-300 ease-in-out"
                onClick={() => navigate("/community/write")}
              >
                <span className="truncate">글쓰기</span>
              </button>
            </div>

            {/* 게시글 목록 */}
            <div className="px-4 py-3 @container">
              <div className="flex overflow-hidden rounded-xl border border-[#d1e6d8] bg-[#f8fbf9]">
                <table className="flex-1">
                  <thead>
                    <tr className="bg-[#f8fbf9]">
                      <th className="table-0b1a03f8-64d8-4f95-9a72-d2fa226a8095-column-120 px-4 py-3 text-left text-[#0e1b13] w-[50px] text-sm font-bold leading-normal">
                        NO
                      </th>
                      <th className="table-0b1a03f8-64d8-4f95-9a72-d2fa226a8095-column-176 px-4 py-3 text-left text-[#0e1b13] w-[100px] text-sm font-bold leading-normal">
                        작성자
                      </th>
                      <th className="table-0b1a03f8-64d8-4f95-9a72-d2fa226a8095-column-296 px-4 py-3 text-left text-[#0e1b13] w-[250px] text-sm font-bold leading-normal">
                        제목
                      </th>
                      <th className="table-0b1a03f8-64d8-4f95-9a72-d2fa226a8095-column-416 px-4 py-3 text-left text-[#0e1b13] w-[100px] text-sm font-bold leading-normal">
                        작성일
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {posts.map((post) => (
                      <tr key={post.id} className="border-t border-t-[#d1e6d8]">
                        <td className="h-[72px] px-4 py-2 text-[#509568] text-sm font-normal leading-normal">
                          {post.id}
                        </td>
                        <td className="h-[72px] px-4 py-2 text-sm font-normal leading-normal">
                          {post.writer_name}
                        </td>
                        <td className="h-[72px] px-4 py-2 text-[#0e1b13] text-sm font-normal leading-normal">
                          <a
                            onClick={() => onPostClick(post)}
                            className="text-black no-underline cursor-pointer"
                          >
                            {post.title} {post.secret === 1 && "🔒"}
                          </a>
                        </td>
                        <td className="h-[72px] px-4 py-2 text-[#509568] text-sm font-normal leading-normal">
                          {new Date(post.date).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostList;
