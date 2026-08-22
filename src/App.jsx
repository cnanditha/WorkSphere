import { BrowserRouter, Routes, Route } from "react-router-dom";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Profile from "./pages/Profile";
import LeaveForm from "./pages/LeaveForm";
import LeaveApproval from "./pages/LeaveApproval";
import Payroll from "./pages/Payroll";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/employee" element={<EmployeeDashboard />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/leave" element={<LeaveForm />} />
        <Route path="/leave-approval" element={<LeaveApproval />} />
        <Route path="/payroll" element={<Payroll />} />
      </Routes>
    </BrowserRouter>
  );
}
export default App;