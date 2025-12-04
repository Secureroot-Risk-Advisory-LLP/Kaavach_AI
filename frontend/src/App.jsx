import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setUser } from "./store/slices/authSlice";
import { setTheme } from "./store/slices/themeSlice";
import { authService } from "./services/authService";

// Layout + Route Guard
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";

// Pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import HackerDashboard from "./pages/dashboards/HackerDashboard";
import CompanyDashboard from "./pages/dashboards/CompanyDashboard";
import AdminDashboard from "./pages/dashboards/AdminDashboard";
import Programs from "./pages/Programs";
import ProgramDetail from "./pages/ProgramDetail";
import Leaderboard from "./pages/Leaderboard";
import Feed from "./pages/Feed";
import Profile from "./pages/Profile";

// Extra Pages
import Marketplace from "./pages/Marketplace";
import Writeups from "./pages/Writeups";
import JobBoard from "./pages/JobBoard";
import KnowledgeBase from "./pages/KnowledgeBase";
import BreachAlerts from "./pages/BreachAlerts";

// Analytics Pages
import HackerAnalytics from "./pages/analytics/HackerAnalytics";
import CompanyAnalytics from "./pages/analytics/CompanyAnalytics";
import AdminAnalytics from "./pages/analytics/AdminAnalytics";

function App() {
  const dispatch = useDispatch();
  const { token, user } = useSelector((state) => state.auth);

  useEffect(() => {
    // Theme setup
    const savedTheme = localStorage.getItem("theme") || "dark";
    dispatch(setTheme(savedTheme));
    document.documentElement.classList.toggle("dark", savedTheme === "dark");

    // Auth setup
    if (token && !user) {
      authService
        .getMe()
        .then((userData) => dispatch(setUser(userData)))
        .catch(() => localStorage.removeItem("token"));
    }
  }, [dispatch, token, user]);

  // Role-based redirect
  const getDashboardRoute = () => {
    if (!user) return "/login";
    switch (user.role) {
      case "hacker":
        return "/dashboard/hacker";
      case "company":
        return "/dashboard/company";
      case "admin":
        return "/dashboard/admin";
      default:
        return "/";
    }
  };

  return (
    <Routes>
      {/* Auth Routes */}
      <Route
        path="/login"
        element={!token ? <Login /> : <Navigate to={getDashboardRoute()} />}
      />
      <Route
        path="/register"
        element={!token ? <Register /> : <Navigate to={getDashboardRoute()} />}
      />

      {/* Main App Layout */}
      <Route element={<Layout />}>
        {/* ⭐ IMPORTANT FIX — Home page loads correctly now */}
        <Route index element={<Home />} />

        {/* Public pages */}
        <Route path="/programs" element={<Programs />} />
        <Route path="/programs/:id" element={<ProgramDetail />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/feed" element={<Feed />} />

        {/* Extra sections */}
        <Route path="/marketplace" element={<Marketplace />} />
        <Route path="/writeups" element={<Writeups />} />
        <Route path="/jobs" element={<JobBoard />} />
        <Route path="/kb" element={<KnowledgeBase />} />
        <Route path="/breach-alerts" element={<BreachAlerts />} />

        {/* Analytics */}
        <Route
          path="/analytics/hacker"
          element={
            <ProtectedRoute allowedRoles={["hacker"]}>
              <HackerAnalytics />
            </ProtectedRoute>
          }
        />

        <Route
          path="/analytics/company"
          element={
            <ProtectedRoute allowedRoles={["company"]}>
              <CompanyAnalytics />
            </ProtectedRoute>
          }
        />

        <Route
          path="/analytics/admin"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminAnalytics />
            </ProtectedRoute>
          }
        />

        {/* Dashboards */}
        <Route
          path="/dashboard/hacker"
          element={
            <ProtectedRoute allowedRoles={["hacker"]}>
              <HackerDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/company"
          element={
            <ProtectedRoute allowedRoles={["company"]}>
              <CompanyDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/admin"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Profile */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;
