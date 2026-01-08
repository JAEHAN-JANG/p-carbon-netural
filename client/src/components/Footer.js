import React from "react";

function Footer() {
  return (
    <footer className="flex justify-center bg-[#f8fbf9]">
      <div className="flex max-w-[960px] flex-1 flex-col">
        <footer className="flex flex-col gap-8 px-5 py-10 text-center items-center">
          {/* 소셜 아이콘 */}
          <div className="flex flex-wrap justify-center gap-6 items-center">
            {/* 유튜브 아이콘 */}
            <a
              href="https://www.youtube.com/watch?v=GRBDO47yIzY" // 2050 탄소중립 알아보기 (국가환경교육 통합플랫폼)
              className="transition-transform duration-200 hover:scale-110"
            >
              <div
                className="text-[#509568]"
                data-icon="YouTubeLogo"
                data-size="40px" // 크기 조정
                data-weight="regular"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="40px"
                  height="40px"
                  fill="currentColor"
                  viewBox="0 0 512 512"
                >
                  <path d="M499.7 110.9C489.5 73.7 462.7 46.5 425.4 36.2 387 25 256 25 256 25S125 25 86.6 36.2C49.3 46.5 22.5 73.7 12.3 110.9 0 152.4 0 256 0 256s0 103.6 12.3 145.1c10.2 37.2 37 64.4 74.3 74.7C125 487 256 487 256 487s131 0 169.4-11.2c37.3-10.3 64.1-37.5 74.3-74.7 12.3-41.5 12.3-145.1 12.3-145.1s0-103.6-12.3-145.1zM204.8 347.4V164.6L347.2 256l-142.4 91.4z" />
                </svg>
              </div>
            </a>

            {/* 뉴스 아이콘 */}
            <a
              href="http://www.iemnews.com/contents/main/"
              className="transition-transform duration-200 hover:scale-110"
            >
              <div
                className="text-[#509568]"
                data-icon="NewsLogo"
                data-size="40px" // 크기 동일화
                data-weight="regular"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="40px"
                  height="40px"
                  fill="currentColor"
                  viewBox="0 0 256 256"
                >
                  <path d="M232,56H24a16,16,0,0,0-16,16V184a16,16,0,0,0,16,16H232a16,16,0,0,0,16-16V72A16,16,0,0,0,232,56ZM120,144H40V120H120Zm0-32H40V88H120ZM232,184H24V72H232Z" />
                </svg>
              </div>
            </a>

            {/* 인스타그램 아이콘 */}
            <a
              href="https://www.instagram.com/carbon_tracker/"
              className="transition-transform duration-200 hover:scale-110"
            >
              <div
                className="text-[#509568]"
                data-icon="InstagramLogo"
                data-size="40px" // 크기 동일화
                data-weight="regular"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="40px"
                  height="40px"
                  fill="currentColor"
                  viewBox="0 0 256 256"
                >
                  <path d="M216,24H40A16,16,0,0,0,24,40V216a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V40A16,16,0,0,0,216,24Zm0,192H40V40H216V216ZM96,112v64a8,8,0,0,1-16,0V112a8,8,0,0,1,16,0Zm88,28v36a8,8,0,0,1-16,0V140a20,20,0,0,0-40,0v36a8,8,0,0,1-16,0V112a8,8,0,0,1,15.79-1.78A36,36,0,0,1,184,140ZM100,84A12,12,0,1,1,88,72,12,12,0,0,1,100,84Z" />
                </svg>
              </div>
            </a>
          </div>

          {/* 하단 텍스트 */}
          <p className="text-[#509568] text-sm font-medium leading-normal">
            &copy; 2024 Carbon Tracker. All Rights Reserved.
          </p>
        </footer>
      </div>
    </footer>
  );
}

export default Footer;