import React, { useState, useEffect } from "react";
import axios from "axios";
import MonthlySummarySection from "./CarbonManaged/MonthlySummarySection";
import ComparisonSection from "./CarbonManaged/ComparisonSection";
import MonthlyComparisonSection from "./CarbonManaged/MonthlyComparisonSection";

function CarbonManaged() {
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");

  const selectedKeys = ["electricity", "gas", "water", "fuel", "waste"];
  const comparisonKeys = ["total_carbon", "tree_loss", ...selectedKeys];

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/auth/check-session",
          { withCredentials: true }
        );
        if (response.data.loggedIn) {
          setUserName(response.data.user.username);
          setUserEmail(response.data.user.email);
        }
      } catch (error) {
        console.error("사용자 정보를 가져오는 데 실패했습니다.", error);
      }
    };

    fetchUserData();
  }, []);

  return (
    <div className="min-h-screen bg-[#f8fbf9] p-4 pt-8 flex flex-col gap-8">

      <div className="bg-white shadow-lg rounded-lg p-8">
        <MonthlySummarySection
          userName={userName}
          email={userEmail}
          selectedKeys={selectedKeys}
        />
      </div>

      <div className="bg-white shadow-lg rounded-lg p-8">
        <ComparisonSection email={userEmail} comparisonKeys={comparisonKeys} />
      </div>

      <div className="bg-white shadow-lg rounded-lg p-8">
        <MonthlyComparisonSection
          email={userEmail}
          comparisonKeys={comparisonKeys}
        />
      </div>

    </div>
  );
}

export default CarbonManaged;