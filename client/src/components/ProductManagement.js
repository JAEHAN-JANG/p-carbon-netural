import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function ProductManagement() {
  const [newProduct, setNewProduct] = useState({
    product_name: "",
    description: "",
    price: "",
    stock: "",
    code_id: "",
    image: null,
  });

  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:5000/category/list")
      .then((res) => res.json())
      .then((data) => setCategories(data))
      .catch((err) => console.error("카테고리 불러오기 실패:", err));
  }, []);

  const addProduct = () => {
    const formData = new FormData();
    Object.entries(newProduct).forEach(([key, value]) => {
      formData.append(key, value);
    });

    fetch("http://localhost:5000/product/add", {
      method: "POST",
      body: formData,
    })
      .then((res) => res.json())
      .then((data) => {
        alert(data.message);
        navigate("/product/list");
        setNewProduct({
          product_name: "",
          description: "",
          price: "",
          stock: "",
          code_id: "",
          image: null,
        });
      })
      .catch((err) => console.error("상품 추가 실패:", err));
  };

  return (
    <div className="relative flex size-full min-h-screen flex-col bg-[#f8fbf9] group/design-root overflow-x-hidden">
      <div className="layout-container flex h-full grow flex-col">
        <div className="px-40 flex flex-1 justify-center py-5">
          <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
            <h1 className="text-[#0e1b13] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">
              상품 관리
            </h1>

            <div className="bg-white p-8 rounded-lg shadow-md mt-6">
              <h2 className="text-[#0e1b13] text-[18px] font-semibold leading-tight pb-4">
                상품 추가
              </h2>

              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="상품 이름"
                  className="bg-gray-50 border border-gray-300 text-gray-800 rounded-lg p-4 w-full focus:outline-none focus:ring-2 focus:ring-[#509568]"
                  value={newProduct.product_name}
                  onChange={(e) =>
                    setNewProduct({
                      ...newProduct,
                      product_name: e.target.value,
                    })
                  }
                />

                <textarea
                  placeholder="설명"
                  className="bg-gray-50 border border-gray-300 text-gray-800 rounded-lg p-4 w-full focus:outline-none focus:ring-2 focus:ring-[#509568]"
                  rows="4"
                  value={newProduct.description}
                  onChange={(e) =>
                    setNewProduct({
                      ...newProduct,
                      description: e.target.value,
                    })
                  }
                />

                <input
                  type="number"
                  placeholder="가격"
                  className="bg-gray-50 border border-gray-300 text-gray-800 rounded-lg p-4 w-full focus:outline-none focus:ring-2 focus:ring-[#509568]"
                  value={newProduct.price}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, price: e.target.value })
                  }
                />

                <input
                  type="number"
                  placeholder="재고 수량"
                  className="bg-gray-50 border border-gray-300 text-gray-800 rounded-lg p-4 w-full focus:outline-none focus:ring-2 focus:ring-[#509568]"
                  value={newProduct.stock}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, stock: e.target.value })
                  }
                />

                <select
                  className="bg-gray-50 border border-gray-300 text-gray-800 rounded-lg p-4 w-full focus:outline-none focus:ring-2 focus:ring-[#509568]"
                  value={newProduct.code_id}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, code_id: e.target.value })
                  }
                >
                  <option value="">상품 카테고리 선택</option>
                  {categories.map((category) => (
                    <option key={category.code_id} value={category.code_id}>
                      {category.code_name}
                    </option>
                  ))}
                </select>

                <input
                  type="file"
                  className="bg-gray-50 border border-gray-300 text-gray-800 rounded-lg p-4 w-full focus:outline-none focus:ring-2 focus:ring-[#509568]"
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, image: e.target.files[0] })
                  }
                />
              </div>

              <div className="flex justify-end mt-6 space-x-4">
                <button
                  onClick={addProduct}
                  className="bg-[#e7edf3] text-[#0e1b13] px-6 py-3 rounded-lg shadow-md text-sm font-bold hover:bg-gray-400 hover:text-white transition duration-300"
                >
                  추가하기
                </button>
                <button
                  onClick={() => navigate("/product/list")}
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

export default ProductManagement;
