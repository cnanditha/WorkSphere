import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Profile from "./pages/Profile";
import LeaveForm from "./pages/LeaveForm";
import LeaveApproval from "./pages/LeaveApproval";
import Payroll from "./pages/Payroll";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route path="/employee" element={
          <ProtectedRoute allowedRole="employee"><EmployeeDashboard /></ProtectedRoute>
        } />
        <Route path="/admin" element={
          <ProtectedRoute allowedRole="admin"><AdminDashboard /></ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute><Profile /></ProtectedRoute>
        } />
        <Route path="/leave" element={
          <ProtectedRoute allowedRole="employee"><LeaveForm /></ProtectedRoute>
        } />
        <Route path="/leave-approval" element={
          <ProtectedRoute allowedRole="admin"><LeaveApproval /></ProtectedRoute>
        } />
        <Route path="/payroll" element={
          <ProtectedRoute><Payroll /></ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}
export default App;