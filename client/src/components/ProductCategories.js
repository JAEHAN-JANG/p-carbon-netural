import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function ProductCategories() {
  const [newCategory, setNewCategory] = useState({
    code_name: "",
    description: "",
  });
  const navigate = useNavigate();

  const addCategory = () => {
    if (!newCategory.code_name || !newCategory.description) {
      alert("모든 필드를 입력하세요.");
      return;
    }

    fetch("http://localhost:5000/category/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newCategory),
    })
      .then((res) => res.json())
      .then((data) => {
        alert(data.message);
        navigate("/category/list");
        setNewCategory({ code_name: "", description: "" });
      })
      .catch((err) => console.error("카테고리 추가 실패:", err));
  };

  return (
    <div className="relative flex size-full min-h-screen flex-col bg-[#f8fbf9] group/design-root overflow-x-hidden">
      <div className="layout-container flex h-full grow flex-col">
        <div className="px-40 flex flex-1 justify-center py-5">
          <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
            <h1 className="text-[#0e1b13] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">
              상품 분류 관리
            </h1>

            <div className="bg-white p-8 rounded-lg shadow-md mt-6">
              <h2 className="text-[#0e1b13] text-[18px] font-semibold leading-tight pb-4">
                상품 카테고리 추가
              </h2>

              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="카테고리 이름"
                  className="bg-gray-50 border border-gray-300 text-gray-800 rounded-lg p-4 w-full focus:outline-none focus:ring-2 focus:ring-[#509568]"
                  value={newCategory.code_name}
                  onChange={(e) =>
                    setNewCategory({
                      ...newCategory,
                      code_name: e.target.value,
                    })
                  }
                />

                <textarea
                  placeholder="카테고리 설명"
                  className="bg-gray-50 border border-gray-300 text-gray-800 rounded-lg p-4 w-full focus:outline-none focus:ring-2 focus:ring-[#509568]"
                  rows="4"
                  value={newCategory.description}
                  onChange={(e) =>
                    setNewCategory({
                      ...newCategory,
                      description: e.target.value,
                    })
                  }
                />
              </div>

              <div className="flex justify-end mt-6 space-x-4">
                <button
                  onClick={addCategory}
                  className="bg-[#e7edf3] text-[#0e1b13] px-6 py-3 rounded-lg shadow-md text-sm font-bold hover:bg-gray-400 hover:text-white transition duration-300"
                >
                  추가하기
                </button>
                <button
                  onClick={() => navigate("/category/list")}
                  className="bg-[#e7edf3] text-[#0e1b13] px-6 py-3 rounded-lg shadow-md text-sm font-bold hover:bg-gray-400 hover:text-white transition duration-300"
                >
                  돌아가기
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductCategories;
