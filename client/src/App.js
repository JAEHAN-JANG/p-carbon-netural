import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Main from "./pages/Main/Main";
import Login from "./pages/Login/Login";
import Signup from "./pages/Signup/Signup";
import Layout from "./components/Layout";
import Home from "./components/Home";
import Neutralization from "./components/Neutralization";
import Community from "./components/Community";
import Profile from "./components/Profile";
import ProductCategories from "./components/ProductCategories";
import ProductManagement from "./components/ProductManagement";
import CategoryList from "./components/CategoryList";
import ProductList from "./components/ProductList";
import CarbonManaged from "./components/CarbonManaged";
import WritePage from "./pages/community/write";
import ViewPage from "./pages/community/view";
import DeletePage from "./pages/community/delete";
import ModifyPage from "./pages/community/modify";
import CheckPw from "./pages/community/checkpw";
import PurchasePage from "./components/PurchasePage";
import UserManagement from "./components/UserManagement";
import Signup2 from "./pages/Signup/Signup2";
import UserData from "./components/UserData";
import AddEmission from "./pages/UserData/AddEmission";
import EditEmission from "./pages/UserData/EditEmission";
import ChatbotIcon from "./components/ChatbotIcon";
import UserEvidence from "./components/UserEvidence";
import EvidenceManagement from "./components/EvidenceManagement";
import PointCriteriaUser from "./components/PointCriteriaUser";
import PointCriteriaAdmin from "./components/PointCriteriaAdmin";
import SimpleCarbonTracker from "./pages/CarbonTracker/SimpleCarbonTracker";
import DetailedCarbonTracker from "./pages/CarbonTracker/DetailedCarbonTracker";

function App() {
  return (
    <Router>
      <div className="app">
        <Routes>
          {/* 로그인 화면을 기본 경로로 설정 */}
          <Route path="/" element={<Main />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/signup2" element={<Signup2 />} />

          {/* 공통 Layout */}
          <Route element={<Layout />}>
            <Route path="/Home" element={<Home />} />
            <Route path="/neutralization" element={<Neutralization />} />
            <Route path="/community/*" element={<Community />} />
            <Route path="/community/write" element={<WritePage />} />
            <Route path="/community/view/:id" element={<ViewPage />} />
            <Route path="/community/delete/:id" element={<DeletePage />} />
            <Route path="/community/modify/:id" element={<ModifyPage />} />
            <Route path="/community/checkpw/:id" element={<CheckPw />} />
            <Route path="/Profile" element={<Profile />} />
            <Route path="/productCategories" element={<ProductCategories />} />
            <Route path="/productManagement" element={<ProductManagement />} />
            <Route path="/category/list" element={<CategoryList />} />
            <Route path="/product/list" element={<ProductList />} />
            <Route path="/carbonManaged" element={<CarbonManaged />} />
            {/* 2024 12 02 */}
            <Route path="/EcoStore" element={<ProductList />} />
            <Route path="/purchase/list" element={<PurchasePage />} />
            <Route path="/userManage" element={<UserManagement />} />
            <Route path="/userData" element={<UserData />} />
            <Route path="/carbon-tracker" element={<SimpleCarbonTracker />} />
            <Route path="/detailed-carbon-tracker" element={<DetailedCarbonTracker />} />
            <Route path="/addEmission" element={<AddEmission />} />
            <Route path="/editEmission" element={<EditEmission />} />
            <Route path="/userEvidence" element={<UserEvidence />} />
            <Route path="/evidenceManagement" element={<EvidenceManagement />} />
            <Route path="/PointCriteriaUser" element={<PointCriteriaUser />} />
            <Route path="/PointCriteriaAdmin" element={<PointCriteriaAdmin />} />
          </Route>
          {/* CarbonTracker 별도 라우트 */}
        </Routes>
        <ChatbotIcon />
      </div>
    </Router>
  );
}

export default App;
