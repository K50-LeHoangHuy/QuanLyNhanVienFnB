
import { useState } from "react";
import Login from "./pages/auth/login";
import Dashboard from "./pages/admin/dashboard";
import Employees from "./pages/admin/employees";
import AdminLayout from "./layouts/admin-layout";

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

  // Đăng nhập Admin
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

        {activePage === "employees" && (
          <Employees />
        )}
      </AdminLayout>
    );
  }

  // Đăng nhập Nhân viên
  return (
    <div style={{ padding: "40px" }}>
      <h1>Dashboard Nhân viên</h1>
      <h2>Xin chào, {currentUser.name}!</h2>
      <p>Mã nhân viên: {currentUser.employeeCode}</p>

      <button onClick={handleLogout}>
        Đăng xuất
      </button>
    </div>
  );
}

export default App;
