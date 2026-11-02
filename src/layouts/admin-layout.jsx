import "./admin-layout.css";
import Sidebar from "../components/sidebar";
import Header from "../components/header";
import "./admin-layout.css";

function AdminLayout({
  currentUser,
  onLogout,
  activePage,
  onNavigate,
  children,
}) {
  return (
    <div className="admin-layout">
      <Sidebar
        activePage={activePage}
        onNavigate={onNavigate}
      />

      <div className="admin-main">
        <Header
          currentUser={currentUser}
          onLogout={onLogout}
        />

        <main className="admin-content">
          {children}
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;

