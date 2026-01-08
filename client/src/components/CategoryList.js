import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function CategoryList() {
  const [categories, setCategories] = useState([]);
  const [editingCategory, setEditingCategory] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = () => {
    fetch("http://localhost:5000/category/list")
      .then((res) => res.json())
      .then((data) => setCategories(data))
      .catch((err) => console.error("카테고리 목록 조회 실패:", err));
  };

  const deleteCategory = (id) => {
    fetch(`http://localhost:5000/category/delete/${id}`, { method: "DELETE" })
      .then((res) => res.json())
      .then((data) => {
        alert(data.message);
        fetchCategories();
      })
      .catch((err) => console.error("카테고리 삭제 실패:", err));
  };

  const updateCategory = (id) => {
    fetch(`http://localhost:5000/category/update/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editingCategory),
    })
      .then((res) => res.json())
      .then((data) => {
        alert(data.message);
        setEditingCategory(null);
        fetchCategories();
      })
      .catch((err) => console.error("카테고리 수정 실패:", err));
  };

  return (
    <div className="relative flex size-full min-h-screen flex-col bg-[#f8fbf9] group/design-root overflow-x-hidden">
      <div className="layout-container flex h-full grow flex-col">
        <div className="px-40 flex flex-1 justify-center py-5">
          <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
            <h2 className="text-[#0e1b13] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">
              상품 카테고리 목록
            </h2>

            {categories.length === 0 ? (
              <p className="text-center text-gray-700 text-xl">
                등록된 상품 카테고리가 없습니다.
              </p>
            ) : (
              <ul className="space-y-4 px-4">
                {categories.map((category) => (
                  <li
                    key={category.code_id}
                    className="flex items-center justify-between bg-gray-50 rounded-lg shadow-md p-6"
                  >
                    {editingCategory &&
                    editingCategory.code_id === category.code_id ? (
                      <div className="flex-1">
                        <input
                          type="text"
                          value={editingCategory.code_name}
                          onChange={(e) =>
                            setEditingCategory({
                              ...editingCategory,
                              code_name: e.target.value,
                            })
                          }
                          className="border border-gray-300 p-2 rounded-lg w-full mb-2"
                        />
                        <textarea
                          value={editingCategory.description}
                          onChange={(e) =>
                            setEditingCategory({
                              ...editingCategory,
                              description: e.target.value,
                            })
                          }
                          className="border border-gray-300 p-2 rounded-lg w-full mb-2"
                        />
                        <div className="flex gap-4">
                          <button
                            onClick={() => updateCategory(category.code_id)}
                            className="px-4 py-2 rounded-lg text-sm font-bold bg-[#e7edf3] hover:bg-gray-400 hover:text-white transition duration-300"
                          >
                            저장
                          </button>
                          <button
                            onClick={() => setEditingCategory(null)}
                            className="text-[#0e1b13] px-4 py-2 rounded-lg text-sm font-bold bg-[#e7edf3] hover:bg-gray-400 hover:text-white transition duration-300"
                          >
                            취소
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex-1">
                        <h3 className="text-lg font-bold">
                          {category.code_name}
                        </h3>
                        <p className="text-gray-600">{category.description}</p>
                      </div>
                    )}

                    {!editingCategory && (
                      <div className="flex gap-4">
                        <button
                          onClick={() => setEditingCategory(category)}
                          className="text-[#0e1b13] px-4 py-2 rounded-lg text-sm font-bold bg-[#e7edf3] hover:bg-gray-400 hover:text-white transition duration-300"
                        >
                          수정
                        </button>
                        <button
                          onClick={() => deleteCategory(category.code_id)}
                          className="text-[#0e1b13] px-4 py-2 rounded-lg text-sm font-bold bg-[#e7edf3] hover:bg-gray-400 hover:text-white transition duration-300"
                        >
                          삭제
                        </button>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}

            <div className="flex justify-end mt-6 px-4">
              <button
                onClick={() => navigate("/productCategories")}
                className="text-[#0e1b13] px-6 py-3 rounded-lg shadow-md text-sm font-bold bg-gray-300 hover:bg-gray-400 hover:text-white transition duration-300"
              >
                + 카테고리 추가
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CategoryList;
