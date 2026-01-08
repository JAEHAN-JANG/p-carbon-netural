import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function ProductList() {
  const [products, setProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [categories, setCategories] = useState([]);
  const [userClass, setUserClass] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    checkSession();
  }, []);

  const fetchProducts = () => {
    fetch("http://localhost:5000/product/list")
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch((err) => console.error("상품 목록 조회 실패:", err));
  };

  const fetchCategories = () => {
    fetch("http://localhost:5000/category/list")
      .then((res) => res.json())
      .then((data) => setCategories(data))
      .catch((err) => console.error("카테고리 목록 조회 실패:", err));
  };

  const checkSession = () => {
    fetch("http://localhost:5000/auth/check-session", {
      method: "GET",
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => setUserClass(data.user?.class || null))
      .catch((err) => console.error("세션 체크 실패:", err));
  };

  const deleteProduct = (id) => {
    fetch(`http://localhost:5000/product/delete/${id}`, { method: "DELETE" })
      .then((res) => res.json())
      .then((data) => {
        alert(data.message);
        fetchProducts();
      })
      .catch((err) => console.error("상품 삭제 실패:", err));
  };

  const updateProduct = (id) => {
    const formData = new FormData();
    formData.append("product_name", editingProduct.product_name);
    formData.append("description", editingProduct.description);
    formData.append("price", editingProduct.price);
    formData.append("stock", editingProduct.stock);
    formData.append("code_id", editingProduct.code_id);
    if (editingProduct.image) {
      formData.append("image", editingProduct.image);
    }

    fetch(`http://localhost:5000/product/update/${id}`, {
      method: "PUT",
      body: formData,
    })
      .then((res) => res.json())
      .then((data) => {
        alert(data.message);
        setEditingProduct(null);
        fetchProducts();
      })
      .catch((err) => console.error("상품 수정 실패:", err));
  };

  const handlePurchase = (product) => {
    const quantity = prompt("구매할 수량을 입력하세요:", 1);
    if (quantity && !isNaN(quantity) && quantity > 0) {
      const totalCost = product.price * quantity;

      fetch("http://localhost:5000/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          product_id: product.product_id,
          quantity: parseInt(quantity),
          total_price: totalCost,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            alert("구매가 완료되었습니다!");
            navigate("/purchase/list");
          } else {
            alert(data.message || "구매에 실패했습니다.");
          }
        })
        .catch((err) => console.error("구매 요청 실패:", err));
    } else {
      alert("유효한 수량을 입력하세요.");
    }
  };

  return (
    <div className="relative flex flex-col min-h-screen bg-[#f8fbf9]">
      <div className="layout-container flex h-full grow flex-col">
        <div className="px-40 flex flex-1 justify-center py-5">
          <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
            
            <h2 className="text-[#0e1b13] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">
              상품 목록
            </h2>

            {products.length === 0 ? (
              <p className="text-center text-gray-700 text-xl">
                등록된 상품이 없습니다.
              </p>
            ) : (
              products.map((product) => (
                <div
                  key={product.product_id}
                  className="flex items-center justify-between bg-gray-50 rounded-lg shadow-md p-6 mb-4"
                >
                  {/* 이미지 */}
                  <div className="flex-shrink-0 w-20 h-20">
                    <img
                      src={`http://localhost:5000/uploads/${product.image}`}
                      alt={product.product_name}
                      className="w-full h-full object-cover rounded-md bg-gray-100"
                    />
                  </div>

                  {/* 상품 정보 */}
                  <div className="flex-1 px-4">
                    {editingProduct &&
                    editingProduct.product_id === product.product_id ? (
                      <>
                        <input
                          type="text"
                          value={editingProduct.product_name}
                          onChange={(e) =>
                            setEditingProduct({
                              ...editingProduct,
                              product_name: e.target.value,
                            })
                          }
                          className="border p-2 w-full mb-2 rounded"
                        />
                        <textarea
                          value={editingProduct.description}
                          onChange={(e) =>
                            setEditingProduct({
                              ...editingProduct,
                              description: e.target.value,
                            })
                          }
                          className="border p-2 w-full mb-2 rounded"
                        />
                        <input
                          type="number"
                          value={editingProduct.price}
                          onChange={(e) =>
                            setEditingProduct({
                              ...editingProduct,
                              price: e.target.value,
                            })
                          }
                          className="border p-2 w-full mb-2 rounded"
                        />
                        <input
                          type="number"
                          value={editingProduct.stock}
                          onChange={(e) =>
                            setEditingProduct({
                              ...editingProduct,
                              stock: e.target.value,
                            })
                          }
                          className="border p-2 w-full mb-2 rounded"
                        />
                        <select
                          value={editingProduct.code_id}
                          onChange={(e) =>
                            setEditingProduct({
                              ...editingProduct,
                              code_id: e.target.value,
                            })
                          }
                          className="border p-2 w-full mb-2 rounded"
                        >
                          <option value="">카테고리 선택</option>
                          {categories.map((category) => (
                            <option
                              key={category.code_id}
                              value={category.code_id}
                            >
                              {category.code_name}
                            </option>
                          ))}
                        </select>
                        <input
                          type="file"
                          onChange={(e) =>
                            setEditingProduct({
                              ...editingProduct,
                              image: e.target.files[0],
                            })
                          }
                          className="w-full flex items-center justify-center p-3 border border-gray-300 rounded-md bg-white shadow-md text-gray-700 cursor-pointer mb-4 hover:bg-gray-100 transition-all duration-300 ease-in-out"
                        />
                        <div className="flex gap-4 justify-end mt-4">
                          <button
                            onClick={() => updateProduct(product.product_id)}
                            className="text-[#0e1b13] px-4 py-2 rounded-lg text-sm font-bold bg-[#e7edf3] hover:bg-gray-400 hover:text-white transition duration-300"
                          >
                            저장
                          </button>
                          <button
                            onClick={() => setEditingProduct(null)}
                            className="text-[#0e1b13] px-4 py-2 rounded-lg text-sm font-bold bg-[#e7edf3] hover:bg-gray-400 hover:text-white transition duration-300"
                          >
                            취소
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <h3 className="text-lg font-bold">
                          {product.product_name} : {product.code_name}
                        </h3>
                        <p className="text-gray-600">{product.description}</p>
                        <p className="text-gray-700">재고: {product.stock}개</p>
                      </>
                    )}
                  </div>

                  {/* 가격 및 버튼 */}
                  <div className="flex gap-4">
                    {!editingProduct ||
                    editingProduct.product_id !== product.product_id ? (
                      <>
                        <button className="text-lg font-bold text-gray-800 bg-[#EAF4E1] px-4 py-2 rounded-lg">
                          {product.price}P
                        </button>
                        {userClass === "MNG" ? (
                          <>
                            <button
                              onClick={() => setEditingProduct(product)}
                              className="text-[#0e1b13] px-4 py-2 rounded-lg text-sm font-bold bg-[#e7edf3] hover:bg-gray-400 hover:text-white transition duration-300"
                            >
                              수정
                            </button>
                            <button
                              onClick={() => deleteProduct(product.product_id)}
                              className="text-[#0e1b13] px-4 py-2 rounded-lg text-sm font-bold bg-[#e7edf3] hover:bg-gray-400 hover:text-white transition duration-300"
                            >
                              삭제
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => handlePurchase(product)}
                            className="text-[#0e1b13] px-4 py-2 rounded-lg text-sm font-bold bg-[#e7edf3] hover:bg-gray-400 hover:text-white transition duration-300"
                          >
                            구매
                          </button>
                        )}
                      </>
                    ) : null}
                  </div>
                </div>
              ))
            )}

            {userClass === "MNG" && (
              <div className="flex justify-end mt-6">
                <button
                  onClick={() => navigate("/productManagement")}
                  className="text-[#0e1b13] px-6 py-3 rounded-lg shadow-md text-sm font-bold bg-gray-300 hover:bg-gray-400 hover:text-white transition duration-300"
                >
                  + 상품 추가
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductList;