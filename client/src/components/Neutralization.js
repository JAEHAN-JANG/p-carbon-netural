import React, { useState, useEffect } from "react";
import axios from "axios";

function Neutralization() {
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [userEmail, setUserEmail] = useState("");

  // 세션 확인 및 사용자 정보 가져오기
  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/auth/session-check",
          {
            withCredentials: true, // 세션 쿠키를 포함하기 위해 필요
          }
        );

        if (response.data.sessionData) {
          setUserEmail(response.data.sessionData.email);
          getInitialAnalysis(response.data.sessionData.email);
        } else {
          alert("로그인이 필요한 서비스입니다.");
          // 로그인 페이지로 리다이렉트
          window.location.href = "/login";
        }
      } catch (error) {
        console.error("세션 확인 오류:", error);
        alert("로그인이 필요한 서비스입니다.");
        window.location.href = "/login";
      }
    };

    checkSession();
  }, []);

  // 초기 분석 데이터 요청 함수
  const getInitialAnalysis = async (email) => {
    try {
      const response = await axios.post("http://localhost:5000/chat", {
        userPrompt: "탄소 배출 분석 결과를 알려주세요",
        userEmail: email,
      });

      if (response.data.noData) {
        // 데이터가 없는 경우 처리
        const botMessage = {
          type: "bot",
          content: response.data.message,
        };
        setChatHistory([botMessage]);
        // 3초 후 데이터 입력 페이지로 리다이렉트
        setTimeout(() => {
          window.location.href = "/carbon-tracker";
        }, 3000);
        return;
      }

      const botMessage = {
        type: "bot",
        content: response.data,
      };
      setChatHistory([botMessage]);
    } catch (error) {
      console.error("초기 분석 요청 오류:", error);
      alert("데이터 분석 중 오류가 발생했습니다.");
    }
  };

  const handleChat = async () => {
    if (!message.trim()) return;

    const userMessage = { type: "user", content: message };
    setChatHistory((prev) => [...prev, userMessage]);

    try {
      const response = await axios.post("http://localhost:5000/chat", {
        userPrompt: message,
        userEmail: userEmail,
      });

      if (response.data.noData) {
        // 데이터가 없는 경우 처리
        const botMessage = {
          type: "bot",
          content: response.data.message,
        };
        setChatHistory((prev) => [...prev, botMessage]);
        // 3초 후 데이터 입력 페이지로 리다이렉트
        setTimeout(() => {
          window.location.href = "/carbon-input";
        }, 3000);
        return;
      }

      const botMessage = { type: "bot", content: response.data };
      setChatHistory((prev) => [...prev, botMessage]);
      setMessage("");
    } catch (error) {
      console.error("에러:", error);
      alert("메시지 전송 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="h-full flex flex-col p-6 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto w-full">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            탄소 중립화 지원
          </h1>
          <p className="text-gray-600">
            AI 분석을 통해 맞춤형 탄소 배출 감소 방안을 제시해드립니다.
          </p>
        </div>

        <div className="flex-1 flex flex-col bg-white rounded-xl shadow-lg p-6">
          <div className="flex-1 chat-messages space-y-6 mb-6 overflow-y-auto max-h-[60vh]">
            {chatHistory.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-gray-500 flex flex-col items-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-4"></div>
                  분석 결과를 불러오는 중입니다...
                </div>
              </div>
            ) : (
              chatHistory.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${
                    msg.type === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`message p-4 rounded-2xl max-w-[80%] ${
                      msg.type === "user"
                        ? "bg-blue-500 text-white"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    <div className="message-content whitespace-pre-line">
                      {msg.content}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="chat-input mt-4">
            <div className="flex gap-3">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleChat();
                  }
                }}
                placeholder="추가 질문이 있으시다면 입력해주세요..."
                className="flex-1 p-4 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent text-gray-700"
              />
              <button
                onClick={handleChat}
                className="px-6 py-4 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors duration-200 flex items-center justify-center"
              >
                <span>전송</span>
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              Enter 키를 눌러 메시지를 보낼 수 있습니다
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Neutralization;
