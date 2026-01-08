import React from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import PostList from "../pages/community/list";
import WritePage from "../pages/community/write";
import ViewPage from "../pages/community/view";
import ModifyPage from "../pages/community/modify";
import DeletePage from "../pages/community/delete";
import CheckPw from "../pages/community/checkpw";

function Community() {
  const navigate = useNavigate();

  const handlePostClick = (post) => {
    if (post.secret) {
      navigate(`/community/checkpw/${post.id}`);
    } else {
      navigate(`/community/view/${post.id}`);
    }
  };

  return (
    <div className="p-6 min-h-screen bg-[#f8fbf9] pt-16">
      <div className="max-w-4xl mx-auto">
        <Routes>
          <Route
            path="/"
            element={<PostList onPostClick={handlePostClick} />}
          />
          <Route path="/write" element={<WritePage />} />
          <Route path="/view/:idx" element={<ViewPage />} />
          <Route path="/modify/:idx" element={<ModifyPage />} />
          <Route path="/delete/:idx" element={<DeletePage />} />
          <Route path="/checkpw/:idx" element={<CheckPw />} />
        </Routes>
      </div>
    </div>
  );
}

export default Community;