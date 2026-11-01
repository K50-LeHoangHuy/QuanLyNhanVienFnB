
import { useState } from "react";
import Login from "./pages/auth/login";

function App() {
  const [currentUser, setCurrentUser] = useState(null);

  const handleLogout = () => {
    setCurrentUser(null);
  };

  // Chưa đăng nhập
  if (!currentUser) {
    return <Login onLogin={setCurrentUser} />;
  }

  // Đăng nhập Admin
  if (currentUser.role === "admin") {
    return (
      <div style={{ padding: "40px" }}>
        <h1>Dashboard Admin</h1>
        <h2>Xin chào, {currentUser.name}!</h2>
        <p>Chào mừng đến với hệ thống F&B People.</p>

        <button onClick={handleLogout}>
          Đăng xuất
        </button>
      </div>
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
