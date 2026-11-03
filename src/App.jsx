
import { useState } from "react";

import Login from "./pages/auth/login";

import Dashboard from "./pages/admin/dashboard";
import Employees from "./pages/admin/employees";
import Shifts from "./pages/admin/shifts";
import Attendance from "./pages/admin/attendance";

import EmployeeDashboard from "./pages/employee/dashboard";
import EmployeeShifts from "./pages/employee/shifts";
import EmployeeAttendance from "./pages/employee/attendance";

import AdminLayout from "./layouts/admin-layout";
import EmployeeLayout from "./layouts/employee-layout";

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [activePage, setActivePage] = useState("dashboard");

  const handleLogout = () => {
    setCurrentUser(null);
    setActivePage("dashboard");
  };

  // Chưa đăng nhập
  if (!currentUser) {
    return <Login onLogin={setCurrentUser} />;
  }

  // Giao diện Quản lý
  if (currentUser.role === "admin") {
    return (
      <AdminLayout
        currentUser={currentUser}
        onLogout={handleLogout}
        activePage={activePage}
        onNavigate={setActivePage}
      >
        {activePage === "dashboard" && (
          <Dashboard currentUser={currentUser} />
        )}

        {activePage === "employees" && <Employees />}

        {activePage === "shifts" && <Shifts />}

        {activePage === "attendance" && <Attendance />}
      </AdminLayout>
    );
  }

  // Giao diện Nhân viên
  return (
    <EmployeeLayout
      currentUser={currentUser}
      onLogout={handleLogout}
      activePage={activePage}
      onNavigate={setActivePage}
    >
{activePage === "dashboard" && (
  <EmployeeDashboard currentUser={currentUser} />
)}

{activePage === "shifts" && (
  <EmployeeShifts currentUser={currentUser} />
)}

{activePage === "attendance" && (
  <EmployeeAttendance currentUser={currentUser} />
)}

{activePage !== "dashboard" &&
  activePage !== "shifts" &&
  activePage !== "attendance" && (
  <div>
    <h2>Chức năng đang được phát triển</h2>
    <p>
      Chúng ta sẽ sớm hoàn thiện chức năng này.
    </p>
  </div>
)}
    </EmployeeLayout>
  );
}

export default App;
