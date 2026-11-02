
import "./dashboard.css";

function Dashboard({ currentUser }) {
  const statistics = [
    {
      title: "Tổng nhân viên",
      value: "32",
      description: "Nhân viên trong hệ thống",
      icon: "👥",
    },
    {
      title: "Đang làm việc",
      value: "12",
      description: "Nhân viên hôm nay",
      icon: "🟢",
    },
    {
      title: "Ca làm hôm nay",
      value: "8",
      description: "Tổng số ca được phân công",
      icon: "📅",
    },
    {
      title: "Đơn chờ duyệt",
      value: "3",
      description: "Yêu cầu cần xử lý",
      icon: "📋",
    },
  ];

  return (
    <div className="dashboard">
      <div className="dashboard-heading">
        <div>
          <h1>Tổng quan</h1>
          <p>Chào mừng trở lại, {currentUser?.name || "Admin"}!</p>
        </div>

        <div className="dashboard-date">
          📅 Tổng quan hoạt động
        </div>
      </div>

      <div className="statistics-grid">
        {statistics.map((item, index) => (
          <div className="stat-card" key={index}>
            <div className="stat-card-top">
              <span>{item.title}</span>
              <span className="stat-icon">{item.icon}</span>
            </div>

            <h2>{item.value}</h2>
            <p>{item.description}</p>
          </div>
        ))}
      </div>

      <div className="dashboard-content">
        <section className="dashboard-panel">
          <h3>Hoạt động hôm nay</h3>
          <p className="panel-description">
            Tình hình hoạt động của cửa hàng
          </p>

          <div className="activity-item">
            <span className="activity-dot"></span>
            <div>
              <strong>Nhân viên đang làm việc</strong>
              <p>12 nhân viên đang trong ca</p>
            </div>
          </div>

          <div className="activity-item">
            <span className="activity-dot"></span>
            <div>
              <strong>Lịch làm việc</strong>
              <p>8 ca làm đã được phân công</p>
            </div>
          </div>

          <div className="activity-item">
            <span className="activity-dot"></span>
            <div>
              <strong>Yêu cầu nhân viên</strong>
              <p>Có 3 yêu cầu đang chờ xử lý</p>
            </div>
          </div>
        </section>

        <section className="dashboard-panel">
          <h3>Thông tin hệ thống</h3>
          <p className="panel-description">
            F&B People - Quản lý nhân viên F&B
          </p>

          <div className="system-info">
            <div>
              <span>Vai trò</span>
              <strong>Quản trị viên</strong>
            </div>

            <div>
              <span>Tài khoản</span>
              <strong>{currentUser?.name || "Admin"}</strong>
            </div>

            <div>
              <span>Trạng thái</span>
              <strong className="status-active">Đang hoạt động</strong>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Dashboard;
