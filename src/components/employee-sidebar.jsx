
import {
  LayoutDashboard,
  CalendarDays,
  Clock,
  Wallet,
  ClipboardList,
  UserRound,
  Coffee,
} from "lucide-react";

function EmployeeSidebar({ activePage, onNavigate }) {
  const menuItems = [
    {
      id: "dashboard",
      icon: LayoutDashboard,
      label: "Tổng quan",
    },
    {
      id: "shifts",
      icon: CalendarDays,
      label: "Lịch làm việc",
    },
    {
      id: "attendance",
      icon: Clock,
      label: "Chấm công",
    },
    {
      id: "requests",
      icon: ClipboardList,
      label: "Yêu cầu",
    },
    {
      id: "payroll",
      icon: Wallet,
      label: "Bảng lương",
    },
    {
      id: "profile",
      icon: UserRound,
      label: "Thông tin cá nhân",
    },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">
          <Coffee size={25} />
        </div>

        <div>
          <h2>F&B People</h2>
          <span>Employee Portal</span>
        </div>
      </div>

      <div className="sidebar-menu">
        <p className="menu-heading">MENU NHÂN VIÊN</p>

        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <button
              type="button"
              className={`sidebar-item ${
                activePage === item.id ? "active" : ""
              }`}
              key={item.id}
              onClick={() => onNavigate(item.id)}
            >
              <Icon size={19} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      <div className="sidebar-footer">
        <div className="sidebar-footer-icon">☕</div>
        <div>
          <strong>F&B People</strong>
          <p>Phiên bản 1.0</p>
        </div>
      </div>
    </aside>
  );
}

export default EmployeeSidebar;
