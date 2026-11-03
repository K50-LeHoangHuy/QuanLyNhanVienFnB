
import "./admin-layout.css";
import EmployeeSidebar from "../components/employee-sidebar";
import Header from "../components/header";

function EmployeeLayout({
  currentUser,
  onLogout,
  activePage,
  onNavigate,
  children,
}) {
  return (
    <div className="admin-layout">
      <EmployeeSidebar
        activePage={activePage}
        onNavigate={onNavigate}
      />

      <div className="admin-main">
        <Header
          currentUser={currentUser}
          onLogout={onLogout}
          roleLabel="Nhân viên"
        />

        <main className="admin-content">
          {children}
        </main>
      </div>
    </div>
  );
}

export default EmployeeLayout;
