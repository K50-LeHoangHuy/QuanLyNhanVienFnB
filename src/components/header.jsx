
import { Search, Bell, ChevronDown } from "lucide-react";

function Header({ currentUser, onLogout }) {
  return (
    <header className="admin-header">
      <div className="header-search">
        <Search size={18} />
        <input
          type="text"
          placeholder="Tìm kiếm..."
        />
      </div>

      <div className="header-actions">
        <button className="notification-button" type="button">
          <Bell size={20} />
          <span className="notification-dot"></span>
        </button>

        <div className="header-profile">
          <div className="profile-avatar">
            {(currentUser?.name || "A").charAt(0).toUpperCase()}
          </div>

          <div className="profile-info">
            <strong>{currentUser?.name || "Admin"}</strong>
            <span>Quản trị viên</span>
          </div>

          <button
            className="logout-button"
            type="button"
            onClick={onLogout}
            title="Đăng xuất"
          >
            <ChevronDown size={18} />
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header;
