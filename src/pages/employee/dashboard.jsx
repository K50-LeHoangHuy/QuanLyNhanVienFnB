
import { useMemo } from "react";
import {
  CalendarDays,
  Clock,
  ClipboardList,
  Wallet,
  ArrowRight,
  Coffee,
  UserRound,
} from "lucide-react";
import "./dashboard.css";

function Dashboard({ currentUser }) {
  const today = new Date().toLocaleDateString("en-CA");

  const employee = useMemo(() => {
    const employees = JSON.parse(
      localStorage.getItem("employees") || "[]"
    );

    return employees.find(
      (item) =>
        String(item.employeeCode) ===
          String(currentUser?.employeeCode) ||
        String(item.id) === String(currentUser?.employeeId)
    );
  }, [currentUser]);

  const employeeId = employee?.id ?? currentUser?.employeeId;

  const myAssignments = useMemo(() => {
    const assignments = JSON.parse(
      localStorage.getItem("shiftAssignments") || "[]"
    );

    return assignments
      .filter(
        (item) =>
          String(item.employeeId) === String(employeeId) &&
          item.status !== "DA_HUY"
      )
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [employeeId]);

  const todayAssignments = myAssignments.filter(
    (item) => item.date === today
  );

  const upcomingAssignments = myAssignments.filter(
    (item) => item.date >= today
  );

  const attendanceRecords = JSON.parse(
    localStorage.getItem("attendanceRecords") || "[]"
  );

  const todayAttendance = attendanceRecords.filter(
    (item) =>
      String(item.employeeId) === String(employeeId) &&
      item.date === today
  );

  const nextShift = upcomingAssignments[0];

  const formatDate = (date) => {
    if (!date) return "";

    return new Date(date + "T00:00:00").toLocaleDateString("vi-VN");
  };

  return (
    <div className="employee-dashboard">
      <div className="employee-welcome">
        <div>
          <p className="welcome-label">TRANG NHÂN VIÊN</p>
          <h1>Xin chào, {currentUser?.name || "Nhân viên"}!</h1>
          <p>
            Chúc bạn có một ngày làm việc thật hiệu quả.
          </p>
        </div>

        <div className="welcome-icon">
          <Coffee size={42} />
        </div>
      </div>

      <div className="employee-info-card">
        <div className="employee-avatar">
          <UserRound size={28} />
        </div>

        <div>
          <h3>{currentUser?.name || "Nhân viên"}</h3>
          <p>
            Mã nhân viên: {currentUser?.employeeCode || "Chưa cập nhật"}
          </p>
        </div>
      </div>

      <div className="employee-stat-grid">
        <div className="employee-stat-card">
          <div className="employee-stat-icon blue">
            <CalendarDays size={22} />
          </div>
          <div>
            <p>Ca làm hôm nay</p>
            <h2>{todayAssignments.length}</h2>
          </div>
        </div>

        <div className="employee-stat-card">
          <div className="employee-stat-icon green">
            <Clock size={22} />
          </div>
          <div>
            <p>Hồ sơ chấm công</p>
            <h2>{todayAttendance.length}</h2>
          </div>
        </div>

        <div className="employee-stat-card">
          <div className="employee-stat-icon orange">
            <ClipboardList size={22} />
          </div>
          <div>
            <p>Ca làm sắp tới</p>
            <h2>{upcomingAssignments.length}</h2>
          </div>
        </div>

        <div className="employee-stat-card">
          <div className="employee-stat-icon purple">
            <Wallet size={22} />
          </div>
          <div>
            <p>Bảng lương</p>
            <h2>--</h2>
          </div>
        </div>
      </div>

      <div className="employee-dashboard-grid">
        <section className="employee-panel">
          <div className="employee-panel-header">
            <div>
              <h3>Lịch làm việc hôm nay</h3>
              <p>{formatDate(today)}</p>
            </div>
            <CalendarDays size={22} />
          </div>

          {todayAssignments.length > 0 ? (
            <div className="employee-shift-list">
              {todayAssignments.map((shift) => (
                <div className="employee-shift-item" key={shift.id}>
                  <div className="shift-time">
                    <Clock size={18} />
                    <strong>
                      {shift.startTime} - {shift.endTime}
                    </strong>
                  </div>

                  <div>
                    <h4>{shift.shiftName}</h4>
                    <span className="shift-status">
                      Đã được phân công
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="employee-empty">
              <CalendarDays size={32} />
              <p>Hôm nay bạn chưa có ca làm việc.</p>
            </div>
          )}
        </section>

        <section className="employee-panel">
          <div className="employee-panel-header">
            <div>
              <h3>Ca làm tiếp theo</h3>
              <p>Ca làm gần nhất của bạn</p>
            </div>
            <Clock size={22} />
          </div>

          {nextShift ? (
            <div className="next-shift-content">
              <span className="next-shift-date">
                {formatDate(nextShift.date)}
              </span>

              <h2>{nextShift.shiftName}</h2>

              <p>
                <Clock size={17} />
                {nextShift.startTime} - {nextShift.endTime}
              </p>
            </div>
          ) : (
            <div className="employee-empty">
              <Coffee size={32} />
              <p>Chưa có ca làm việc sắp tới.</p>
            </div>
          )}
        </section>
      </div>

      <section className="employee-panel attendance-summary">
        <div className="employee-panel-header">
          <div>
            <h3>Tình trạng chấm công hôm nay</h3>
            <p>Thông tin hồ sơ chấm công của bạn</p>
          </div>
          <Clock size={22} />
        </div>

        {todayAttendance.length > 0 ? (
          <div className="attendance-summary-list">
            {todayAttendance.map((record) => (
              <div className="attendance-summary-item" key={record.id}>
                <div>
                  <strong>{record.shiftName}</strong>
                  <p>
                    Check-in: {record.checkInTime || "Chưa Check-in"}
                  </p>
                  <p>
                    Check-out: {record.checkOutTime || "Chưa Check-out"}
                  </p>
                </div>

                <span className="attendance-pending">
                  {record.checkInStatus === "DA_DUYET" &&
                  record.checkOutStatus === "DA_DUYET"
                    ? "Đã duyệt"
                    : "Đang xử lý"}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="employee-empty">
            <Clock size={32} />
            <p>Chưa có hồ sơ chấm công hôm nay.</p>
          </div>
        )}
      </section>
    </div>
  );
}

export default Dashboard;
