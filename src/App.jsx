import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import DashboardLayout from "./layouts/DashboardLayout";
import Login from "./pages/auth/Login";
import DashboardOverview, { CoursesPanel, RevenuePanel, DoubtsPanel } from "./pages/Dashboard";
import { GoLivePanel, TeacherRecordedPanel } from "./pages/TeacherDashboard";

import CourseList from "./pages/courses/CourseList";
import CreateCourse from "./pages/courses/CreateCourse";
import CourseEditor from "./pages/courses/CourseEditor";
import TeacherBatches from "./pages/batches/TeacherBatches";
import TeacherBatchDetail from "./pages/batches/TeacherBatchDetail";
import CreateDPP from "./pages/batches/CreateDPP";
import TeacherBatchAnalytics from "./pages/analytics/TeacherBatchAnalytics";
import LiveRoom from "./pages/live/LiveRoom";
import BatchList from "./pages/batches/BatchList";
import UserList from "./pages/users/UserList";
import PlanManagement from "./pages/payments/PlanManagement";
import GeneralSettings from "./pages/settings/GeneralSettings";
import CreateTest from "./pages/tests/CreateTest";
import TestList from "./pages/tests/TestList";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/login" element={<Login />} />

          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<DashboardOverview />} />
            
            {/* Admin View Routes (Futuristic Panels) */}
            <Route path="admin/courses" element={<CoursesPanel />} />
            <Route path="admin/revenue" element={<RevenuePanel />} />
            <Route path="admin/doubts" element={<DoubtsPanel />} />
            
            {/* Management Routes */}
            <Route path="courses" element={<CourseList />} />
            <Route path="courses/new" element={<CreateCourse />} />
            <Route path="courses/:id" element={<CourseEditor />} />
            <Route path="batches" element={<BatchList />} />
            <Route path="plans" element={<PlanManagement />} />
            <Route path="doubts" element={<DoubtsPanel />} />
            <Route path="users" element={<UserList />} />
            <Route path="tests" element={<TestList />} />
            <Route path="tests/new" element={<CreateTest />} />

            {/* Teacher Routes */}
            <Route path="teacher/batches" element={<TeacherBatches />} />
            <Route path="teacher/batch/:id" element={<TeacherBatchDetail />} />
            <Route path="teacher/batch/:id/analytics" element={<TeacherBatchAnalytics />} />
            <Route path="teacher/batch/:id/dpp/new" element={<CreateDPP />} />
            <Route path="teacher/live" element={<GoLivePanel />} />
            <Route path="teacher/live/:sessionId" element={<LiveRoom />} />
            <Route path="teacher/resources" element={<TeacherRecordedPanel />} />

            <Route path="settings" element={<GeneralSettings />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
