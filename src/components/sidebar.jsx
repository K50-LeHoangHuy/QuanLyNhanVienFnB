
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  Clock,
  Wallet,
  ClipboardList,
  ChartNoAxesCombined,
  Settings,
  Coffee,
} from "lucide-react";

function Sidebar({ activePage, onNavigate }) {
  const menuItems = [
    { id: "dashboard", icon: LayoutDashboard, label: "Tổng quan" },
    { id: "employees", icon: Users, label: "Nhân viên" },
    { id: "shifts", icon: CalendarDays, label: "Lịch làm việc" },
    { id: "attendance", icon: Clock, label: "Chấm công" },
    { id: "payroll", icon: Wallet, label: "Bảng lương" },
    { id: "requests", icon: ClipboardList, label: "Yêu cầu" },
    { id: "reports", icon: ChartNoAxesCombined, label: "Báo cáo" },
    { id: "settings", icon: Settings, label: "Cài đặt" },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">
          <Coffee size={25} />
        </div>

        <div>
          <h2>F&B People</h2>
          <span>Management System</span>
        </div>
      </div>

      <div className="sidebar-menu">
        <p className="menu-heading">MENU CHÍNH</p>

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

export default Sidebar;
