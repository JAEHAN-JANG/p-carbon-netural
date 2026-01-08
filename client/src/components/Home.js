import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function HomePage() {
  const navigate = useNavigate();
  const [userClass, setUserClass] = useState(null);
  const [username, setUsername] = useState("");

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch(
          "http://localhost:5000/auth/check-session",
          {
            method: "GET",
            credentials: "include",
          }
        );

        if (response.ok) {
          const data = await response.json();
          setUserClass(data.user?.class);
          setUsername(data.user?.username);
        } else {
          if (response.status === 401) {
            alert("세션이 만료되었습니다.");
            navigate("/");
          }
        }
      } catch (error) {
        console.error("세션 체크 중 오류:", error);
        alert("서버와의 연결에 문제가 발생했습니다.");
      }
    };

    checkSession();
  }, [navigate]);

  const navigateToCarbonTracker = () => {
    navigate("/carbon-tracker");
  };

  return (
    <div
      className="relative flex size-full min-h-screen flex-col bg-[#f8fbf9] group/design-root overflow-x-hidden"
      style={{
        fontFamily: "Space Grotesk, Noto Sans, sans-serif",
        backgroundColor: "#f8fbf9",
        display: "flex",
      }}
    >
      <div className="layout-container flex h-full grow flex-col">
        <div className="px-40 flex flex-1 justify-center py-5">
          <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
            <div className="@container">
              <div className="@[480px]:p-4">
                <div
                  className="flex min-h-[480px] flex-col gap-6 bg-cover bg-center bg-no-repeat @[480px]:gap-8 @[480px]:rounded-xl items-center justify-center px-4 pb-10 @[480px]:px-10"
                  style={{
                    backgroundImage:
                      'linear-gradient(rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0.4) 100%), url("https://cdn.usegalileo.ai/sdxl10/3f2f549b-3a71-47a5-933e-f0ec7b0cc7dc.png")',
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                    borderRadius: "16px",
                  }}
                >

                  {userClass === "MBR" && (
                    <>
                    <h1 className="text-white text-5xl font-black leading-tight tracking-[-0.033em] @[480px]:text-5xl @[480px]:font-black @[480px]:leading-tight @[480px]:tracking-[-0.033em] text-center">
                      Understand your carbon footprint and take action
                    </h1>

                    <button
                      onClick={navigateToCarbonTracker}
                      className="text-[23px] flex min-w-[180px] max-w-[800px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-12 px-4 @[480px]:h-12 @[480px]:px-5 bg-[#1cca59] text-[#0e1b13] text-sm font-bold leading-normal tracking-[0.015em] @[480px]:text-base @[480px]:font-bold @[480px]:leading-normal @[480px]:tracking-[0.015em] hover:bg-[#16a34a] hover:text-white transition-all duration-300 ease-in-out"
                    >
                      <span className="truncate">Calculate Now!</span>
                    </button>
                    </>
                  )}

                  {userClass === "MNG" && (
                    <>
                    <h1 className="text-white text-5xl font-black leading-tight tracking-[-0.033em] @[480px]:text-5xl @[480px]:font-black @[480px]:leading-tight @[480px]:tracking-[-0.033em] text-center">
                      환영합니다, 관리자님!
                    </h1>
                    </>
                  )}
                  
                </div>
              </div>
            </div>

            <h2 className="text-[#0e1b13] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">
              What is Carbon Track?
            </h2>

            <p className="text-[#0e1b13] text-base font-normal leading-normal pb-3 pt-1 px-4">
              Carbon Tracker는 탄소 발자국을 측정하고 환경에 미치는 영향을
              분석할 수 있는 웹 플랫폼입니다. 탄소 배출량을 줄이고 지속 가능한
              삶을 실천할 수 있도록 맞춤형 솔루션과 중립화 방안을 제공합니다.
            </p>

            <div className="flex flex-col gap-10 px-4 py-10 @container">
              <div className="flex flex-col gap-4">
                <h1 className="text-left text-[#0e1b13] tracking-light text-[22px] font-bold leading-tight @[480px]:text-4xl @[480px]:font-black @[480px]:leading-tight @[480px]:tracking-[-0.033em] max-w-[720px]">
                  Key Features
                </h1>

                <p className="text-[#0e1b13] text-base font-normal leading-normal max-w-[720px]">
                  Carbon Tracker는 탄소 배출량을 줄이고, 환경을 보호하는 데
                  필요한 기능을 제공합니다.
                </p>
              </div>

              <div className="grid grid-cols-[repeat(auto-fit,minmax(158px,1fr))] gap-3 p-0">
                <div className="flex flex-1 gap-3 rounded-lg border border-[#d1e6d8] bg-[#f8fbf9] p-4 flex-col">
                  <div
                    className="text-[#0e1b13]"
                    data-icon="ChartLine"
                    data-size="24px"
                    data-weight="regular"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24px"
                      height="24px"
                      fill="currentColor"
                      viewBox="0 0 256 256"
                    >
                      <path d="M232,208a8,8,0,0,1-8,8H32a8,8,0,0,1-8-8V48a8,8,0,0,1,16,0v94.37L90.73,98a8,8,0,0,1,10.07-.38l58.81,44.11L218.73,90a8,8,0,1,1,10.54,12l-64,56a8,8,0,0,1-10.07.38L96.39,114.29,40,163.63V200H224A8,8,0,0,1,232,208Z"></path>
                    </svg>
                  </div>

                  <div className="flex flex-col gap-1">
                    <h2 className="text-[#0e1b13] text-base font-bold leading-tight">
                      Calculate your Carbon Emissions
                    </h2>
                    <p className="text-[#509568] text-sm font-normal leading-normal">
                      Find out what your carbon emissions are.
                    </p>
                  </div>
                </div>

                <div className="flex flex-1 gap-3 rounded-lg border border-[#d1e6d8] bg-[#f8fbf9] p-4 flex-col">
                  <div
                    className="text-[#0e1b13]"
                    data-icon="AI"
                    data-size="24px"
                    data-weight="regular"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24px"
                      height="24px"
                      fill="currentColor"
                      viewBox="0 0 256 256"
                    >
                      <path d="M152,128a24,24,0,1,1-24-24A24,24,0,0,1,152,128Zm88-16H210.8A78.4,78.4,0,0,0,192.6,80.8l12.8-12.8a8,8,0,0,0-11.3-11.3L181.3,69.5a78.4,78.4,0,0,0-31.2-18.2V32a8,8,0,0,0-16,0V51.3A78.4,78.4,0,0,0,80.8,69.5L68,56.7a8,8,0,0,0-11.3,11.3L69.5,80.8A78.4,78.4,0,0,0,51.3,112H32a8,8,0,0,0,0,16H51.3a78.4,78.4,0,0,0,18.2,31.2L56.7,192a8,8,0,0,0,11.3,11.3l12.8-12.8a78.4,78.4,0,0,0,31.2,18.2V224a8,8,0,0,0,16,0V204.7a78.4,78.4,0,0,0,31.2-18.2l12.8,12.8a8,8,0,0,0,11.3-11.3L192,176.8a78.4,78.4,0,0,0,18.2-31.2H240a8,8,0,0,0,0-16ZM128,184a56,56,0,1,1,56-56A56,56,0,0,1,128,184Z"></path>
                    </svg>
                  </div>

                  <div className="flex flex-col gap-1">
                    <h2 className="text-[#0e1b13] text-base font-bold leading-tight">
                      AI Recommendation
                    </h2>
                    <p className="text-[#509568] text-sm font-normal leading-normal">
                      Receive recommendations from AI for carbon neutralization.
                    </p>
                  </div>
                </div>

                <div className="flex flex-1 gap-3 rounded-lg border border-[#d1e6d8] bg-[#f8fbf9] p-4 flex-col">
                  <div
                    className="text-[#0e1b13]"
                    data-icon="Store"
                    data-size="24px"
                    data-weight="regular"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24px"
                      height="24px"
                      fill="currentColor"
                      viewBox="0 0 256 256"
                    >
                      <path d="M216 56H176V48a48 48 0 0 0-96 0v8H40a16 16 0 0 0-16 16v160a16 16 0 0 0 16 16h176a16 16 0 0 0 16-16V72a16 16 0 0 0-16-16ZM96 48a32 32 0 0 1 64 0v8H96Zm112 184H48V72h32v24a8 8 0 0 0 16 0V72h64v24a8 8 0 0 0 16 0V72h32Z"></path>
                    </svg>
                  </div>

                  <div className="flex flex-col gap-1">
                    <h2 className="text-[#0e1b13] text-base font-bold leading-tight">
                      Set aside Eco-Mileage
                    </h2>
                    <p className="text-[#509568] text-sm font-normal leading-normal">
                      Try buying Eco-Friendly products.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-10 px-4 py-10 @container">
              <div className="flex flex-col gap-4">
                <h1 className="text-left text-[#0e1b13] tracking-light text-[22px] font-bold leading-tight @[480px]:text-4xl @[480px]:font-black @[480px]:leading-tight @[480px]:tracking-[-0.033em] max-w-[720px]">
                  Why Carbon Neutralize?
                </h1>
              </div>

              <div className="grid grid-cols-[repeat(auto-fit,minmax(158px,1fr))] gap-3 p-0">
                <div className="flex flex-1 gap-3 rounded-lg border border-[#d1e6d8] bg-[#f8fbf9] p-4 flex-row items-center justify-center">
                  <div
                    className="text-[#0e1b13]"
                    data-icon="ChartLine"
                    data-size="24px"
                    data-weight="regular"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24px"
                      height="24px"
                      fill="currentColor"
                      viewBox="0 0 256 256"
                    >
                      <path d="M200,32H56a16,16,0,0,0-16,16V88a64.07,64.07,0,0,0,64,64h8v16H96a8,8,0,0,0-8,8v16a8,8,0,0,0,8,8h64a8,8,0,0,0,8-8V176a8,8,0,0,0-8-8H144V152h8a64.07,64.07,0,0,0,64-64V48A16,16,0,0,0,200,32ZM56,88V48H80V88A48.05,48.05,0,0,1,56,88Zm144,0a48.05,48.05,0,0,1-24,0V48h24Z"></path>
                    </svg>
                  </div>

                  <div className="flex flex-col gap-1">
                    <h2 className="text-[#0e1b13] text-base font-bold leading-tight">
                      Reduce your environmental impact
                    </h2>
                  </div>
                </div>

                <div className="flex flex-1 gap-3 rounded-lg border border-[#d1e6d8] bg-[#f8fbf9] p-4 flex-row items-center justify-center">
                  <div
                    className="text-[#0e1b13]"
                    data-icon="AI"
                    data-size="24px"
                    data-weight="regular"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24px"
                      height="24px"
                      fill="currentColor"
                      viewBox="0 0 256 256"
                    >
                      <path
                        d="M128 16C96 48 64 88 64 136C64 184 96 224 128 240C160 224 192 184 192 136C192 88 160 48 128 16Z"
                        fill="#4CAF50"
                        stroke="#388E3C"
                        stroke-width="8"
                        stroke-linejoin="round"
                      />

                      <path
                        d="M128 16V240"
                        stroke="#2E7D32"
                        stroke-width="6"
                        stroke-linecap="round"
                      />
                      <path
                        d="M128 96C112 112 96 128 64 136"
                        stroke="#2E7D32"
                        stroke-width="4"
                        stroke-linecap="round"
                      />
                      <path
                        d="M128 96C144 112 160 128 192 136"
                        stroke="#2E7D32"
                        stroke-width="4"
                        stroke-linecap="round"
                      />
                    </svg>
                  </div>

                  <div className="flex flex-col gap-1">
                    <h2 className="text-[#0e1b13] text-base font-bold leading-tight">
                      Support high-quality carbon offset projects
                    </h2>
                  </div>
                </div>

                <div className="flex flex-1 gap-3 rounded-lg border border-[#d1e6d8] bg-[#f8fbf9] p-4 flex-row items-center justify-center">
                  <div
                    className="text-[#0e1b13]"
                    data-icon="Store"
                    data-size="24px"
                    data-weight="regular"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24px"
                      height="24px"
                      fill="currentColor"
                      viewBox="0 0 256 256"
                    >
                      <rect
                        x="110"
                        y="160"
                        width="36"
                        height="80"
                        fill="#8B4513"
                        rx="8"
                      />

                      <circle cx="128" cy="100" r="60" fill="#228B22" />
                      <circle cx="88" cy="90" r="40" fill="#2E8B57" />
                      <circle cx="168" cy="90" r="40" fill="#2E8B57" />
                    </svg>
                  </div>

                  <div className="flex flex-col gap-1">
                    <h2 className="text-[#0e1b13] text-base font-bold leading-tight">
                      Increase customer trust and loyalty
                    </h2>
                  </div>
                </div>

                <div className="flex flex-1 gap-3 rounded-lg border border-[#d1e6d8] bg-[#f8fbf9] p-4 flex-row items-center justify-center">
                  <div
                    className="text-[#0e1b13]"
                    data-icon="Store"
                    data-size="24px"
                    data-weight="regular"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24px"
                      height="24px"
                      fill="currentColor"
                      viewBox="0 0 256 256"
                    >
                      <circle
                        cx="128"
                        cy="128"
                        r="88"
                        stroke="#4A90E2"
                        stroke-width="8"
                        fill="none"
                      />

                      <circle cx="128" cy="128" r="12" fill="#4A90E2" />

                      <line
                        x1="128"
                        y1="40"
                        x2="128"
                        y2="116"
                        stroke="#4A90E2"
                        stroke-width="4"
                      />
                      <line
                        x1="208"
                        y1="128"
                        x2="144"
                        y2="128"
                        stroke="#4A90E2"
                        stroke-width="4"
                      />
                      <line
                        x1="128"
                        y1="216"
                        x2="128"
                        y2="140"
                        stroke="#4A90E2"
                        stroke-width="4"
                      />
                      <line
                        x1="48"
                        y1="128"
                        x2="112"
                        y2="128"
                        stroke="#4A90E2"
                        stroke-width="4"
                      />

                      <circle cx="128" cy="40" r="10" fill="#4A90E2" />
                      <circle cx="208" cy="128" r="10" fill="#4A90E2" />
                      <circle cx="128" cy="216" r="10" fill="#4A90E2" />
                      <circle cx="48" cy="128" r="10" fill="#4A90E2" />
                    </svg>
                  </div>

                  <div className="flex flex-col gap-1">
                    <h2 className="text-[#0e1b13] text-base font-bold leading-tight">
                      Meet corporate social responsibility goals
                    </h2>
                  </div>
                </div>

                <div className="flex flex-1 gap-3 rounded-lg border border-[#d1e6d8] bg-[#f8fbf9] p-4 flex-row items-center justify-center">
                  <div
                    className="text-[#0e1b13]"
                    data-icon="Store"
                    data-size="24px"
                    data-weight="regular"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24px"
                      height="24px"
                      fill="currentColor"
                      viewBox="0 0 256 256"
                    >
                      <path
                        d="M144 16L96 144H160L112 240L160 112H96L144 16Z"
                        fill="#FDD835"
                        stroke="#FBC02D"
                        stroke-width="8"
                        stroke-linejoin="round"
                      />
                    </svg>
                  </div>

                  <div className="flex flex-col gap-1">
                    <h2 className="text-[#0e1b13] text-base font-bold leading-tight">
                      Stay ahead of changing regulations
                    </h2>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center px-4 pt-10 pb-6 gap-6">

              <div className="flex flex-col items-center gap-4">
                {userClass === "MBR" && (
                    <>
                    <h1 className="text-[#0e1b13] text-[22px] font-bold leading-tight tracking-[-0.015em] max-w-[720px]">
                      Ready to get started?
                    </h1>

                    <div className="flex gap-4">
                      <button
                        onClick={navigateToCarbonTracker}
                        className="flex min-w-[50px] max-w-[150px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 @[480px]:h-12 @[480px]:px-5 bg-[#1cca59] text-[#0e1b13] text-sm font-bold leading-normal tracking-[0.015em] @[480px]:text-base @[480px]:font-bold @[480px]:leading-normal @[480px]:tracking-[0.015em] hover:bg-[#16a34a] hover:text-white transition-all duration-300 ease-in-out"
                      >
                        <span className="truncate">Get Started</span>
                      </button>

                      <button
                        onClick={() => window.location.href = '/PointCriteriaUser'}
                        className="flex min-w-[50px] max-w-[150px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 @[480px]:h-12 @[480px]:px-5 bg-[#e7edf3] text-[#0e141b] text-sm font-bold leading-normal tracking-[0.015em] @[480px]:text-base @[480px]:font-bold @[480px]:leading-normal @[480px]:tracking-[0.015em] hover:bg-gray-400 hover:text-white transition-all duration-300 ease-in-out"
                      >
                        <span className="truncate">Learn More</span>
                      </button>
                    </div>
                    </>
                    
                  )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomePage;