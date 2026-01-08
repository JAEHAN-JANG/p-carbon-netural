import React, { useEffect, useState } from "react";

function PurchasePage() {
  const [purchases, setPurchases] = useState([]); // 구매 목록 상태
  const [loading, setLoading] = useState(true); // 로딩 상태

  useEffect(() => {
    // 구매 목록 조회 API 호출
    fetch("http://localhost:5000/purchase/list", {
      method: "GET",
      credentials: "include", // 세션 사용
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("구매 목록을 불러오는 데 실패했습니다.");
        }
        return res.json();
      })
      .then((data) => {
        if (data.success) {
          setPurchases(data.purchases); // 구매 데이터 설정
        } else {
          alert(data.message || "구매 목록 조회 실패");
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("구매 목록 조회 오류:", err);
        alert("서버와의 연결에 문제가 발생했습니다.");
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="text-center text-gray-700 text-lg mt-10">로딩 중...</div>
    );
  }

  if (!purchases.length) {
    return (
      <div className="min-h-screen mx-auto p-8 pt-16 bg-[#f8fbf9]">
        <h1 className="text-3xl font-bold mb-4 text-center text-[#0e1b13]">
          구매 목록
        </h1>
        <p className="text-gray-600 text-center">구매한 상품이 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col min-h-screen bg-[#f8fbf9]">
      <div className="layout-container flex h-full grow flex-col">
        <div className="px-40 flex flex-1 justify-center py-5">
          <div className="layout-content-container flex flex-col max-w-[960px] flex-1">

            <h2 className="text-[#0e1b13] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">
              🛒 구매 내역
            </h2>

            <div className="space-y-4">
              {purchases.map((purchase) => (
                <div
                  key={purchase.purchase_id}
                  className="flex items-center bg-white border border-gray-200 rounded-lg shadow-md p-4"
                >
                  {/* 이미지 */}
                  <div className="flex-shrink-0 w-32 h-32">
                    <img
                      src={`http://localhost:5000/uploads/${purchase.image}`}
                      alt={purchase.product_name}
                      className="w-full h-full object-cover rounded-md bg-gray-100"
                    />
                  </div>

                  {/* 구매 정보 */}
                  <div className="flex-1 px-4">
                    <h2 className="text-lg font-semibold text-[#0e1b13] mb-2">
                      {purchase.product_name}
                    </h2>
                    <p className="text-sm text-gray-600 mb-1">
                      {purchase.description}
                    </p>
                    <p className="text-sm text-gray-700 mb-1">
                      <strong>상품 분류:</strong> {purchase.code_name}
                    </p>
                    <p className="text-sm text-gray-700 mb-1">
                      <strong>수량:</strong> {purchase.quantity}개
                    </p>
                  </div>

                  {/* 가격 및 날짜 */}
                  <div className="flex flex-col items-end space-y-2">
                    <p className="text-lg font-bold text-gray-800">
                      총 가격: {purchase.total_price}P
                    </p>
                    <p
                      className="text-sm text-gray-600"
                      style={{
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      구매 날짜: {new Date(purchase.purchase_date).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default PurchasePage;